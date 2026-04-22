import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CreatePostForm from "../components/CreatePostForm";
import { UserCircle2, Mail, CalendarDays, PenLine } from "lucide-react";
import AppNavbar from "../components/AppNavbar.tsx";

interface ProfileUser {
  user_id: number;
  username: string;
  email: string;
  bio: string | null;
  joined_date: string;
}

interface Post {
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  image_url: string | null;
  like_count: number;
  post_date: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const profileResponse = await axios.get(
          "http://localhost:8000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const currentUser = profileResponse.data.user as ProfileUser;
        let userPosts: Post[] = [];

        try {
          const postsResponse = await axios.get(
            `http://localhost:8000/posts/user/${currentUser.user_id}`,
          );
          userPosts = postsResponse.data as Post[];
        } catch (postsError) {
          console.error("Error loading user posts:", postsError);
        }

        setUser(currentUser);
        setPosts(userPosts);
        setError("");
      } catch (profileError) {
        console.error("Error loading profile:", profileError);
        setError("Unable to load profile data right now. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const refreshPosts = async () => {
    if (!user) {
      return;
    }

    try {
      const postsResponse = await axios.get(
        `http://localhost:8000/posts/user/${user.user_id}`,
      );
      setPosts(postsResponse.data as Post[]);
    } catch (postsError) {
      console.error("Error refreshing user posts:", postsError);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <AppNavbar
        activePage="profile"
        subtitle="Profile"
        onLogout={handleLogout}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-brand-400" />
              <p>Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
            {error}
          </div>
        ) : user ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/8 bg-dark-800/90 p-6 shadow-2xl shadow-black/20"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-blue text-3xl font-bold text-white shadow-lg shadow-brand-500/20">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-bold text-white">
                        {user.username}
                      </h1>
                      <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                        {posts.length} posts
                      </span>
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                      Simple profile overview for your HKGram account.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
                      <UserCircle2 className="h-4 w-4 text-brand-300" />
                      Username
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {user.username}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
                      <Mail className="h-4 w-4 text-brand-300" />
                      Email
                    </div>
                    <p className="text-lg font-semibold text-white break-all">
                      {user.email}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4 sm:col-span-2">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
                      <PenLine className="h-4 w-4 text-brand-300" />
                      Bio
                    </div>
                    <p className="text-sm leading-6 text-gray-300">
                      {user.bio?.trim() ? user.bio : "No bio added yet."}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-3xl border border-white/8 bg-dark-800/90 p-6 shadow-2xl shadow-black/20"
              >
                <h2 className="text-lg font-semibold text-white">Account</h2>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays className="h-4 w-4 text-brand-300" />
                      Joined
                    </div>
                    <p className="font-medium text-white">
                      {formatDate(user.joined_date)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Posts</p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {posts.length}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="rounded-3xl border border-white/8 bg-dark-800/90 p-6 shadow-2xl shadow-black/20">
              <CreatePostForm onPostCreated={refreshPosts} />
            </section>

            <section className="rounded-3xl border border-white/8 bg-dark-800/90 p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Your Posts
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    A simple view of your latest posts.
                  </p>
                </div>
                <Link
                  to="/feed"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                >
                  Go to Feed
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-gray-400">
                  No posts yet. Share something from the feed to see it here.
                </div>
              ) : (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <article
                      key={post.post_id}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {post.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(post.post_date)}
                          </p>
                        </div>
                        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                          {post.like_count} likes
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-gray-200">
                        {post.content}
                      </p>
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt="Post attachment"
                          className="mt-4 max-h-96 w-full rounded-xl object-cover"
                        />
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default Profile;
