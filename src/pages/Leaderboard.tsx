import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GAME_MODES, getModeById } from "../questionGenerators";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { getAvatarById } from "../components/AvatarSelector";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { Trophy, ChevronDown, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  uid: string;
  username: string;
  avatarId: string;
  correctCount: number;
  numQuestions: number;
  accuracy: number;
  totalTimeSeconds: number;
  completedAt: any;
}

export const Leaderboard: React.FC = () => {
  const { modeId } = useParams<{ modeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const activeModeId = modeId || "letter_to_num";
  const mode = getModeById(activeModeId);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number>(20);

  useEffect(() => {
    if (!mode) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const scoresRef = collection(db, "scores");
        
        // Robust query strategy:
        // Try querying with full indexing order first. If it fails (due to missing index in a new Firebase project),
        // catch the error, fallback to a simple filter query, and sort client-side in memory.
        let querySnapshot;
        try {
          const q = query(
            scoresRef,
            where("modeId", "==", mode.id),
            where("numQuestions", "==", selectedQuestions),
            orderBy("accuracy", "desc"),
            orderBy("totalTimeSeconds", "asc"),
            limit(50)
          );
          querySnapshot = await getDocs(q);
        } catch (indexErr: any) {
          console.warn("Index not ready, performing client-side fallback sorting", indexErr);
          // Fallback query (uses index merging, which is automatic and requires no custom composite index)
          const fallbackQ = query(
            scoresRef,
            where("modeId", "==", mode.id),
            where("numQuestions", "==", selectedQuestions),
            limit(100) // Fetch up to 100 entries to sort client-side
          );
          querySnapshot = await getDocs(fallbackQ);
        }

        const rawEntries: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          rawEntries.push({
            id: doc.id,
            uid: data.uid,
            username: data.username || "Anonymous",
            avatarId: data.avatarId || "speed",
            correctCount: data.correctCount,
            numQuestions: data.numQuestions,
            accuracy: data.accuracy,
            totalTimeSeconds: data.totalTimeSeconds,
            completedAt: data.completedAt
          });
        });

        // Group entries by user (uid) to only keep the best score per user (collapses historical duplicates)
        const bestEntriesByUser: { [uid: string]: LeaderboardEntry } = {};
        rawEntries.forEach((entry) => {
          const existing = bestEntriesByUser[entry.uid];
          if (!existing) {
            bestEntriesByUser[entry.uid] = entry;
          } else {
            // Compare new entry with existing best entry:
            // 1. Higher accuracy is better
            // 2. Equal accuracy with lower total time is better
            const beatsAccuracy = entry.accuracy > existing.accuracy;
            const beatsTime = entry.accuracy === existing.accuracy && entry.totalTimeSeconds < existing.totalTimeSeconds;
            
            if (beatsAccuracy || beatsTime) {
              bestEntriesByUser[entry.uid] = entry;
            }
          }
        });

        const uniqueUserEntries = Object.values(bestEntriesByUser);

        // Sort the unique user entries client-side
        const sortedEntries = uniqueUserEntries.sort((a, b) => {
          // Primary sort: Accuracy descending
          if (b.accuracy !== a.accuracy) {
            return b.accuracy - a.accuracy;
          }
          // Secondary sort: Total completion time ascending
          if (a.totalTimeSeconds !== b.totalTimeSeconds) {
            return a.totalTimeSeconds - b.totalTimeSeconds;
          }
          // Tertiary sort: Score count descending
          return b.correctCount - a.correctCount;
        });

        // Take top 50
        setEntries(sortedEntries.slice(0, 50));
      } catch (err: any) {
        console.error("Leaderboard fetch error", err);
        setError("Unable to retrieve leaderboard logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeModeId, mode, selectedQuestions]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/leaderboard/${e.target.value}`);
  };

  if (!mode) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-xl font-bold text-app-error mb-2">Mode Not Found</h2>
        <p className="text-sm text-app-secondary mb-6">The requested leaderboard category does not exist.</p>
        <Link to="/"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 select-none">
      {/* Header with Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-app-outline-variant/30 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-app-primary tracking-tight flex items-center gap-2">
            <Trophy className="text-app-accent" size={24} />
            <span>Global Rankings</span>
          </h1>
          <p className="text-xs text-app-secondary mt-1 uppercase font-bold tracking-wider">
            Top performers sorted by accuracy then speed
          </p>
        </div>

        {/* Custom Mode Select Dropdown */}
        <div className="relative min-w-[240px]">
          <select
            value={activeModeId}
            onChange={handleModeChange}
            className="w-full bg-app-surface border border-app-outline-variant px-3 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider text-app-text rounded-app focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary appearance-none cursor-pointer"
          >
            {GAME_MODES.map((m) => (
              <option key={m.id} value={m.id} className="text-xs font-semibold normal-case">
                {m.name} ({m.category})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-app-secondary">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Session Length Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-app-outline-variant/30 pb-4">
        {[10, 20, 30, 50].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setSelectedQuestions(count)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-app cursor-pointer transition-colors ${
              selectedQuestions === count
                ? "bg-app-primary border-app-primary text-app-on-primary font-bold shadow-sm"
                : "bg-app-surface border-app-outline-variant text-app-secondary hover:bg-app-surface-container hover:text-app-text"
            }`}
          >
            {count} Questions
          </button>
        ))}
      </div>

      {error && (
        <Card className="text-center p-8 mb-6 border-app-error/20 bg-app-error/5 text-app-error">
          <p className="text-sm font-semibold">{error}</p>
        </Card>
      )}

      {/* Leaderboard Entries List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-app-primary" />
          <p className="text-xs text-app-secondary font-bold uppercase tracking-widest mt-3">
            Loading leaderboards...
          </p>
        </div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-16">
          <Trophy size={40} className="text-app-outline-variant mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-app-text">No Records Yet</h3>
          <p className="text-xs text-app-secondary max-w-xs mx-auto mt-1.5 leading-relaxed">
            Be the first to complete a quiz in this mode and claim the #1 spot!
          </p>
          <div className="mt-6">
            <Link to={`/mode/${mode.id}/settings`}>
              <Button className="py-2.5 px-6">Start Training Session</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="border border-app-outline-variant bg-app-surface rounded-app overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-app-surface-container text-app-secondary font-bold uppercase tracking-wider border-b border-app-outline-variant">
                  <th className="p-3.5 w-16 text-center">Rank</th>
                  <th className="p-3.5">Aspirant</th>
                  <th className="p-3.5 text-center">Length</th>
                  <th className="p-3.5 text-center">Accuracy</th>
                  <th className="p-3.5 text-center">Time</th>
                  <th className="p-3.5 text-center">Avg/Q</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-outline-variant/40 font-semibold">
                {entries.map((entry, idx) => {
                  const avatar = getAvatarById(entry.avatarId);
                  const isCurrentUser = user && entry.uid === user.uid;
                  const rank = idx + 1;

                  // Render special rank styling for top 3
                  let rankDisplay: React.ReactNode = rank;
                  if (rank === 1) rankDisplay = "👑";
                  if (rank === 2) rankDisplay = "🥈";
                  if (rank === 3) rankDisplay = "🥉";

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-app-surface-container/30 transition-colors ${
                        isCurrentUser ? "bg-app-primary/5 hover:bg-app-primary/10 border-l-4 border-l-app-primary" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center text-sm font-extrabold tabular-nums select-none">
                        {rankDisplay}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl select-none" role="img" aria-label={avatar?.label}>
                            {avatar?.emoji || "🧠"}
                          </span>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold truncate max-w-[150px] sm:max-w-[240px] ${
                              isCurrentUser ? "text-app-primary" : "text-app-text"
                            }`}>
                              {entry.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] text-app-primary uppercase font-bold tracking-widest mt-0.5">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center tabular-nums text-app-secondary">
                        {entry.correctCount}/{entry.numQuestions}
                      </td>
                      <td className="p-3.5 text-center font-extrabold tabular-nums text-app-success">
                        {entry.accuracy}%
                      </td>
                      <td className="p-3.5 text-center font-bold tabular-nums text-app-primary">
                        {entry.totalTimeSeconds}s
                      </td>
                      <td className="p-3.5 text-center tabular-nums text-app-secondary">
                        {(entry.totalTimeSeconds / entry.numQuestions).toFixed(2)}s
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
  );
};

export default Leaderboard;
