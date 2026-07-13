import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GAME_MODES } from "../questionGenerators";
import type { ModeCategory } from "../questionGenerators";
import { Card } from "../components/Card";
import { Trophy, Star, Zap, Keyboard, Award, Binary } from "lucide-react";
import { getAvatarById } from "../components/AvatarSelector";

export const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Group game modes by category
  const categories: { name: ModeCategory; icon: React.ReactNode; color: string }[] = [
    { name: "Alphabet", icon: <Keyboard size={18} />, color: "border-l-4 border-l-blue-500" },
    { name: "Arithmetic", icon: <Zap size={18} />, color: "border-l-4 border-l-amber-500" },
    { name: "Multiplication", icon: <Star size={18} />, color: "border-l-4 border-l-purple-500" },
    { name: "Division", icon: <Trophy size={18} />, color: "border-l-4 border-l-emerald-500" },
    { name: "Powers", icon: <Award size={18} />, color: "border-l-4 border-l-rose-500" },
    { name: "Divisibility", icon: <Keyboard size={18} />, color: "border-l-4 border-l-indigo-500" },
    { name: "Algebra", icon: <Binary size={18} />, color: "border-l-4 border-l-pink-500" }
  ];

  const handleModeClick = (modeId: string) => {
    navigate(`/mode/${modeId}/settings`);
  };

  const userAvatar = userProfile?.avatarId ? getAvatarById(userProfile.avatarId) : null;

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Welcome Banner Card */}
      {userProfile && (
        <div className="mb-8 p-6 md:p-8 bg-app-primary text-app-on-primary rounded-app border border-app-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-5xl select-none" role="img" aria-label="user avatar">
              {userAvatar?.emoji || "🧠"}
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Welcome back, {userProfile.username}
              </h1>
              <p className="text-xs md:text-sm text-app-on-primary/70 mt-0.5">
                Ready to sharpen your calculation reflexes today? Select a mode below to start training.
              </p>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="bg-app-on-primary/10 border border-app-on-primary/15 px-4 py-2 text-center rounded-app">
              <div className="text-xs uppercase tracking-wider font-bold text-app-on-primary/60">Badges</div>
              <div className="text-xl font-extrabold text-app-accent tabular-nums mt-0.5">
                {userProfile.badges?.length || 0}
              </div>
            </div>
            <div className="bg-app-on-primary/10 border border-app-on-primary/15 px-4 py-2 text-center rounded-app">
              <div className="text-xs uppercase tracking-wider font-bold text-app-on-primary/60">Total Attempts</div>
              <div className="text-xl font-extrabold text-white tabular-nums mt-0.5">
                {Object.values(userProfile.stats || {}).reduce((acc, s) => acc + (s.totalAttempts || 0), 0)}
              </div>
            </div>
          </div>

          {/* Abstract Grid background */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
        </div>
      )}

      {/* Modes Grid by Category */}
      <div className="space-y-10">
        {categories.map((category) => {
          const modesInCategory = GAME_MODES.filter(m => m.category === category.name);
          if (modesInCategory.length === 0) return null;

          return (
            <div key={category.name} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-outline-variant pb-2">
                <span className="text-app-primary">{category.icon}</span>
                <h2 className="text-md uppercase font-bold tracking-widest text-app-secondary">
                  {category.name} Training
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modesInCategory.map((mode) => {
                  const stat = userProfile?.stats?.[mode.id];
                  
                  return (
                    <Card
                      key={mode.id}
                      onClick={() => handleModeClick(mode.id)}
                      className={`hover:border-app-primary transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${category.color} relative group p-5 md:p-6`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-extrabold text-base text-app-text group-hover:text-app-primary transition-colors">
                            {mode.name}
                          </h3>
                        </div>
                        <p className="text-xs text-app-secondary leading-relaxed mb-4">
                          {mode.description}
                        </p>
                      </div>

                      {/* Display mode stats if available */}
                      {stat && stat.totalAttempts > 0 ? (
                        <div className="mt-auto border-t border-app-outline-variant/30 pt-3 flex justify-between items-center text-[10px] text-app-secondary font-bold uppercase tracking-wider">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-app-secondary/60">Best Score</span>
                            <span className="text-app-text text-xs font-bold tabular-nums mt-0.5">
                              {stat.bestScore} Pts
                            </span>
                          </div>
                          <div className="flex flex-col text-center">
                            <span className="text-[9px] text-app-secondary/60">Accuracy</span>
                            <span className="text-app-text text-xs font-bold tabular-nums mt-0.5">
                              {stat.bestAccuracy}%
                            </span>
                          </div>
                          <div className="flex flex-col text-end">
                            <span className="text-[9px] text-app-secondary/60">Attempts</span>
                            <span className="text-app-text text-xs font-bold tabular-nums mt-0.5">
                              {stat.totalAttempts}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-auto border-t border-app-outline-variant/30 pt-3 text-[10px] font-bold uppercase tracking-wider text-app-secondary/40">
                          Unplayed Mode
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Dashboard;
