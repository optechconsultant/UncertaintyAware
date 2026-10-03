import ollama
import json
import os
from dotenv import load_dotenv
from scipy.spatial.distance import cosine


def generate_embeddings(query):
    response = ollama.embed(
        model="nomic-embed-text",
        input=query
    )
    return response["embeddings"][0]


def Calculate_OOD(cosineDistance, OODThreshold):
    if cosineDistance < OODThreshold:
        return True
    else:
        return False


# Load threshold and centroid from .env
load_dotenv()

OOD_Threshold = float(os.getenv("THRESHOLD"))
OOD_Centroid = list(
    map(float, json.loads(os.getenv("CENTROID")))
)


# Load the 300 questions
with open("physics_300.json", "r", encoding="utf-8") as file:
    questions = json.load(file)


# Store only OOD questions
OODS_Detected = []


# Process every question
for question_number, item in enumerate(questions, start=1):

    query = item["question"]

    query_embeddings = generate_embeddings(query)

    print("\nQuestion Number:", question_number)
    print("Question:", query)
    print("Query embedding length:", len(query_embeddings))


    # Calculate cosine distance
    cosineDistance = cosine(
        query_embeddings,
        OOD_Centroid
    )

    print("Cosine distance:", cosineDistance)


    # OOD classification
    OOD_result = Calculate_OOD(
        cosineDistance,
        OOD_Threshold
    )


    if OOD_result:

        print("Within Domain")

    else:

        print("Out of Domain")

        # Store only OOD questions
        OODS_Detected.append({
            "question_number": question_number,
            "question": query,
            "distance": float(cosineDistance)
        })


# Save OOD questions
with open("OODS_Detected.json", "w", encoding="utf-8") as file:
    json.dump(
        OODS_Detected,
        file,
        indent=2
    )


print("\n--------------------------------")
print("Total questions:", len(questions))
print("OOD questions detected:", len(OODS_Detected))
print("Saved to: OODS_Detected.json")
print("--------------------------------")