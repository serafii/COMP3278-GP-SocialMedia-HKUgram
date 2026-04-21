from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.database import Database

router = APIRouter(prefix="/api/posts", tags=["posts"])

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

# Temporary auth dependency (replace with real JWT auth later)
async def get_current_user() -> Dict[str, Any]:
    """Temporary user getter - replace with real auth later"""
    # For testing, return user with ID 1
    # Make sure this user exists in your Users table!
    return {"user_id": 1, "username": "test_user"}

@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new post using real database"""
    db = Database()
    db.connect()
    
    try:
        # Insert the post
        query = """
            INSERT INTO Posts (user_id, content, image_url, post_date)
            VALUES (%s, %s, %s, NOW())
        """
        post_id = db.execute_query(query, (
            current_user["user_id"], 
            post.content, 
            post.image_url
        ))
        
        # Fetch the created post with username and like count
        select_query = """
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
        """
        new_post = db.fetch_one(select_query, (post_id,))
        
        if not new_post:
            raise HTTPException(status_code=500, detail="Failed to retrieve created post")
        
        return PostResponse(**new_post)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()

@router.get("/", response_model=List[PostResponse])
async def get_posts():
    """Get all posts from database (newest first) with like counts"""
    db = Database()
    db.connect()
    
    try:
        query = """
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
        posts = db.fetch_all(query)
        return [PostResponse(**post) for post in posts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int):
    """Get a single post by ID"""
    db = Database()
    db.connect()
    
    try:
        query = """
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
        """
        post = db.fetch_one(query, (post_id,))
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return PostResponse(**post)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a post (only by the author)"""
    db = Database()
    db.connect()
    
    try:
        # Check if post exists and belongs to user
        check_query = "SELECT user_id FROM Posts WHERE post_id = %s"
        post = db.fetch_one(check_query, (post_id,))
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
        # Delete the post (Likes will cascade delete automatically)
        delete_query = "DELETE FROM Posts WHERE post_id = %s"
        db.execute_query(delete_query, (post_id,))
        
        return {"message": "Post deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()
