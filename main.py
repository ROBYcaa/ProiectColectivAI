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
# Se citește domeniul frontendului din .env
frontend_origin = os.getenv("FRONTEND_ORIGIN")

# Dacă nu e setat, folosim localhost pentru dezvoltare
origins = [
    "http://localhost:5173",  # Vite (React local)
]

if frontend_origin:
    origins.append(frontend_origin)

# Adaugă middleware-ul CORS
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
