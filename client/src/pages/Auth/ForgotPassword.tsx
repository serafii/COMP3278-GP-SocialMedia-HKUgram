import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/forgot-password",
        {
          email: email,
        },
      );

      if (response.data.success) {
        setSubmitted(true);
      } else if (response.data.success === false) {
        alert(response.data.message || "Failed to send reset instructions.");
      } else {
        alert("Failed to send reset instructions");
      }
    } catch (error) {
      console.error("Error sending reset instructions:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      key="forgot-password"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
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

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reset password</h2>
        <p className="text-gray-400 text-sm">
          Enter your account email and we will send reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-brand-300">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-semibold">Check your inbox</p>
            </div>
            <p className="text-sm text-gray-300">
              If an account exists for this email, reset instructions have been
              sent. Use the secure link in that email to open the reset page.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-gray-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-dark-600 bg-dark-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-600 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className={`mt-6 flex hover:cursor-pointer w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] ${!email || submitting ? "cursor-not-allowed bg-dark-600 text-gray-400 shadow-none" : "bg-brand-500 hover:bg-brand-600 hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]"}`}
            type="submit"
            disabled={!email || submitting}
          >
            {submitting ? "Sending..." : "Send Reset Link"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-gray-400">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-medium text-brand-400 transition-colors hover:text-brand-300"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
