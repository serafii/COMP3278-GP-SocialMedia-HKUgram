import React from "react";
import { motion } from "framer-motion";
import media from "../assets/media.png";
import Login from "./Auth/Login";
import CreateAccount from "./Auth/CreateAccount";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";
import { useLocation } from "react-router-dom";

const Home: React.FC = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-full flex flex-row bg-dark-900 text-white font-sans overflow-hidden">
      {/* Left Side*/}
      <div className="relative hidden lg:flex flex-1 flex-col items-center justify-center p-12 xl:p-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/12 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
          <div className="absolute bottom-[-20%] right-[-5%] w-80 h-80 bg-accent-blue/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-6 flex items-center justify-center flex-row"
          >
            <img
              src="/hkgram_favicon_single.png"
              alt="HKGram Logo"
              className="w-14 h-14"
              draggable={false}
            />
            <span className="text-2xl font-bold tracking-tight text-white">
              HKGram
            </span>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="text-3xl xl:text-4xl font-bold leading-tight mb-3 text-white"
          >
            Your conversations,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-400 to-accent-blue">
              all in one place.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            className="text-gray-400 mb-8 text-sm leading-relaxed"
          >
            Share your world, connect with your friends, and discover new
            communities.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="flex justify-center"
          >
            <img
              src={media}
              alt="Social media app image"
              className="max-w-full max-h-[40vh] object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-120 xl:w-135 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10 bg-dark-800">
        <div className="w-full lg:w-120 xl:w-135 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10 bg-dark-800">
          {location.pathname === "/login" ? (
            <Login />
          ) : location.pathname === "/forgot-password" ? (
            <ForgotPassword />
          ) : location.pathname === "/reset-password" ? (
            <ResetPassword />
          ) : (
            <CreateAccount />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
