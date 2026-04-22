from fastapi import APIRouter, HTTPException, status
from app.database.db import fetch_one, execute_query
from app.auth.authentication import create_access_token, verify_token
from pydantic import BaseModel, EmailStr
from fastapi import Depends
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from bcrypt import checkpw, hashpw, gensalt

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from datetime import datetime, timedelta

import os
from dotenv import load_dotenv

load_dotenv()

auth_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):  
    email: str # Email or username 
    password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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


@auth_router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        username = verify_token(token)
        user = fetch_one(
            "SELECT user_id, username, email, bio, joined_date FROM Users WHERE username = %s",
            (username,)
        )

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return {"success": True, "user": user}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


@auth_router.post("/forgot-password")   
async def forgot_password(request_data: dict): 
    email = request_data.get("email")
    
    try:
        user = fetch_one("SELECT user_id FROM Users WHERE email = %s", (email,))
        
        if not user:
            return {"success": True, "message": "If an account exists, a reset link has been sent."}
        
        SECRET_KEY = os.getenv("SECRET_KEY")
        ALGORITHM = "HS256"
        
        # Create reset token (expires in 1 hour)
        reset_token = jwt.encode(
            {"user_id": user["user_id"], "exp": datetime.utcnow() + timedelta(hours=1)},
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        # Send email using Gmail SMTP
        sender_email = os.getenv("EMAIL_USER")
        app_password = os.getenv("GMAIL_APP_PASSWORD")
        
        if not sender_email or not app_password:
            print("Email credentials not configured")
            return {"success": True, "message": "Reset link sent if account exists."}
        
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        
        msg = MIMEMultipart()
        msg["From"] = f"HKGram <{sender_email}>"
        msg["To"] = email
        msg["Subject"] = "Reset Your HKGram Password"
        
        body = f"""
        Hello,
        
        You requested to reset your password for your HKGram account.
        
        Click the link below to reset your password (valid for 1 hour):
        {reset_link}
        
        If you didn't request this, please ignore this email.
        
        - HKGram Team
        """
        
        msg.attach(MIMEText(body, "plain"))
        
        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.send_message(msg)
        
        print(f"Reset email sent to: {email}")
        return {"success": True, "message": "If an account exists, a reset link has been sent."}
        
    except Exception as e:
        print(f"Forgot password error: {e}")

        return {"success": True, "message": "If an account exists, a reset link has been sent."}
    
@auth_router.post("/reset-password")
async def reset_password(reset_data: ResetPasswordRequest):
    try:
        SECRET_KEY = os.getenv("SECRET_KEY")
        ALGORITHM = "HS256"
        
        # Verify token
        payload = jwt.decode(reset_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        # Hash new password
        hashed_password = hashpw(reset_data.new_password.encode('utf-8'), gensalt()).decode('utf-8')
        
        # Update user password
        execute_query(
            "UPDATE Users SET password_hash = %s WHERE user_id = %s",
            (hashed_password, user_id)
        )
        
        return {"success": True, "message": "Password reset successfully"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid reset link.")
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))