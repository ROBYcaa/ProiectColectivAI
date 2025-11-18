from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema de bază
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

# Pentru crearea unui proiect (POST)
class ProjectCreate(ProjectBase):
    start_date: datetime

# Pentru actualizarea unui proiect (PATCH/PUT)
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None

# Pentru citirea unui proiect (GET)
class ProjectRead(ProjectBase):
    id: int
    start_date: datetime
    created_at: datetime

    class Config:
        orm_mode = True
