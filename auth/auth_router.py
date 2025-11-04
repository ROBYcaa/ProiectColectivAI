from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel, EmailStr, field_validator
import re

# CONFIGURARE .env
load_dotenv(find_dotenv())

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not found. Please create a .env file in project root.")

#   INITIALIZARE ROUTER + SECURITATE  
router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

#   DATABASE (SQLite demo local)  
DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

#   MODEL USER  
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)

#   CONEXIUNE DB  
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#   FUNCTII UTILE  
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(sub: str, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#   VALIDARE REGISTER  
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("password")
    def validate_password(cls, value):
        """
        Verifică dacă parola îndeplinește cerințele de complexitate:
        - minim 8 caractere
        - o literă mare
        - o cifră
        - un simbol special
        """
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain at least one special character.")
        return value

    @field_validator("confirm_password")
    def passwords_match(cls, v, info):
        """
        Confirmă că parola și confirmarea parolei coincid.
        """
        password = info.data.get("password")
        if password != v:
            raise ValueError("Passwords do not match.")
        return v
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    def validate_not_empty(cls, value):
        if not value or len(value.strip()) == 0:
            raise ValueError("Password cannot be empty.")
        return value


#   ENDPOINT REGISTER  
@router.post("/register", status_code=201)
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Endpoint pentru înregistrarea unui utilizator nou.
    - Primește email, parolă și confirmare parolă.
    - Validează datele.
    - Creează utilizatorul nou în baza de date.
    """
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "email": new_user.email}

#   ENDPOINT LOGIN  
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint — primește email și parolă,
    returnează un token JWT valid dacă utilizatorul este corect.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


#   ENDPOINT USER INFO (/me)  
@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Returnează datele utilizatorului curent pe baza tokenului JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user.id, "email": user.email}

#   UTILIZATOR DEMO (creat automat dacă nu exista)  
def seed_demo_user():
    db = SessionLocal()
    demo_email = "demo@example.com"
    demo_pass = "Passw0rd!"
    existing = db.query(User).filter(User.email == demo_email).first()
    if not existing:
        db.add(User(email=demo_email, password_hash=hash_password(demo_pass)))
        db.commit()
        print(f"Created demo user: {demo_email} / {demo_pass}")
    db.close()

seed_demo_user()
