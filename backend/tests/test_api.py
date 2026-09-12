from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """La route racine répond correctement."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_predict_valid_data():
    """L'endpoint /predict renvoie une prédiction cohérente avec des données valides."""
    payload = {
        "pregnancies": 6,
        "glucose": 148,
        "blood_pressure": 72,
        "skin_thickness": 35,
        "insulin": 169.5,
        "bmi": 33.6,
        "diabetes_pedigree": 0.627,
        "age": 50,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 1
    assert data["prediction"] in [0, 1]
    assert data["risk_label"] in ["Faible", "Modéré", "Élevé"]
    assert len(data["top_factors"]) == 3
    assert len(data["recommendations"]) > 0


def test_predict_missing_field():
    """L'API rejette une requête avec un champ manquant."""
    payload = {
        "pregnancies": 6,
        "glucose": 148,
        # blood_pressure manquant volontairement
        "skin_thickness": 35,
        "insulin": 169.5,
        "bmi": 33.6,
        "diabetes_pedigree": 0.627,
        "age": 50,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # erreur de validation Pydantic


def test_register_and_login():
    """Un utilisateur peut s'inscrire puis se connecter."""
    import random
    email = f"test{random.randint(1000,9999)}@example.com"

    # Inscription
    response = client.post("/auth/register", json={"email": email, "password": "test1234"})
    assert response.status_code == 200
    assert response.json()["role"] == "user"

    # Connexion
    response = client.post(
        "/auth/login",
        data={"username": email, "password": "test1234"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_dashboard_requires_auth():
    """Le dashboard doit refuser l'accès sans authentification."""
    response = client.get("/dashboard")
    assert response.status_code == 401