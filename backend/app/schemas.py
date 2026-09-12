#Les schémas Pydantic (validation des données)

from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- Schémas pour la prédiction ---

class PredictionInput(BaseModel):
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int

class PredictionOutput(BaseModel):
    risk_score: float          # probabilité entre 0 et 1
    prediction: int            # 0 ou 1
    risk_label: str            # "Faible", "Modéré", "Élevé"
    top_factors: list[dict]    # facteurs les plus influents (SHAP)
    recommendations: list[str] # recommandations générales

# --- Schémas pour l'authentification ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Schéma pour l'historique ---

class PredictionHistoryOut(BaseModel):
    id: int
    created_at: datetime
    glucose: float
    bmi: float
    age: int
    risk_score: float
    prediction: int

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str