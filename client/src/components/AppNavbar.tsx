import React from "react";
import { Link } from "react-router-dom";
import { Home, UserCircle2, LogOut } from "lucide-react";

type AppNavbarProps = {
  activePage: "feed" | "profile";
  subtitle: string;
  onLogout?: () => void;
};

const AppNavbar: React.FC<AppNavbarProps> = ({
  activePage,
  subtitle,
  onLogout,
}) => {
  const feedActive = activePage === "feed";
  const profileActive = activePage === "profile";

  const baseLinkClass =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition";

  const activeLinkClass =
    "border border-brand-400/30 bg-brand-500/10 text-white";
  const inactiveLinkClass =
    "border border-white/10 bg-white/5 text-gray-200 hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white";

  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-dark-800/80 backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
      </div>

      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link to="/feed" className="flex items-center gap-3">
          <img
            src="/hkgram_favicon_single.png"
            alt="HKGram Logo"
            className="h-10 w-10"
            draggable={false}
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
              HKGram
            </p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/feed"
            className={`${baseLinkClass} ${feedActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <Home className="h-4 w-4" />
            Feed
          </Link>
          <Link
            to="/profile"
            className={`${baseLinkClass} ${profileActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <UserCircle2 className="h-4 w-4" />
            Profile
          </Link>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </div>
  );
};

export default AppNavbar;
