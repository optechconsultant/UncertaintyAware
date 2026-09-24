import ollama
import math
from scipy.spatial.distance import cosine

def generate_embeddings(query):
    response=ollama.embed(model="nomic-embed-text",input=query)
    return response["embeddings"][0]
def calculate_dot_product(query_embeddings,OOD_Centroid):
    total=0
    for i in range(len(query_embeddings)):
        total+=query_embeddings[i]*OOD_Centroid[i]
    return total
def calculate_magnitude(embedding):
    total=0
    for value in embedding:
        total+=value*value
    return math.sqrt(total)
def calculate_cosine_similarity(dotproduct,querymagnitude,OODCentroidmagnitude):
    cosine_similarity=dotproduct/(querymagnitude*OODCentroidmagnitude)
    cosine_distance=1-cosine_similarity
    return cosine_distance
def Calculate_OOD(cosineDistance,OODThreshold):
    if cosineDistance<OODThreshold:
        return True
    else:
        return False

query=input("")
OOD_Threshold=float(input())
OOD_Centroid=list(map(float,input("").split(",")))



query_embeddings=generate_embeddings(query)
print("Query embedding length:", len(query_embeddings))
dotproduct=calculate_dot_product(query_embeddings,OOD_Centroid)
querymagnitude=calculate_magnitude(query_embeddings)
OODCentroidmagnitude=calculate_magnitude(OOD_Centroid)
cosineDistance=calculate_cosine_similarity(dotproduct,querymagnitude,OODCentroidmagnitude)
print("Calculated cosine distance:",cosineDistance)
distance=cosine(query_embeddings,OOD_Centroid)
print("distance from built-in method:",distance)
OOD_result=Calculate_OOD(cosineDistance,OOD_Threshold)
if OOD_result:
    print("With in Domain")
else:
    print("Out of Domain")

