# import json
# import numpy as np
# import firebase_admin
# from firebase_admin import credentials, firestore
# from sklearn.ensemble import RandomForestClassifier
# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware



# # ---------------- FIREBASE INIT ----------------
# cred = credentials.Certificate("file.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# # ---------------- FASTAPI ----------------
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class UserRequest(BaseModel):
#     userId: str

# # ---------------- LOAD STUDIES ----------------
# with open("studies.json") as f:
#     studies = json.load(f)

# SYMPTOM_KEYS = [
#     "Executive dysfunction",
#     "Pain",
#     "Fatigue",
#     "Sensory overload",
#     "Intrusive thoughts",
#     "Social burnout",
#     "Emotional intensity",
#     "Difficulty with routines",
#     "Anxiety or constant worry"
# ]

# # ---------------- API ENDPOINT ----------------
# @app.post("/recommendations")
# def recommend(req: UserRequest):
#     user_id = req.userId

#     # Fetch latest user experience
#     docs = (
#         db.collection("experiences")
#         .where("userId", "==", user_id)
#         .order_by("createdAt", direction=firestore.Query.DESCENDING)
#         .limit(1)
#         .stream()
#     )

#     user_experience = None
#     for doc in docs:
#         user_experience = doc.to_dict()

#     if not user_experience:
#         return {"predictedSymptom": None}

#     user_symptoms = user_experience.get("symptoms", [])

#     # Vectorize user
#     user_vector = np.array([
#         1 if s in user_symptoms else 0 for s in SYMPTOM_KEYS
#     ]).reshape(1, -1)

#     # Train ML model from studies.json
#     X_train = []
#     y_train = []

#     for study in studies:
#         vector = [1 if s in study["symptoms"] else 0 for s in SYMPTOM_KEYS]
#         X_train.append(vector)
#         y_train.append(study["symptoms"][0])  # main symptom

#     clf = RandomForestClassifier(n_estimators=100)
#     clf.fit(X_train, y_train)

#     predicted_symptom = clf.predict(user_vector)[0]

#     return { "predictedSymptom": predicted_symptom }
