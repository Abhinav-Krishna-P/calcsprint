import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAvatarById, AVATARS } from "../components/AvatarSelector";
import { GAME_MODES } from "../questionGenerators";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Award, BarChart2, Edit2, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const BADGES_CONFIG: BadgeConfig[] = [
  {
    id: "first_quiz",
    name: "First Quiz",
    description: "Completed any 1 mental math training run.",
    icon: "🏆",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30"
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Completed a drill with average answer speed under 3 seconds.",
    icon: "⚡",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30"
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Achieved 100% accuracy on any quiz of 20+ questions.",
    icon: "🎯",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "Completed 100 total mental math quiz attempts.",
    icon: "💯",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/30"
  }
];

export const Profile: React.FC = () => {
  const { user, userProfile, updateUsername, checkUsernameUnique } = useAuth();
  const [showAvatarEditor, setShowAvatarEditor] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Username edit states
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(userProfile?.username || "");
  const [isCheckingUnique, setIsCheckingUnique] = useState<boolean>(false);
  const [isNameUnique, setIsNameUnique] = useState<boolean | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Debounce username uniqueness checks
  useEffect(() => {
    if (!isEditingName || !userProfile) return;

    const cleanUsername = newUsername.trim();
    if (cleanUsername === userProfile.username) {
      setIsNameUnique(true);
      setNameError(null);
      return;
    }

    if (cleanUsername.length < 3) {
      setIsNameUnique(null);
      setNameError(null);
      return;
    }

    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(cleanUsername)) {
      setIsNameUnique(false);
      setNameError("Username can only contain letters, numbers, and underscores.");
      return;
    } else {
      setNameError(null);
    }

    setIsCheckingUnique(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const unique = await checkUsernameUnique(cleanUsername);
        setIsNameUnique(unique);
        if (!unique) {
          setNameError("Username is already taken.");
        } else {
          setNameError(null);
        }
      } catch (err) {
        console.error("Checking username uniqueness error", err);
      } finally {
        setIsCheckingUnique(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [newUsername, isEditingName, userProfile, checkUsernameUnique]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile || updating) return;
    const cleanUsername = newUsername.trim();
    if (cleanUsername === userProfile.username) {
      setIsEditingName(false);
      return;
    }

    setUpdating(true);
    setError(null);
    setNameError(null);
    try {
      await updateUsername(cleanUsername);
      setIsEditingName(false);
    } catch (err: any) {
      console.error("Failed to update username", err);
      setNameError(err.message || "Failed to save username change.");
    } finally {
      setUpdating(false);
    }
  };

  const activeAvatar = userProfile?.avatarId ? getAvatarById(userProfile.avatarId) : null;

  const handleAvatarChange = async (avatarId: string) => {
    if (!user || !userProfile) return;
    setUpdating(true);
    setError(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        avatarId: avatarId
      });
      // Context will automatically sync via snapshot, but local update helps prevent UI delay
      userProfile.avatarId = avatarId;
      setShowAvatarEditor(false);
    } catch (err: any) {
      console.error("Failed to update avatar", err);
      setError("Failed to save avatar change.");
    } finally {
      setUpdating(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-sm text-app-secondary">No user profile found.</p>
      </div>
    );
  }

  // Calculate overall calculations completed
  const playedModes = Object.keys(userProfile.stats || {});
  const totalAttempts = playedModes.reduce((acc, modeId) => acc + (userProfile.stats[modeId]?.totalAttempts || 0), 0);
  
  // Format createdAt date
  const joinDate = userProfile.createdAt 
    ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 select-none">
      {/* Upper Grid: Profile Detail Card & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Card */}
        <Card className="md:col-span-1 flex flex-col items-center justify-between text-center relative p-6">
          <div className="w-full flex flex-col items-center">
            {/* Avatar Visual with Edit overlay */}
            <div className="relative group mb-4">
              <span className="text-6xl p-4 bg-app-surface-container rounded-full border border-app-outline-variant/30 select-none inline-block shadow-inner">
                {activeAvatar?.emoji || "🧠"}
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarEditor(!showAvatarEditor)}
                className="absolute bottom-0 right-0 p-1.5 bg-app-primary text-app-on-primary rounded-full hover:opacity-90 cursor-pointer shadow-md"
                title="Change Avatar"
              >
                <Edit2 size={12} />
              </button>
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} className="w-full mt-2 max-w-[240px] flex flex-col items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.replace(/\s+/g, ""))}
                    maxLength={15}
                    disabled={updating}
                    className="w-full text-center px-3 py-1.5 bg-app-bg border border-app-outline-variant rounded-app text-sm text-app-text placeholder-app-secondary/50 focus:outline-none focus:border-app-primary transition-all pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                    {isCheckingUnique && <Loader2 size={14} className="animate-spin text-app-secondary" />}
                    {!isCheckingUnique && isNameUnique === true && newUsername.trim() !== userProfile.username && (
                      <CheckCircle size={14} className="text-app-success" />
                    )}
                    {!isCheckingUnique && isNameUnique === false && (
                      <AlertCircle size={14} className="text-app-error" />
                    )}
                  </div>
                </div>

                {nameError && (
                  <p className="text-[10px] text-app-error mt-1 text-center leading-tight">
                    {nameError}
                  </p>
                )}

                <div className="flex justify-center gap-2 mt-3 w-full">
                  <Button
                    type="submit"
                    disabled={updating || isCheckingUnique || isNameUnique === false || newUsername.trim().length < 3}
                    variant="primary"
                    className="py-1.5 px-4 text-xs h-8"
                  >
                    {updating ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNewUsername(userProfile.username);
                      setNameError(null);
                    }}
                    variant="secondary"
                    disabled={updating}
                    className="py-1.5 px-4 text-xs h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-1 select-none">
                <h2 className="text-xl font-extrabold text-app-primary tracking-tight">
                  {userProfile.username}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setNewUsername(userProfile.username);
                    setIsNameUnique(null);
                    setNameError(null);
                  }}
                  className="p-1 hover:text-app-primary text-app-secondary transition-colors cursor-pointer"
                  title="Edit Username"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-app-secondary uppercase font-bold tracking-widest mt-1 flex items-center gap-1">
              <Calendar size={12} />
              <span>Aspirant Since {joinDate}</span>
            </p>
          </div>

          <div className="w-full border-t border-app-outline-variant/30 pt-4 mt-6 flex justify-around text-center">
            <div className="flex flex-col">
              <span className="text-[9px] text-app-secondary/60 uppercase font-bold tracking-wider">Runs</span>
              <span className="text-base font-extrabold text-app-text tabular-nums mt-0.5">{totalAttempts}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-app-secondary/60 uppercase font-bold tracking-wider">Unlocks</span>
              <span className="text-base font-extrabold text-app-text tabular-nums mt-0.5">
                {userProfile.badges?.length || 0} / 4
              </span>
            </div>
          </div>
        </Card>

        {/* Badges Collection Card */}
        <Card className="md:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-app-secondary border-b border-app-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
              <Award size={16} />
              <span>Unlocked Achievement Badges</span>
            </h3>

            {error && <p className="text-xs text-app-error mb-4">{error}</p>}

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES_CONFIG.map((badge) => {
                const isEarned = userProfile.badges?.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 p-3 border rounded-app transition-all duration-150 ${
                      isEarned
                        ? "border-app-accent/40 bg-app-accent/5"
                        : "border-app-outline-variant/30 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl select-none" role="img" aria-label={badge.name}>
                      {badge.icon}
                    </span>
                    <div>
                      <h4 className={`text-sm font-bold ${isEarned ? "text-app-text" : "text-app-secondary"}`}>
                        {badge.name}
                      </h4>
                      <p className="text-[10px] text-app-secondary leading-relaxed mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Avatar Select Pop-out */}
      {showAvatarEditor && (
        <Card className="mb-8 border-app-primary/30 bg-app-surface-container/20 p-6 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-app-primary">
              Choose Avatar
            </h3>
            <button
              onClick={() => setShowAvatarEditor(false)}
              className="text-xs font-bold uppercase text-app-secondary hover:text-app-text"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {AVATARS.map((avatar) => {
              const isCurrent = avatar.id === userProfile.avatarId;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={updating}
                  onClick={() => handleAvatarChange(avatar.id)}
                  className={`flex flex-col items-center p-2.5 border transition-all rounded-app cursor-pointer hover:bg-app-surface-container ${
                    isCurrent
                      ? "border-app-primary bg-app-surface-container ring-1 ring-app-primary"
                      : "border-app-outline-variant bg-app-surface"
                  }`}
                >
                  <span className="text-2xl select-none">{avatar.emoji}</span>
                  <span className="text-[9px] uppercase text-app-secondary mt-1 font-semibold truncate max-w-[50px]">
                    {avatar.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Mode Stats Details Log */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-app-secondary border-b border-app-outline-variant/30 pb-2 flex items-center gap-2">
          <BarChart2 size={16} />
          <span>Performance Overview Per Mode</span>
        </h3>

        {playedModes.length === 0 ? (
          <Card className="text-center py-12 text-app-secondary text-sm">
            You haven't completed any sessions yet. Run calculation drills from the Dashboard to record performance logs.
          </Card>
        ) : (
          <div className="border border-app-outline-variant bg-app-surface rounded-app overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-app-surface-container text-app-secondary font-bold uppercase tracking-wider border-b border-app-outline-variant">
                    <th className="p-3.5">Training Mode</th>
                    <th className="p-3.5 text-center">Total Runs</th>
                    <th className="p-3.5 text-center">Best Score</th>
                    <th className="p-3.5 text-center">Best Accuracy</th>
                    <th className="p-3.5 text-center">Fastest Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-outline-variant/40 font-semibold">
                  {GAME_MODES.map((mode) => {
                    const stat = userProfile.stats?.[mode.id];
                    if (!stat || stat.totalAttempts === 0) return null;

                    return (
                      <tr key={mode.id} className="hover:bg-app-surface-container/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-app-text">{mode.name}</span>
                            <span className="text-[9px] text-app-secondary uppercase font-bold tracking-widest mt-0.5">
                              {mode.category}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center tabular-nums text-app-secondary">{stat.totalAttempts}</td>
                        <td className="p-3.5 text-center tabular-nums text-app-text font-bold">{stat.bestScore} Pts</td>
                        <td className="p-3.5 text-center tabular-nums text-app-success font-extrabold">{stat.bestAccuracy}%</td>
                        <td className="p-3.5 text-center tabular-nums text-app-primary font-bold">
                          {stat.bestTimeSeconds === 999999 ? "—" : `${stat.bestTimeSeconds}s`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
