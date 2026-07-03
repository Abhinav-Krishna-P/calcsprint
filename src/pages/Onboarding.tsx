import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AvatarSelector } from "../components/AvatarSelector";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export const Onboarding: React.FC = () => {
  const { createProfile, checkUsernameUnique, userProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("speed");
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Redirect if they already have a profile
  useEffect(() => {
    if (userProfile) {
      navigate("/");
    }
  }, [userProfile, navigate]);

  // Debounce username unique checks
  useEffect(() => {
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setIsUnique(null);
      return;
    }

    // RegEx validation: letters, numbers, underscores only
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(cleanUsername)) {
      setIsUnique(false);
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    } else {
      setError(null);
    }

    setIsChecking(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const unique = await checkUsernameUnique(cleanUsername);
        setIsUnique(unique);
        if (!unique) {
          setError("Username is already taken.");
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Checking username uniqueness error", err);
      } finally {
        setIsChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [username, checkUsernameUnique]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (cleanUsername.length > 15) {
      setError("Username must be 15 characters or less.");
      return;
    }
    if (isUnique === false) {
      setError("Please choose a unique username.");
      return;
    }
    if (isChecking) {
      setError("Still validating username. Please wait.");
      return;
    }

    setLoading(true);
    try {
      await createProfile(cleanUsername, selectedAvatar);
      navigate("/");
    } catch (err: any) {
      console.error("Failed to create profile", err);
      setError(err.message || "Failed to initialize profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col justify-center items-center p-4 md:p-8 select-none">
      <div className="max-w-[480px] w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-app-primary tracking-tight">Create Your Profile</h2>
          <p className="text-sm text-app-secondary mt-1">
            Establish your identity for the CalcSprint leaderboards
          </p>
        </div>

        <Card className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-app-error/10 border border-app-error/20 text-app-error text-sm rounded-app flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-app-secondary mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                  placeholder="e.g. math_wizard"
                  maxLength={15}
                  className="w-full px-3 py-2.5 bg-app-bg border border-app-outline-variant rounded-app text-sm text-app-text placeholder-app-secondary/50 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all duration-150 pr-10"
                />
                
                {/* Visual validation status icons */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isChecking && <Loader2 size={16} className="animate-spin text-app-secondary" />}
                  {!isChecking && isUnique === true && username.trim().length >= 3 && (
                    <CheckCircle size={16} className="text-app-success" />
                  )}
                  {!isChecking && isUnique === false && username.trim().length >= 3 && (
                    <AlertCircle size={16} className="text-app-error" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-app-secondary mt-1">
                Letters, numbers, and underscores only. 3-15 characters.
              </p>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-app-secondary mb-3">
                Select Your Avatar
              </label>
              <AvatarSelector selectedId={selectedAvatar} onSelect={setSelectedAvatar} />
            </div>

            <Button
              type="submit"
              disabled={loading || isUnique !== true || isChecking}
              className="w-full py-3 mt-4"
            >
              {loading ? "Initializing Profile..." : "Initialize Profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default Onboarding;
