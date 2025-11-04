from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Incarca variabilele din .env 
load_dotenv()

app = FastAPI(title="Proiect Colectiv AI Backend")

# CONFIGURARE CORS
origins = [
    "http://localhost:5173",  # vite dev
    "http://127.0.0.1:5173",  # fallback
    "http://localhost:5175",  # dacă vite rulează pe alt port
    "http://127.0.0.1:5175",
]


# Adauga si din .env daca exista FRONTEND_ORIGIN
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin and frontend_origin not in origins:
    origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importa si include routere
from auth.auth_router import router as auth_router
app.include_router(auth_router)

# Rute test
@app.get("/")
def read_root():
    return {"message": "Backend running successfully 🚀"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
