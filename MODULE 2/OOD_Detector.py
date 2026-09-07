import ollama
import math


def generate_chunks(query,chunkSize):
    chunks=[]

    for i in range(0,len(query),chunkSize):
        chunks.append(query[i:i+chunkSize])
    return chunks
def generate_embeddings(querychunks):
    embeddings=[]
    for chunk in querychunks:
        response=ollama.embed(model="nomic-embed-text",input=chunk)
        embeddings.append(response["embeddings"][0])
    return embeddings
def merge_embeddings(chunks_embeddings):
    query_embedding = []

    for i in range(len(chunks_embeddings[0])):
        total = 0

        for embedding in chunks_embeddings:
            total += embedding[i]

        query_embedding.append(total / len(chunks_embeddings))

    return query_embedding
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
    return cosine_similarity
def calculate_cosine_distance(cosineSimilarity):
    cosine_distance=1-cosineSimilarity
    return cosine_distance
def Calculate_OOD(cosineDistance,OODThreshold):
    if cosineDistance<OODThreshold:
        return True
    else:
        return False

query=input("")
OOD_Threshold=float(input())
OOD_Centroid=list(map(float,input("").split(",")))

query_chunks=generate_chunks(query,5)
# print(query_chunks)
chunks_embeddings=generate_embeddings(query_chunks)
# print(chunks_embeddings)
query_embeddings=merge_embeddings(chunks_embeddings)
# print(query_embeddings)
# print("Query embedding length:", len(query_embeddings))
# print("OOD centroid length:", len(OOD_Centroid))
dotproduct=calculate_dot_product(query_embeddings,OOD_Centroid)
# def generate_Embeddings(query_chunks):
querymagnitude=calculate_magnitude(query_embeddings)
OODCentroidmagnitude=calculate_magnitude(OOD_Centroid)
cosineSimilarity=calculate_cosine_similarity(dotproduct,querymagnitude,OODCentroidmagnitude)
cosineDistance=calculate_cosine_distance(cosineSimilarity)
OOD_result=Calculate_OOD(cosineDistance,OOD_Threshold)
if OOD_result:
    print("With in Domain")
else:
    print("Out of Domain")

