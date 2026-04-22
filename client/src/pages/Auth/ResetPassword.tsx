import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/reset-password",
        {
          token,
          new_password: newPassword,
        },
      );

      if (response.data.success) {
        setCompleted(true);
      } else {
        setError(response.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to reset password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      key="reset-password"
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
        <h2 className="text-2xl font-bold text-white mb-2">Set new password</h2>
        <p className="text-gray-400 text-sm">
          Choose a secure password for your account.
        </p>
        {!token ? (
          <p className="mt-2 text-xs text-amber-300/90">
            Reset token not detected.
          </p>
        ) : null}
      </div>

      {completed ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-brand-300">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">Password updated</p>
            </div>
            <p className="text-sm text-gray-300">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-medium text-white transition hover:bg-brand-600"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-gray-300">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Enter a new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-dark-600 bg-dark-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-600 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-dark-600 bg-dark-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-600 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newPassword || !confirmPassword || submitting}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] ${
              !newPassword || !confirmPassword || submitting
                ? "cursor-not-allowed bg-dark-600 text-gray-400 shadow-none"
                : "bg-brand-500 hover:bg-brand-600 hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]"
            }`}
          >
            {submitting ? "Resetting..." : "Reset Password"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-gray-400">
        Back to{" "}
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

export default ResetPassword;
