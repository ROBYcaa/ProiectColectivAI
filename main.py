from typing import Union

import app
from fastapi import FastAPI

from auth.auth_router import router as auth_router
app.include_router(auth_router)


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}