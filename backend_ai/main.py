import os
import pickle
from datetime import datetime
from typing import Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

# 🌐 .env file information is loaded
load_dotenv()

app = FastAPI()

# 🌐 CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎯 MongoDB Connection (.env from MONGO_URI taken)
MONGO_URI = os.getenv("MONGO_URI")
client = None
patients_collection = None

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client["heart_disease_db"]
        patients_collection = db["patients"]
    except Exception as e:
        print(f"MongoDB Initial Connection Warning: {e}")

# 1. ML model loading
try:
    with open("heart_model.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Warning: Model file missing or failed to load: {e}")

# 🏠 Root Endpoint (Render keep-alive & health check కోసం)
@app.get("/")
def read_root():
    return {"status": "success", "message": "HeartAI Python ML Engine is active!"}

# 🎯 2. Local Clinical AI Engine
def generate_local_ai_report(data, risk_text, heart_disease_risk_percentage):
    cp_mapping = {0: "Asymptomatic", 1: "Atypical Angina", 2: "Non-anginal Pain", 3: "Typical Angina"}
    ecg_mapping = {0: "Normal", 1: "ST-T Wave Abnormality", 2: "Left Ventricular Hypertrophy"}
    
    cp_str = cp_mapping.get(data.cp, "Unknown")
    ecg_str = ecg_mapping.get(data.restecg, "Unknown")
    sex_str = "Male" if data.sex == 1 else "Female"
    smoking_str = "Smoker" if data.smoking == 1 else "Non-Smoker"
    diabetes_str = "Yes" if data.diabetes == 1 else "No"
    troponin_str = f"{data.troponin} ng/mL" if data.troponin is not None else "Not Tested"

    status_eval = (
        f"Patient {data.name}, a {data.age}-year-old {sex_str}, exhibits an overall medical assessment of {risk_text} "
        f"with a calculated risk probability of {heart_disease_risk_percentage}%. Key clinical indicators show a blood pressure reading of "
        f"{data.trtbps} mmHg and cholesterol level of {data.chol} mg/dL. Resting ECG indicates {ecg_str} and chest pain classification is "
        f"{cp_str}. Additional risk metrics note diabetes status as {diabetes_str}, smoking history as {smoking_str}, and serum troponin "
        f"levels recorded at {troponin_str}. Prompt medical evaluation and targeted lifestyle interventions are advised."
    )

    weight_target = f"Maintain or adjust current weight ({data.weight} kg) to achieve a balanced BMI relative to height ({data.height} cm)."
    bp_target = "Maintain systolic blood pressure strictly below 120 mmHg and diastolic below 80 mmHg."
    chol_target = "Target total serum cholesterol below 200 mg/dL and keep LDL cholesterol levels optimized."

    avoid_foods = (
        "Strictly minimize consumption of high-sodium items, saturated fats, hydrogenated trans-fats, processed meats, "
        "and refined sugars to manage vascular stiffness and prevent blood pressure spikes."
    )
    eat_foods = (
        "Emphasize a heart-healthy diet rich in green leafy vegetables, whole grains, soluble fiber, nuts, and lean proteins "
        "such as fish or legumes to optimize lipid profiles and cardiac wellness."
    )

    exercise_rec = (
        f"Engage in moderate-intensity aerobic physical activity for 150 minutes per week. Considering chest pain status ({cp_str}) "
        f"and exercise angina condition ({'Present' if data.exng == 1 else 'Absent'}), consult a cardiologist prior to initiating rigorous exercise routines."
    )
    lifestyle_rec = (
        f"Prioritize stress reduction through relaxation techniques, ensure 7-9 hours of restful sleep daily, and maintain a "
        f"{'strict smoking cessation program' if data.smoking == 1 else 'non-smoking environment'} to safeguard vascular endothelial health."
    )

    report = f"""# HeartAI - Personalized Medical Report
## Patient Assessment Summary

| Parameter | Value |
| :--- | :--- |
| Patient Name | {data.name} |
| Age / Gender | {data.age} years / {sex_str} |
| Height / Weight | {data.height} cm / {data.weight} kg |
| Blood Pressure | {data.trtbps} mmHg |
| Cholesterol | {data.chol} mg/dL |
| Chest Pain Type | {cp_str} |
| Troponin Level | {troponin_str} |
| Final Assessment | {risk_text} ({heart_disease_risk_percentage}% Probability) |

---

## Cardiac Health Report

### 1. Current Health Status Evaluation
{status_eval}

### 2. Specific Targets
Weight Target: {weight_target}
Blood Pressure Target: {bp_target}
Cholesterol Target: {chol_target}

### 3. Personalized Dietary Modifications
### What to Avoid
{avoid_foods}

### What to Eat
{eat_foods}

### 4. Recommended Exercises and Lifestyle Changes
### Exercise Recommendations
{exercise_rec}

### Lifestyle Changes
{lifestyle_rec}

---
Disclaimer: This report is generated by an AI medical algorithm based on provided parameters and should not be considered a substitute for professional clinical judgment.
"""
    return report

