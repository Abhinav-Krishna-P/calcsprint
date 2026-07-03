import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { Globe, Mail, Lock, AlertCircle, Zap } from "lucide-react";

export const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      if (isLoginTab) {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Auth error", err);
      // Map common errors to readable format
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      console.error("Google sign in failed", err);
      setError(err.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-app-bg text-app-text">
      {/* Left Column: Hero (Visible on desktop) */}
      <div className="md:w-1/2 bg-app-primary text-app-on-primary p-8 md:p-16 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-extrabold text-2xl tracking-tight mb-2">
            <Zap size={22} className="text-app-accent fill-app-accent" />
            <span>CALCSPRINT</span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-app-on-primary/60 font-bold">
            ACADEMIC PERFORMANCE DIVISION
          </div>
        </div>

        <div className="relative z-10 my-12 max-w-lg">
          <div className="inline-block bg-app-accent/20 border border-app-accent/30 text-app-accent px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6 rounded-app">
            QUANTITATIVE TRAINING ENVIRONMENT
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Master Mental Calculation For Competitive Exams.
          </h1>
          <p className="text-base md:text-lg text-app-on-primary/80 leading-relaxed">
            High-speed, rigorous calculation drills designed for SSC, Bank PO, Railways, and civil service aspirants.
          </p>
        </div>

        <div className="relative z-10 text-xs text-app-on-primary/50 font-bold uppercase tracking-widest">
          SYSTEM CLOCK v4.2.0
        </div>
        
        {/* Abstract background grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Right Column: Auth Form */}
      <div className="md:w-1/2 p-4 md:p-16 flex flex-col justify-center items-center bg-app-bg">
        <div className="max-w-[420px] w-full">
          {/* Logo for mobile */}
          <div className="md:hidden text-center mb-8 select-none">
            <h2 className="flex items-center justify-center gap-2 text-3xl font-extrabold text-app-primary tracking-tight">
              <Zap size={26} className="text-app-accent fill-app-accent" />
              <span>CALCSPRINT</span>
            </h2>
            <p className="text-xs uppercase tracking-wider text-app-secondary font-bold mt-1">
              Quantitative drills
            </p>
          </div>

          <Card className="w-full">
            {/* Login / Register tabs */}
            <div className="grid grid-cols-2 border-b border-app-outline-variant mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setError(null);
                }}
                className={`py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  isLoginTab
                    ? "text-app-primary border-app-primary font-bold"
                    : "text-app-secondary border-transparent hover:text-app-text"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setError(null);
                }}
                className={`py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  !isLoginTab
                    ? "text-app-primary border-app-primary font-bold"
                    : "text-app-secondary border-transparent hover:text-app-text"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-app-error/10 border border-app-error/20 text-app-error text-sm rounded-app flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-app-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-app-secondary pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-app-bg border border-app-outline-variant rounded-app text-sm text-app-text placeholder-app-secondary/50 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all duration-150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-app-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-app-secondary pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-app-bg border border-app-outline-variant rounded-app text-sm text-app-text placeholder-app-secondary/50 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all duration-150"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? "Authenticating..." : isLoginTab ? "Access Terminal" : "Create Account"}
              </Button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-app-outline-variant"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-app-secondary/60">
                OR SIGN IN WITH
              </span>
              <div className="flex-grow border-t border-app-outline-variant"></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              <Globe size={16} />
              <span>Google Credentials</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Login;
