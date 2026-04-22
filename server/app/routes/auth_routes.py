from fastapi import APIRouter, HTTPException, status
from app.database.db import fetch_one, execute_query
from app.auth.authentication import create_access_token, verify_token
from pydantic import BaseModel, EmailStr
from fastapi import Depends
from jose import JWTError
from fastapi.security import OAuth2PasswordBearer

from bcrypt import checkpw, hashpw, gensalt

auth_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):  
    email: str # Email or username 
    password: str

@auth_router.post("/login")
async def login(login_data: LoginRequest):  
    try:
        # Search by email OR username
        sql = "SELECT * FROM Users WHERE email = %s OR username = %s"
        user = fetch_one(sql, (login_data.email, login_data.email))  
        
        # Check if user exists AND password matches
        if not user or not checkpw(login_data.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password")
        
        # Create token with the username from database
        access_token = create_access_token(data={"sub": user['username']})
        
        return {
            "success": True,
            "access_token": access_token, 
            "token_type": "bearer",
            "username": user['username']  # Send back username for frontend
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")  
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@auth_router.post("/register")
async def register(form_data: RegisterRequest):
    try:
        # Check if username already exists 
        sql = "SELECT * FROM Users WHERE username = %s"
        existing_user = fetch_one(sql, (form_data.username,))  

        if existing_user:
            return {
                "success": False, 
                "message": "Username already exists"
            }
        
        # Check if email already exists
        sql_email = "SELECT * FROM Users WHERE email = %s"
        existing_email = fetch_one(sql_email, (form_data.email,))  

        if existing_email:
            return {
                "success": False,
                "message": "Email already exists"
            }

        hashed_password = hashpw(form_data.password.encode('utf-8'), gensalt()).decode('utf-8')

        # Insert new user into database 
        user_id = execute_query(  
            "INSERT INTO Users (username, email, password_hash, bio, joined_date) VALUES (%s, %s, %s, %s, NOW())",
            (form_data.username, form_data.email, hashed_password, "")
        )
        
        # Create access token for the new user
        access_token = create_access_token(data={"sub": form_data.username})
        
        return {
            "success": True, 
            "access_token": access_token, 
            "token_type": "bearer",
            "message": "Account created successfully",
            "user_id": user_id
        }    
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")  
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@auth_router.get("/verify-session")
async def verify_session(token: str = Depends(oauth2_scheme)):
    try:
        username = verify_token(token)
        return {"success": True, "username": username}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")