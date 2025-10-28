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


# CoONFIGURARE .env
load_dotenv(find_dotenv())  # caută și încarcă fișierul .env

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not found. Please create a .env file in project root.")

# INITIALIZARE ROUTER + SECURITATE
router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# DATABASE (SQLite demo local)
# Pentru demo folosim o bază de date locală app.db
DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(# create_engine: creează conexiunea
    DATABASE_URL, connect_args={"check_same_thread": False}
)
# SessionLocal: fabrică de sesiuni DB pentru fiecare request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# FUNCTII UTILE
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(sub: str, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ENDPOINTURI
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint — primeste username (email) si parola,
    returneaza un token JWT valid dacă utilizatorul este corect.
    """
    user: Optional[User] = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Returneaza datele utilizatorului curent pe baza tokenului JWT.
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


# UTILIZATOR DEMO (creat automat dacă nu exista)
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
