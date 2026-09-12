#Le fichier principal main.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.routers import auth
from app.security import require_admin

from app.schemas import UserOut, UserRoleUpdate
from app.database import Base, engine, get_db
from app.models import db_models
from app.schemas import PredictionInput, PredictionOutput, PredictionHistoryOut
from app.ml_service import predict_risk

# Créer les tables dans la base de données au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Prédiction Diabète",
    description="Outil pédagogique de sensibilisation au risque de diabète (ne remplace pas un diagnostic médical).",
    version="1.0.0",
)

# Autoriser le frontend React à appeler cette API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "API de prédiction du risque de diabète - à visée pédagogique uniquement"}


@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput, db: Session = Depends(get_db)):
    result = predict_risk(data.dict())

    # Sauvegarder dans l'historique anonyme
    entry = db_models.Prediction(
        pregnancies=data.pregnancies,
        glucose=data.glucose,
        blood_pressure=data.blood_pressure,
        skin_thickness=data.skin_thickness,
        insulin=data.insulin,
        bmi=data.bmi,
        diabetes_pedigree=data.diabetes_pedigree,
        age=data.age,
        risk_score=result["risk_score"],
        prediction=result["prediction"],
    )
    db.add(entry)
    db.commit()

    return result

@app.get("/history", response_model=list[PredictionHistoryOut])
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """Renvoie les derniers questionnaires remplis (anonymes)."""
    results = (
        db.query(db_models.Prediction)
        .order_by(db_models.Prediction.created_at.desc())
        .limit(limit)
        .all()
    )
    return results

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    """Statistiques agrégées sur l'ensemble des questionnaires."""
    total = db.query(db_models.Prediction).count()

    if total == 0:
        return {
            "total_predictions": 0,
            "high_risk_count": 0,
            "high_risk_percentage": 0,
            "average_risk_score": 0,
            "average_age": 0,
            "average_bmi": 0,
        }

    high_risk_count = (
        db.query(db_models.Prediction)
        .filter(db_models.Prediction.prediction == 1)
        .count()
    )

    avg_risk = db.query(func.avg(db_models.Prediction.risk_score)).scalar()
    avg_age = db.query(func.avg(db_models.Prediction.age)).scalar()
    avg_age = int(round(avg_age)) if avg_age is not None else 0
    avg_bmi = db.query(func.avg(db_models.Prediction.bmi)).scalar()

    return {
        "total_predictions": total,
        "high_risk_count": high_risk_count,
        "high_risk_percentage": round((high_risk_count / total) * 100, 1),
        "average_risk_score": round(avg_risk, 3),
        "average_age": avg_age,
        "average_bmi": round(avg_bmi, 1),
    }

@app.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    """Liste tous les utilisateurs (admin uniquement)."""
    return db.query(db_models.User).all()


@app.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Modifie le rôle d'un utilisateur (admin uniquement)."""
    user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if role_data.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Rôle invalide (user ou admin uniquement)")

    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return user