import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvatarById } from "./AvatarSelector";
import { Sun, Moon, LogOut, Trophy, Home, Zap, Calendar } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(false);

  // Sync theme with document class on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) => {
    const active = isActive(path);
    return `font-label-caps text-xs font-bold tracking-wider uppercase transition-colors duration-150 py-2 border-b-2 ${
      active 
        ? "text-app-primary border-app-primary dark:text-app-primary dark:border-app-primary" 
        : "text-app-secondary border-transparent hover:text-app-text"
    }`;
  };

  const avatar = userProfile?.avatarId ? getAvatarById(userProfile.avatarId) : null;

  return (
    <>
      {/* Desktop Header & Top bar for mobile */}
      <header
        className="fixed top-0 left-0 w-full z-40 bg-app-surface border-b border-app-outline-variant flex items-center px-4 md:px-8 justify-between"
        style={{
          height: "calc(4rem + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-sans text-xl font-extrabold text-app-primary tracking-tight select-none">
            <Zap size={20} className="text-app-accent fill-app-accent" />
            <span>CALCSPRINT</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          {user && userProfile && (
            <nav className="hidden md:flex gap-6 items-center h-16 pt-0.5">
              <Link to="/" className={navLinkClass("/")}>Dashboard</Link>
              <Link to="/leaderboard/letter_to_num" className={navLinkClass("/leaderboard")}>Leaderboards</Link>
              <Link to="/timeline" className={navLinkClass("/timeline")}>Timeline</Link>
              <Link to="/profile" className={navLinkClass("/profile")}>Profile</Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-app-outline-variant text-app-secondary hover:text-app-text transition-colors cursor-pointer rounded-app"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Info & Logout */}
          {user && userProfile && (
            <>
              <div className="hidden md:flex items-center gap-3 border-l border-app-outline-variant pl-4">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80">
                  {avatar && (
                    <span className="text-2xl select-none" role="img" aria-label={avatar.label}>
                      {avatar.emoji}
                    </span>
                  )}
                  <span className="text-sm font-bold text-app-text truncate max-w-[120px]">
                    {userProfile.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 border border-app-outline-variant text-app-secondary hover:text-app-error hover:border-app-error transition-colors cursor-pointer rounded-app"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Mobile Logout Button (Visible only on mobile header) */}
              <button
                onClick={handleLogout}
                className="md:hidden p-2 border border-app-outline-variant text-app-secondary hover:text-app-error hover:border-app-error transition-colors cursor-pointer rounded-app"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation (Visible only on mobile screens when logged in) */}
      {user && userProfile && (
        <nav
          className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-app-surface border-t border-app-outline-variant flex items-center justify-around px-2"
          style={{
            height: "calc(4rem + env(safe-area-inset-bottom))",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <Link
            to="/"
            className={`flex flex-col items-center justify-center w-20 h-12 text-xs font-bold transition-all ${
              isActive("/") 
                ? "text-app-primary font-bold scale-105" 
                : "text-app-secondary"
            }`}
          >
            <Home size={20} className="mb-1" />
            <span>Home</span>
          </Link>
          
          <Link
            to="/leaderboard/letter_to_num"
            className={`flex flex-col items-center justify-center w-20 h-12 text-xs font-bold transition-all ${
              isActive("/leaderboard") 
                ? "text-app-primary font-bold scale-105" 
                : "text-app-secondary"
            }`}
          >
            <Trophy size={20} className="mb-1" />
            <span>Leaderboard</span>
          </Link>

          <Link
            to="/timeline"
            className={`flex flex-col items-center justify-center w-20 h-12 text-xs font-bold transition-all ${
              isActive("/timeline") 
                ? "text-app-primary font-bold scale-105" 
                : "text-app-secondary"
            }`}
          >
            <Calendar size={20} className="mb-1" />
            <span>Timeline</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center w-20 h-12 text-xs font-bold transition-all ${
              isActive("/profile") 
                ? "text-app-primary font-bold scale-105" 
                : "text-app-secondary"
            }`}
          >
            <span className="text-xl leading-none select-none mb-0.5" role="img" aria-label="avatar">
              {avatar?.emoji || "🧠"}
            </span>
            <span>Profile</span>
          </Link>
        </nav>
      )}

      {/* Spacers for layouts */}
      <div
        className="w-full shrink-0"
        style={{ height: "calc(4rem + env(safe-area-inset-top))" }}
      />
    </>
  );
};
export default Navbar;
