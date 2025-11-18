# backend/project/project_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime

from backend.database import Base, engine, SessionLocal
from backend.auth.auth_router import get_db
from backend.schemas.project_schema import ProjectCreate, ProjectUpdate, ProjectRead

# MODEL PROJECT
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    start_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

router = APIRouter()

# CREATE project
@router.post("/", response_model=ProjectRead)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=data.name,
        description=data.description,
        start_date=data.start_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# GET all projects
@router.get("/", response_model=list[ProjectRead])
def get_all_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

# UPDATE project
@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).get(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if data.name:
        project.name = data.name
    if data.description:
        project.description = data.description
    if data.start_date:
        project.start_date = data.start_date

    db.commit()
    db.refresh(project)
    return project

# GET project by id
@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).get(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project
