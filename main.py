from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# === Încărcare variabile din .env ===
load_dotenv()

# Creează aplicația FastAPI
app = FastAPI(title="Proiect Colectiv AI Backend")

# === CONFIGURARE CORS ===
frontend_origin = os.getenv("FRONTEND_ORIGIN")

# Domenii permise explicit (inclusiv HTTPS)
origins = [
    "http://localhost:5173",           # React local
    "https://localhost:5173",          # uneori Vite poate folosi HTTPS local
    "https://proiectcolectivai-frontend.onrender.com",  # frontend live
]

if frontend_origin and frontend_origin not in origins:
    origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === IMPORT ROUTERS ===
from auth.auth_router import router as auth_router
app.include_router(auth_router)

# === RUTE DE TESTARE ===
@app.get("/")
def read_root():
    return {"message": "Backend running successfully 🚀"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
