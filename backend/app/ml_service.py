#Le cœur de la logique : le service de prédiction

import joblib
import shap
import os

#Charger le modèle et les noms de colonnes au démarrage de l'API
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model_xgb.joblib")
FEATURES_PATH = os.path.join(BASE_DIR, "models", "feature_names.joblib")

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)
explainer = shap.TreeExplainer(model)


def predict_risk(data: dict):
    """
    Prend un dictionnaire de données patient, renvoie la prédiction,
    le score de risque et les facteurs explicatifs (SHAP).
    """
    #Construire le vecteur de features dans le bon ordre
    input_values = [[
        data["pregnancies"],
        data["glucose"],
        data["blood_pressure"],
        data["skin_thickness"],
        data["insulin"],
        data["bmi"],
        data["diabetes_pedigree"],
        data["age"],
    ]]

    #Prédiction
    prediction = int(model.predict(input_values)[0])
    risk_score = float(model.predict_proba(input_values)[0][1])

    #Label de risque basé sur le score
    if risk_score < 0.33:
        risk_label = "Faible"
    elif risk_score < 0.66:
        risk_label = "Modéré"
    else:
        risk_label = "Élevé"

       #Calcul SHAP pour expliquer CETTE prédiction précise
    shap_values = explainer.shap_values(input_values)
    contributions = list(zip(feature_names, shap_values[0]))
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    max_impact = float(max(abs(float(v)) for _, v in contributions)) or 1.0
    field_map = {
        "Pregnancies": "pregnancies", "Glucose": "glucose", "BloodPressure": "blood_pressure",
        "SkinThickness": "skin_thickness", "Insulin": "insulin", "BMI": "bmi",
        "DiabetesPedigreeFunction": "diabetes_pedigree", "Age": "age",
    }
    top_factors = [
        {
            "factor": name,
            "impact": round(float(value), 3),
            "value": data.get(field_map.get(name, ""), None),
            "strength": round(float(abs(float(value)) / max_impact * 100), 1),
        }
        for name, value in contributions[:3]
    ]

    #Recommandations générales (non médicales, juste pédagogiques)
    recommendations = generate_recommendations(data, risk_label)

    return {
        "risk_score": round(risk_score, 3),
        "prediction": prediction,
        "risk_label": risk_label,
        "top_factors": top_factors,
        "recommendations": recommendations,
    }


def generate_recommendations(data: dict, risk_label: str):
    """Génère des recommandations générales et non médicales."""
    tips = []

    if data["glucose"] > 140:
        tips.append("Ton taux de glucose est élevé : limite les sucres rapides et consulte un professionnel de santé.")
    if data["bmi"] > 25:
        tips.append("Ton IMC suggère un surpoids : une activité physique régulière peut aider à réduire ce facteur.")
    if data["age"] > 45:
        tips.append("Le risque de diabète augmente avec l'âge : un suivi médical régulier est recommandé.")
    if not tips:
        tips.append("Tes indicateurs semblent globalement dans une zone favorable, continue à adopter une bonne hygiène de vie.")

    tips.append("⚠️ Ce résultat est une estimation statistique à visée pédagogique, il ne remplace pas un diagnostic médical.")
    return tips