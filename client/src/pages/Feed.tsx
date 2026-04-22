import React, { useState, useEffect } from "react";
import CreatePostForm from "../components/CreatePostForm";

interface Post {
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  image_url: string | null;
  like_count: number;
  post_date: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/posts/");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Fix 1: Define handlePostCreated
  const handlePostCreated = () => {
    fetchPosts();
  };

  // Fix 2: Define formatDate
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-zinc-50 px-5 py-6">
      <header className="mb-8 rounded-xl bg-white p-5 text-center shadow-sm">
        <h1 className="m-0 text-4xl font-bold text-blue-600">📱 HKgram</h1>
        <p className="mt-1 text-sm text-zinc-500">Share your moments</p>
      </header>

      <main>
        <CreatePostForm onPostCreated={handlePostCreated} />

        <div className="mt-5">
          <h3 className="mb-4 text-lg font-semibold text-zinc-800">
            Recent Posts
          </h3>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-zinc-500">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600"></div>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-zinc-500 shadow-sm">
              <p>✨ No posts yet. Be the first to create a post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.post_id}
                className="mb-4 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                      {post.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong className="block text-sm text-zinc-800">
                        {post.username}
                      </strong>
                      <span className="mt-0.5 block text-xs text-zinc-400">
                        {formatDate(post.post_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="my-2.5 text-[15px] leading-6 text-zinc-800">
                  {post.content}
                </p>

                {post.image_url && (
                  <div className="mt-2.5 overflow-hidden rounded-lg">
                    <img
                      src={post.image_url}
                      alt="Post content"
                      className="max-h-100 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="mt-3 border-t border-zinc-100 pt-2.5">
                  <button className="rounded px-2.5 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100">
                    ❤️ {post.like_count} likes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Feed;