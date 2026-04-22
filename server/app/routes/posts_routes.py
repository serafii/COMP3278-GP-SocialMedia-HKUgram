from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from app.database.db import fetch_one, fetch_all, execute_query
from app.auth.authentication import verify_token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

posts_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# Define request/response models
class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    username: str
    content: str
    comment_date: datetime

class PostResponse(BaseModel):
    post_id: int
    user_id: int
    username: str
    content: str
    image_url: Optional[str] = None
    like_count: int
    liked: bool = False
    comments: List[CommentResponse] = Field(default_factory=list)
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


async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        return None

    try:
        username = verify_token(token)
    except JWTError:
        return None

    user = fetch_one("SELECT user_id, username FROM Users WHERE username = %s", (username,))
    return user


def attach_comments_to_posts(posts: List[Dict], current_user_id: Optional[int]):
    if not posts:
        return posts

    post_ids = [post["post_id"] for post in posts]
    placeholders = ", ".join(["%s"] * len(post_ids))

    comments = fetch_all(
        f"""
        SELECT
            c.comment_id,
            c.post_id,
            c.user_id,
            u.username,
            c.content,
            c.comment_date
        FROM Comments c
        JOIN Users u ON c.user_id = u.user_id
        WHERE c.post_id IN ({placeholders})
        ORDER BY c.comment_date ASC
        """,
        tuple(post_ids),
    )

    comments_by_post: Dict[int, List[dict]] = {}
    for comment in comments:
        comments_by_post.setdefault(comment["post_id"], []).append(comment)

    for post in posts:
        post["comments"] = comments_by_post.get(post["post_id"], [])

    return posts

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
        
        new_post["comments"] = []
        return PostResponse(**new_post)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/", response_model=List[PostResponse])
async def get_posts(current_user: Optional[dict] = Depends(get_optional_current_user)):
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
                COUNT(l.user_id) as like_count,
                MAX(CASE WHEN ul.user_id IS NULL THEN 0 ELSE 1 END) as liked
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            LEFT JOIN Likes ul ON p.post_id = ul.post_id AND ul.user_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            ORDER BY p.post_date DESC
            """,
            (current_user["user_id"] if current_user else None,),
        )
        posts = attach_comments_to_posts(posts, current_user["user_id"] if current_user else None)
        return [PostResponse(**post) for post in posts]
    
    except Exception as e:
        print(f"Get posts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(user_id: int, current_user: Optional[dict] = Depends(get_optional_current_user)):
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
                COUNT(l.user_id) as like_count,
                MAX(CASE WHEN ul.user_id IS NULL THEN 0 ELSE 1 END) as liked
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            LEFT JOIN Likes ul ON p.post_id = ul.post_id AND ul.user_id = %s
            WHERE p.user_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            ORDER BY p.post_date DESC
            """,
            (current_user["user_id"] if current_user else None, user_id),
        )
        posts = attach_comments_to_posts(posts, current_user["user_id"] if current_user else None)
        return [PostResponse(**post) for post in posts]
    
    except Exception as e:
        print(f"Get user posts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@posts_router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, current_user: Optional[dict] = Depends(get_optional_current_user)):
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
                COUNT(l.user_id) as like_count,
                MAX(CASE WHEN ul.user_id IS NULL THEN 0 ELSE 1 END) as liked
            FROM Posts p
            JOIN Users u ON p.user_id = u.user_id
            LEFT JOIN Likes l ON p.post_id = l.post_id
            LEFT JOIN Likes ul ON p.post_id = ul.post_id AND ul.user_id = %s
            WHERE p.post_id = %s
            GROUP BY p.post_id, p.user_id, u.username, p.content, p.image_url, p.post_date
            """,
            (current_user["user_id"] if current_user else None, post_id),
        )
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        post["comments"] = fetch_all(
            """
            SELECT
                c.comment_id,
                c.post_id,
                c.user_id,
                u.username,
                c.content,
                c.comment_date
            FROM Comments c
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.post_id = %s
            ORDER BY c.comment_date ASC
            """,
            (post_id,)
        )

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

@posts_router.post("/like/{post_id}")
async def like_post(
    post_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Toggle a like for a post once per user."""
    try:
        post = fetch_one("SELECT post_id FROM Posts WHERE post_id = %s", (post_id,))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        existing_like = fetch_one(
            "SELECT post_id FROM Likes WHERE post_id = %s AND user_id = %s",
            (post_id, current_user["user_id"]),
        )

        if existing_like:
            execute_query(
                "DELETE FROM Likes WHERE post_id = %s AND user_id = %s",
                (post_id, current_user["user_id"]),
            )

            like_count_row = fetch_one(
                "SELECT COUNT(*) AS like_count FROM Likes WHERE post_id = %s",
                (post_id,),
            )
            return {
                "success": True,
                "message": "Post unliked successfully",
                "post_id": post_id,
                "like_count": like_count_row["like_count"],
                "liked": False,
            }

        execute_query(
            "INSERT INTO Likes (post_id, user_id) VALUES (%s, %s)",
            (post_id, current_user["user_id"]),
        )

        like_count_row = fetch_one(
            "SELECT COUNT(*) AS like_count FROM Likes WHERE post_id = %s",
            (post_id,),
        )

        return {
            "success": True,
            "message": "Post liked successfully",
            "post_id": post_id,
            "like_count": like_count_row["like_count"],
            "liked": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Like post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@posts_router.post("/comments/{post_id}")
async def add_comment(
    post_id: int,
    payload: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a post and return the created comment."""
    try:
        post = fetch_one("SELECT post_id FROM Posts WHERE post_id = %s", (post_id,))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        content = payload.content.strip()
        if not content:
            raise HTTPException(status_code=400, detail="Comment cannot be empty")

        comment_id = execute_query(
            "INSERT INTO Comments (post_id, user_id, content, comment_date) VALUES (%s, %s, %s, NOW())",
            (post_id, current_user["user_id"], content),
        )

        created_comment = fetch_one(
            """
            SELECT
                c.comment_id,
                c.post_id,
                c.user_id,
                u.username,
                c.content,
                c.comment_date
            FROM Comments c
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.comment_id = %s
            """,
            (comment_id,)
        )

        return {
            "success": True,
            "message": "Comment added successfully",
            "comment": created_comment,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Add comment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

@posts_router.post("/add-comment/{post_id}")
async def add_comment(
    post_id: int,
    comment: str,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a post"""
    try:
        post = fetch_one("SELECT post_id FROM Posts WHERE post_id = %s", (post_id,))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        execute_query(
            "INSERT INTO Comments (post_id, user_id, content, comment_date) VALUES (%s, %s, %s, NOW())",
            (post_id, current_user["user_id"], comment)
        )

        return {"success": True, "message": "Comment added successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Add comment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))