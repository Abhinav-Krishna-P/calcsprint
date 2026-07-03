import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getModeById } from "../questionGenerators";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { Trophy, Clock, CheckCircle, RefreshCw, Grid, Award, AlertCircle } from "lucide-react";

interface QuestionResult {
  question: string;
  correctAnswer: string | number;
  userAnswer: string;
  isCorrect: boolean;
  timeTakenMs: number;
  isTimeout: boolean;
}

interface LocationState {
  results: QuestionResult[];
  correctCount: number;
  totalCount: number;
  timePerQuestion: number;
  totalTimeSeconds: number;
}

export const Results: React.FC = () => {
  const { modeId } = useParams<{ modeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, updateQuizStats } = useAuth();
  const mode = modeId ? getModeById(modeId) : undefined;

  const state = location.state as LocationState | undefined;
  
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const hasSavedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!state || !mode || !user || !userProfile) {
      return;
    }

    // Guard to prevent double writes on React 18 strict mode double-effect run
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const saveQuizSession = async () => {
      setSaveError(null);
      
      const { correctCount, totalCount, timePerQuestion, totalTimeSeconds } = state;
      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      try {
        // 1. Check if a high score for this user/mode/questions combo already exists
        const scoreDocId = `${user.uid}_${mode.id}_${totalCount}`;
        const scoreDocRef = doc(db, "scores", scoreDocId);
        
        let shouldUpdateLeaderboard = true;
        try {
          const scoreDocSnap = await getDoc(scoreDocRef);
          if (scoreDocSnap.exists()) {
            const prevData = scoreDocSnap.data();
            const prevAccuracy = prevData.accuracy ?? 0;
            const prevTime = prevData.totalTimeSeconds ?? 999999;
            
            // Check if new attempt beats the previous best:
            // 1. Higher accuracy beats lower accuracy
            // 2. Equal accuracy with lower time beats higher time
            const beatsAccuracy = accuracy > prevAccuracy;
            const beatsTime = accuracy === prevAccuracy && totalTimeSeconds < prevTime;
            
            if (!beatsAccuracy && !beatsTime) {
              shouldUpdateLeaderboard = false;
            }
          }
        } catch (readErr) {
          console.warn("Could not read previous leaderboard score, overwriting anyway.", readErr);
        }

        if (shouldUpdateLeaderboard) {
          // Write/overwrite score record
          await setDoc(scoreDocRef, {
            uid: user.uid,
            username: userProfile.username,
            avatarId: userProfile.avatarId,
            modeId: mode.id,
            numQuestions: totalCount,
            timePerQuestion,
            correctCount,
            accuracy,
            totalTimeSeconds,
            completedAt: serverTimestamp()
          });
        }

        // 1b. Log session attempt historically to "history" collection
        await addDoc(collection(db, "history"), {
          uid: user.uid,
          username: userProfile.username,
          avatarId: userProfile.avatarId,
          modeId: mode.id,
          numQuestions: totalCount,
          timePerQuestion,
          correctCount,
          accuracy,
          totalTimeSeconds,
          completedAt: serverTimestamp()
        });

        // 2. Sync profile statistics and evaluate earned badges (happens on every session)
        const { newBadges: earned } = await updateQuizStats(
          mode.id,
          correctCount,
          totalCount,
          totalTimeSeconds
        );
        setNewBadges(earned);

      } catch (err: any) {
        console.error("Error saving score to Firebase", err);
        setSaveError("Failed to upload stats to the global database. Local session is still active.");
      }
    };

    saveQuizSession();
  }, [state, mode, user, userProfile, updateQuizStats]);

  if (!state || !mode) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-xl font-bold text-app-error mb-2">No Session Data Found</h2>
        <p className="text-sm text-app-secondary mb-6">Start a new drill to record results.</p>
        <Link to="/"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  const { results, correctCount, totalCount, timePerQuestion, totalTimeSeconds } = state;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const avgTime = totalCount > 0 ? (totalTimeSeconds / totalCount).toFixed(1) : "0.0";

  const handleRetry = () => {
    navigate(`/mode/${mode.id}/quiz`, {
      state: { numQuestions: totalCount, timePerQuestion }
    });
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 select-none">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-app-primary tracking-tight">Drill Results</h1>
        <p className="text-sm text-app-secondary mt-1">{mode.name} — Session Completed</p>
      </div>

      {saveError && (
        <div className="mb-6 p-4 bg-app-error/10 border border-app-error/20 text-app-error text-sm rounded-app flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Sync Error</div>
            <div className="mt-0.5">{saveError}</div>
          </div>
        </div>
      )}

      {/* New Badge Unlock Announcement */}
      {newBadges.length > 0 && (
        <div className="mb-6 p-6 bg-app-accent/15 border-2 border-app-accent/30 text-app-text rounded-app text-center max-w-xl mx-auto">
          <Award size={32} className="mx-auto text-app-accent mb-2" />
          <h3 className="text-lg font-extrabold text-app-accent tracking-tight">Badge Unlocked!</h3>
          <p className="text-xs text-app-secondary font-semibold mt-1">
            You earned the following achievement:
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {newBadges.map((badge) => {
              const formattedName = badge.replace("_", " ").toUpperCase();
              return (
                <span key={badge} className="bg-app-accent text-app-on-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  🏆 {formattedName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Trophy className="text-app-accent mb-2" size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider text-app-secondary">Score</span>
          <span className="text-2xl font-extrabold text-app-text tabular-nums mt-1">
            {correctCount} / {totalCount}
          </span>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle className="text-app-success mb-2" size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider text-app-secondary">Accuracy</span>
          <span className="text-2xl font-extrabold text-app-text tabular-nums mt-1">
            {accuracy}%
          </span>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Clock className="text-app-primary mb-2" size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider text-app-secondary">Total Time</span>
          <span className="text-2xl font-extrabold text-app-text tabular-nums mt-1">
            {totalTimeSeconds}s
          </span>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Clock className="text-app-secondary mb-2" size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider text-app-secondary">Avg Time / Q</span>
          <span className="text-2xl font-extrabold text-app-text tabular-nums mt-1">
            {avgTime}s
          </span>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button onClick={handleRetry} className="flex items-center justify-center gap-2 py-3.5">
          <RefreshCw size={16} />
          <span>Retry Session</span>
        </Button>
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 py-3.5">
            <Grid size={16} />
            <span>Select Other Mode</span>
          </Button>
        </Link>
        <Link to={`/leaderboard/${mode.id}`} className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 py-3.5">
            <Trophy size={16} />
            <span>Global Leaderboard</span>
          </Button>
        </Link>
      </div>

      {/* Question Details List (Diagnostic analysis) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-app-secondary border-b border-app-outline-variant/30 pb-2">
          Diagnostic Log (Questions Breakdown)
        </h3>

        <div className="border border-app-outline-variant rounded-app overflow-hidden bg-app-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-app-surface-container text-app-secondary font-bold uppercase tracking-wider border-b border-app-outline-variant">
                  <th className="p-3">Q</th>
                  <th className="p-3">Expression</th>
                  <th className="p-3">Correct Ans</th>
                  <th className="p-3">Your Ans</th>
                  <th className="p-3">Speed (ms)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-outline-variant/40 font-semibold">
                {results.map((r, i) => (
                  <tr key={i} className={r.isCorrect ? "hover:bg-app-success/5" : "hover:bg-app-error/5"}>
                    <td className="p-3 text-app-secondary font-bold tabular-nums">{i + 1}</td>
                    <td className="p-3 text-app-primary font-bold text-sm tabular-nums">{r.question}</td>
                    <td className="p-3 text-app-text font-bold tabular-nums">{r.correctAnswer}</td>
                    <td className={`p-3 font-extrabold tabular-nums ${r.isCorrect ? "text-app-success" : "text-app-error"}`}>
                      {r.userAnswer}
                    </td>
                    <td className="p-3 text-app-secondary tabular-nums">{(r.timeTakenMs / 1000).toFixed(2)}s</td>
                    <td className="p-3 text-center">
                      {r.isCorrect ? (
                        <span className="inline-block bg-app-success/15 text-app-success px-2 py-0.5 text-[9px] font-bold uppercase rounded-app tracking-wide">
                          Correct
                        </span>
                      ) : r.isTimeout ? (
                        <span className="inline-block bg-app-error/10 text-app-error px-2 py-0.5 text-[9px] font-bold uppercase rounded-app tracking-wide">
                          Timeout
                        </span>
                      ) : (
                        <span className="inline-block bg-app-error/15 text-app-error px-2 py-0.5 text-[9px] font-bold uppercase rounded-app tracking-wide">
                          Incorrect
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Results;
