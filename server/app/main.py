from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth_routes import auth_router
from app.routes.posts_routes import posts_router

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server start script:
# uvicorn app.main:app --reload
# http://localhost:8000

app.include_router(auth_router, prefix="/auth")
app.include_router(posts_router, prefix="/posts")

@app.get("/")
def read_root():
    return {"Hello": "World"}