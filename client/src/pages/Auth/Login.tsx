import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!emailOrUsername || !password) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        email: emailOrUsername,
        password: password,
      });

      if (response.data.success) {
        localStorage.setItem("access_token", response.data.access_token!);
        alert("Login successful!");
        navigate("/profile");
      } else {
        alert("Login failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred while trying to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="w-full max-w-sm"
    >
      <div className="flex items-center justify-center mb-8 lg:hidden">
        <img
          src="/hkgram_favicon_single.png"
          alt="HKGram Logo"
          className="w-14 h-14"
          draggable={false}
        />
        <span className="text-xl font-bold tracking-tight text-white">
          HKGram
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: -20,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="you@example.com or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs hover:cursor-pointer text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              className={`w-full bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl py-3 mt-6 transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 group ${!emailOrUsername || !password ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              type="submit"
              disabled={!emailOrUsername || !password || loading}
            >
              {loading ? "Logging in..." : "Log In"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Login;
