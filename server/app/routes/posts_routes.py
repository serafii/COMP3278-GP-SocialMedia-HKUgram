from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database.db import fetch_one, fetch_all, execute_query
from app.auth.authentication import verify_token
from fastapi.security import OAuth2PasswordBearer

posts_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# Define request/response models
class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    post_id: int
    user_id: int
    username: str
    content: str
    image_url: Optional[str] = None
    like_count: int
    post_date: datetime

# Get current user from JWT token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    
    username = verify_token(token)
    
    # Get user from database
    user = fetch_one("SELECT user_id, username FROM Users WHERE username = %s", (username,))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

@posts_router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post"""
    try:
        # Insert the post
        post_id = execute_query(
            """
            INSERT INTO Posts (user_id, content, image_url, post_date)
            VALUES (%s, %s, %s, NOW())
            """,
            (current_user["user_id"], post.content, post.image_url)
        )
        
        # Fetch the created post with username and like count
        new_post = fetch_one(
            """
            SELECT 
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image_url,
                p.post_date,
                COUNT(l.user_id) as like_count
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            WHERE p.post_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            """,
            (post_id,)
        )
        
        if not new_post:
            raise HTTPException(status_code=500, detail="Failed to retrieve created post")
        
        return PostResponse(**new_post)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/", response_model=List[PostResponse])
async def get_posts():
    """Get all posts (newest first)"""
    try:
        posts = fetch_all(
            """
            SELECT 
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image_url,
                p.post_date,
                COUNT(l.user_id) as like_count
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            ORDER BY p.post_date DESC
            """
        )
        return [PostResponse(**post) for post in posts]
    
    except Exception as e:
        print(f"Get posts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(user_id: int):
    """Get posts by specific user"""
    try:
        posts = fetch_all(
            """
            SELECT 
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image_url,
                p.post_date,
                COUNT(l.user_id) as like_count
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            WHERE p.user_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            ORDER BY p.post_date DESC
            """,
            (user_id,)
        )
        return [PostResponse(**post) for post in posts]
    
    except Exception as e:
        print(f"Get user posts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int):
    """Get a single post by ID"""
    try:
        post = fetch_one(
            """
            SELECT 
                p.post_id,
                p.user_id,
                u.username,
                p.content,
                p.image_url,
                p.post_date,
                COUNT(l.user_id) as like_count
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            WHERE p.post_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            """,
            (post_id,)
        )
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return PostResponse(**post)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post (only by the author)"""
    try:
        # Check if post exists and belongs to user
        post = fetch_one("SELECT user_id FROM Posts WHERE post_id = %s", (post_id,))
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
        # Delete the post (Likes will cascade delete automatically)
        execute_query("DELETE FROM Posts WHERE post_id = %s", (post_id,))
        
        return {"message": "Post deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))