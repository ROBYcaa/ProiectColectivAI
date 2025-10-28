from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Încarcă variabilele din .env
load_dotenv()

# Creează instanța principală FastAPI
app = FastAPI()

# === CONFIGURARE CORS ===
frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")

origins = [
    frontend_origin,
    "http://localhost:3000",  # pentru testare locală
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === IMPORTĂ ȘI INCLUDE ROUTERS ===
from auth.auth_router import router as auth_router
app.include_router(auth_router)

# === RUTE SIMPLE PENTRU TESTARE ===
@app.get("/")
def read_root():
    return {"message": "Backend running successfully 🚀"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
