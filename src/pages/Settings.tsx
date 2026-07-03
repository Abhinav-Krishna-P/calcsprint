import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getModeById } from "../questionGenerators";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ChevronLeft, HelpCircle, Clock, Play } from "lucide-react";

export const Settings: React.FC = () => {
  const { modeId } = useParams<{ modeId: string }>();
  const navigate = useNavigate();
  const mode = modeId ? getModeById(modeId) : undefined;

  // Question options: 10, 20, 30, 50
  const questionCountOptions = [10, 20, 30, 50];
  const [numQuestions, setNumQuestions] = useState<number>(20); // Default to 20 questions

  // Time options: 5, 10, 12, 15, 17, 20
  const timeLimitOptions = [5, 10, 12, 15, 17, 20];
  const [timePerQuestion, setTimePerQuestion] = useState<number>(12); // Default to 12s

  if (!mode) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-xl font-bold text-app-error mb-2">Mode Not Found</h2>
        <p className="text-sm text-app-secondary mb-6">The requested training mode does not exist.</p>
        <Link to="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleStartQuiz = () => {
    navigate(`/mode/${mode.id}/quiz`, {
      state: { numQuestions, timePerQuestion }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 max-w-xl mx-auto w-full select-none pb-24 md:pb-8">
      {/* Back button */}
      <div className="w-full mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-app-secondary hover:text-app-primary transition-colors">
          <ChevronLeft size={16} />
          <span>Dashboard</span>
        </Link>
      </div>

      <Card className="w-full">
        {/* Mode info */}
        <div className="text-center border-b border-app-outline-variant/30 pb-6 mb-6">
          <span className="inline-block bg-app-primary/10 text-app-primary dark:text-app-primary dark:bg-app-primary/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 mb-3 rounded-app">
            {mode.category} Module
          </span>
          <h2 className="text-2xl font-extrabold text-app-text tracking-tight">{mode.name}</h2>
          <p className="text-sm text-app-secondary mt-2 leading-relaxed">
            {mode.description}
          </p>
        </div>

        <div className="space-y-6">
          {/* Question count selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-app-secondary mb-3 flex items-center gap-1">
              <HelpCircle size={14} />
              <span>Session Length (Questions)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {questionCountOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setNumQuestions(option)}
                  className={`py-2 text-sm font-bold border transition-colors cursor-pointer rounded-app tabular-nums ${
                    numQuestions === option
                      ? "bg-app-primary border-app-primary text-app-on-primary"
                      : "bg-app-bg border-app-outline-variant text-app-text hover:bg-app-surface-container"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Time limit selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-app-secondary mb-3 flex items-center gap-1">
              <Clock size={14} />
              <span>Time Limit Per Question</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {timeLimitOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTimePerQuestion(option)}
                  className={`py-2 text-sm font-bold border transition-colors cursor-pointer rounded-app tabular-nums ${
                    timePerQuestion === option
                      ? "bg-app-primary border-app-primary text-app-on-primary"
                      : "bg-app-bg border-app-outline-variant text-app-text hover:bg-app-surface-container"
                  }`}
                >
                  {option}s
                </button>
              ))}
            </div>
            <p className="text-[10px] text-app-secondary mt-1.5 leading-relaxed">
              If the timer runs out, the answer is checked and marked as incorrect. Speed is factored into badge achievements!
            </p>
          </div>

          {/* Start button */}
          <Button
            onClick={handleStartQuiz}
            className="w-full py-4 mt-4 flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Drill Session</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default Settings;
