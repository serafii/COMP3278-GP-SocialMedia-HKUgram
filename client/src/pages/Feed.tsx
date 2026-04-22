import React, { useState, useEffect } from "react";

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
  const currentUser = "Denny_HKU"; 

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/posts/");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Fix 2: Define formatDate
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full bg-dark-900 text-white font-sans overflow-y-auto">
      <header className="sticky top-0 z-50 w-full bg-dark-900/80 backdrop-blur-lg border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/hkgram_favicon_single.png" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-white">HKGram</span>
            </Link>
            <div className="h-5 w-px bg-dark-600 mx-2"></div>
            <span className="text-sm font-medium text-gray-300 bg-dark-800 px-3 py-1.5 rounded-full border border-dark-600">
              @{currentUser}
            </span>
          </div>
        </div>
      </header>

      <main>
        <div className="mt-5">
          <h3 className="mb-4 text-lg font-semibold text-zinc-800">
            Recent Posts
          </h3>

        <div className="h-px w-full bg-dark-600 mb-10"></div>

        {/* Feed Wall (Imgur Masonry Style) */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.post_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="break-inside-avoid bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 shadow-lg hover:border-dark-500 transition-all"
              >
                <div className="p-3 px-4 flex items-center gap-3 border-b border-dark-600/50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-[10px] font-bold">
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-xs text-gray-200">{post.username}</span>
                </div>
                {post.image_url && <img src={post.image_url} alt="Post" className="w-full h-auto" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-brand-500 fill-brand-500/20" />
                    <span className="text-xs text-gray-400 font-medium">{post.like_count} likes</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-snug">{post.content}</p>
                  <p className="text-[9px] text-gray-600 mt-3 uppercase tracking-tighter">
                    {new Date(post.post_date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
