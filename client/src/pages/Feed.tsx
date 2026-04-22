import React, { useState, useEffect } from "react";
import { Heart, Image as ImageIcon } from "lucide-react";
import AppNavbar from "../components/AppNavbar.tsx";

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
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/posts/");

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <AppNavbar activePage="feed" subtitle="Feed" />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8">
        <section className="rounded-3xl border border-white/8 bg-dark-800/90 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Feed</h1>
              <p className="mt-1 text-sm text-gray-400">
                Browse the latest posts from your friends!
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
              Showing {Math.min(visibleCount, posts.length)} of {posts.length}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/8 bg-dark-800/90 p-10 shadow-2xl shadow-black/20">
            <div className="text-center text-gray-400">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-brand-400" />
              <p>Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-white/8 bg-dark-800/90 p-10 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-brand-300">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold text-white">No posts yet</p>
            <p className="mt-2 text-sm text-gray-400">
              Your feed will fill up once people start posting.
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4">
              {visiblePosts.map((post) => (
                <article
                  key={post.post_id}
                  className="rounded-3xl border border-white/8 bg-dark-800/90 p-5 shadow-2xl shadow-black/20"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-blue text-base font-bold text-white shadow-lg shadow-brand-500/20">
                        {post.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {post.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(post.post_date)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                      {post.like_count} likes
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-gray-200">
                    {post.content}
                  </p>

                  {post.image_url && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-black/20">
                      <img
                        src={post.image_url}
                        alt="Post content"
                        className="max-h-112 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                    >
                      <Heart className="h-4 w-4" />
                      Like
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {visibleCount < posts.length && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 6)}
                  className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(217,70,239,0.25)] transition hover:bg-brand-600"
                >
                  Show more posts
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Feed;