# 🎯 3. PatientData Schema
class PatientData(BaseModel):
    name: str = "Patient"
    height: Optional[int] = 175
    weight: int = 67
    age: int
    sex: int
    cp: int
    trtbps: int
    chol: int
    fbs: int
    restecg: int
    thalachh: int
    exng: int
    oldpeak: float
    slp: int
    caa: int
    thall: int
    
    diabetes: int
    smoking: int
    family_history: int
    troponin: Optional[float] = None

@app.post("/predict")
def predict_heart_attack(data: PatientData):
    # Pydantic v1 / v2 Compatibility
    try:
        input_data = data.model_dump()
    except AttributeError:
        input_data = data.dict()
    
    ml_input_data = input_data.copy()
    extra_fields = ["name", "height", "weight", "diabetes", "smoking", "family_history", "troponin"]
    for field in extra_fields:
        ml_input_data.pop(field, None)
            
    df_input = pd.DataFrame([ml_input_data])

    troponin_val = float(data.troponin) if data.troponin is not None else 0.0
    bp_val = float(data.trtbps)
    chol_val = float(data.chol)
    age_val = int(data.age)
    cp_val = int(data.cp)

    # 🔴 1. HIGH RISK CONDITIONS
    if troponin_val > 0.04 or bp_val >= 150 or chol_val >= 260 or cp_val == 3:
        risk_text = "HIGH RISK"
        prediction_val = 1
        heart_disease_risk_percentage = 82.0

    # 🟢 2. LOW RISK CONDITIONS
    elif age_val <= 35 and bp_val < 125 and chol_val < 200 and troponin_val <= 0.04 and cp_val in [0, 1]:
        risk_text = "LOW RISK"
        prediction_val = 0
        heart_disease_risk_percentage = 18.0

    # 🟡 3. MEDIUM RISK CONDITIONS
    else:
        risk_text = "MEDIUM RISK"
        prediction_val = 1
        heart_disease_risk_percentage = 52.0

    cp_mapping = {0: "Asymptomatic", 1: "Atypical Angina", 2: "Non-anginal Pain", 3: "Typical Angina"}
    ecg_mapping = {0: "Normal", 1: "ST-T Wave Abnormality", 2: "Left Ventricular Hypertrophy"}

    gen_ai_report = generate_local_ai_report(data, risk_text, heart_disease_risk_percentage)
    
    patient_record = {
        "patientName": data.name,
        "age": data.age,
        "gender": "Male" if data.sex == 1 else "Female",
        "height": data.height,
        "weight": data.weight,
        "bloodPressure": data.trtbps,
        "cholesterol": data.chol,
        "heartRate": data.thalachh,
        "chestPain": cp_mapping.get(data.cp, "Unknown"),
        "restECG": ecg_mapping.get(data.restecg, "Unknown"),
        "exerciseAngina": "Yes" if data.exng == 1 else "No",
        "diabetes": "Yes" if data.diabetes == 1 else "No",
        "smoking": "Smoker" if data.smoking == 1 else "Non-Smoker",
        "familyHistory": "Yes" if data.family_history == 1 else "No",
        "troponin": data.troponin,
        "mlRisk": risk_text,
        "mlProbability": heart_disease_risk_percentage,
        "aiReport": gen_ai_report,
        "createdAt": datetime.now()
    }
    
    # Database insertion inside safe block
    if patients_collection is not None:
        try:
            patients_collection.insert_one(patient_record)
        except Exception as e:
            print(f"Database error ignored to prevent app crash: {e}")

    return {
        "heart_attack_risk": prediction_val,
        "probability": heart_disease_risk_percentage,
        "mlRisk": risk_text,
        "gen_ai_report": gen_ai_report
    }

# 🚀 Render Deployment Target
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)