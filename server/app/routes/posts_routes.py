from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/posts", tags=["posts"])

# Define request/response models
class PostCreate(BaseModel):
    text_content: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    user_id: int
    username: str
    text_content: str
    image_url: Optional[str] = None
    like_count: int
    created_at: datetime

# Temporary storage (mock database)
temp_posts: List[Dict[str, Any]] = []
temp_post_id = 1

# Temporary users (will be replaced with real auth later)
temp_users = {
    1: {"id": 1, "username": "test_user"},
    2: {"id": 2, "username": "alice"},
}

# Temporary auth dependency (will be replaced with real JWT auth)
async def get_current_user(user_id: int = 1) -> Dict[str, Any]:
    """Temporary user getter - replace with real auth later"""
    if user_id not in temp_users:
        raise HTTPException(status_code=401, detail="User not found")
    return temp_users[user_id]

@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new post"""
    global temp_post_id
    
    new_post = {
        "id": temp_post_id,
        "user_id": current_user["id"],
        "username": current_user["username"],
        "text_content": post.text_content,
        "image_url": post.image_url,
        "like_count": 0,
        "created_at": datetime.now()
    }
    
    temp_posts.append(new_post)
    temp_post_id += 1
    
    return PostResponse(**new_post)

@router.get("/", response_model=List[PostResponse])
async def get_posts():
    """Get all posts (newest first)"""
    sorted_posts = sorted(temp_posts, key=lambda x: x["created_at"], reverse=True)
    return [PostResponse(**post) for post in sorted_posts]

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int):
    """Get a single post by ID"""
    for post in temp_posts:
        if post["id"] == post_id:
            return PostResponse(**post)
    raise HTTPException(status_code=404, detail="Post not found")

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a post (only by the author)"""
    global temp_posts
    
    for i, post in enumerate(temp_posts):
        if post["id"] == post_id:
            if post["user_id"] != current_user["id"]:
                raise HTTPException(status_code=403, detail="Not authorized to delete this post")
            temp_posts.pop(i)
            return {"message": "Post deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Post not found")
