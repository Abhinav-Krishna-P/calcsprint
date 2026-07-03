import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getModeById } from "../questionGenerators";
import type { Question } from "../questionGenerators";
import { TimerBar } from "../components/TimerBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { X } from "lucide-react";

interface LocationState {
  numQuestions: number;
  timePerQuestion: number;
}

interface QuestionResult {
  question: string;
  correctAnswer: string | number;
  userAnswer: string;
  isCorrect: boolean;
  timeTakenMs: number;
  isTimeout: boolean;
}

export const Quiz: React.FC = () => {
  const { modeId } = useParams<{ modeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = modeId ? getModeById(modeId) : undefined;

  // Resolve config from location state or default
  const state = location.state as LocationState | undefined;
  const numQuestions = state?.numQuestions ?? 20;
  const timePerQuestion = state?.timePerQuestion ?? 12;

  // Quiz Engine States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [results, setResults] = useState<QuestionResult[]>([]);
  
  // Scoring & Stats
  const [correctCount, setCorrectCount] = useState<number>(0);
  
  // Timer States
  const [secondsLeft, setSecondsLeft] = useState<number>(timePerQuestion);
  const [timerProgress, setTimerProgress] = useState<number>(100);
  
  // Feedback States (for animations and delays)
  const [feedbackState, setFeedbackState] = useState<"none" | "correct" | "incorrect" | "timeout">("none");
  const [timeoutAnswer, setTimeoutAnswer] = useState<string | number>("");
  const [prepCountdown, setPrepCountdown] = useState<number | null>(3);

  const inputRef = useRef<HTMLInputElement>(null);
  const quizStartTimeRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(0);

  // Initialize questions on mount
  useEffect(() => {
    if (!mode) return;
    const generated = Array.from({ length: numQuestions }, () => mode.generate());
    setQuestions(generated);
    quizStartTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, [mode, numQuestions]);

  // Preparation Countdown Effect
  useEffect(() => {
    if (prepCountdown === null) return;
    
    const timer = setTimeout(() => {
      if (prepCountdown > 1) {
        setPrepCountdown(prepCountdown - 1);
      } else {
        setPrepCountdown(null);
        // Reset timestamps to start quiz timing fresh
        quizStartTimeRef.current = Date.now();
        questionStartTimeRef.current = Date.now();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [prepCountdown]);

  // Focus input field
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [currentIdx, feedbackState]);

  // High-precision non-drift timer loop via requestAnimationFrame
  useEffect(() => {
    if (questions.length === 0 || currentIdx >= questions.length || feedbackState !== "none" || prepCountdown !== null) {
      return;
    }

    questionStartTimeRef.current = Date.now();
    const timeLimitMs = timePerQuestion * 1000;
    let animationFrameId: number;

    const tick = () => {
      const elapsed = Date.now() - questionStartTimeRef.current;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      const percentage = (remaining / timeLimitMs) * 100;

      setTimerProgress(percentage);
      setSecondsLeft(Math.ceil(remaining / 1000));

      if (elapsed >= timeLimitMs) {
        handleTimeout();
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [questions, currentIdx, feedbackState, timePerQuestion, prepCountdown]);

  if (!mode) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-xl font-bold text-app-error mb-2">Mode Not Found</h2>
        <p className="text-sm text-app-secondary mb-6">The requested training mode does not exist.</p>
        <Link to="/"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  if (prepCountdown !== null) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text flex flex-col items-center justify-center p-4 select-none">
        <Card className="max-w-md w-full border-2 border-app-outline-variant bg-app-surface text-center py-16 px-8 shadow-lg">
          <span className="text-[10px] uppercase font-bold tracking-widest text-app-secondary">Get Ready</span>
          <div className="text-8xl font-extrabold text-app-primary my-8 tabular-nums select-none animate-pulse">
            {prepCountdown}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-app-secondary">
            Drill session starts in {prepCountdown} second{prepCountdown > 1 ? 's' : ''}...
          </p>
        </Card>
      </div>
    );
  }

  // Answer matching and sanitization
  const isAnswerCorrect = (userAns: string, correctAns: string | number): boolean => {
    const u = userAns.trim().toLowerCase();
    const c = String(correctAns).trim().toLowerCase();

    // Support flexible responses for divisibility Yes/No questions
    if (c === "yes" || c === "no") {
      const yesValues = ["yes", "y", "1", "true"];
      const noValues = ["no", "n", "0", "false"];
      if (c === "yes") return yesValues.includes(u);
      if (c === "no") return noValues.includes(u);
    }

    return u === c;
  };

  // Move to next question or complete quiz
  const advanceQuiz = (newResults: QuestionResult[], newCorrectCount: number) => {
    setUserAnswer("");
    setFeedbackState("none");

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed - calculate total elapsed time
      const totalTimeSeconds = Math.round((Date.now() - quizStartTimeRef.current) / 1000);
      
      // Navigate to Results page
      navigate(`/mode/${mode.id}/results`, {
        state: {
          results: newResults,
          correctCount: newCorrectCount,
          totalCount: numQuestions,
          timePerQuestion,
          totalTimeSeconds
        }
      });
    }
  };

  // Submit current answer
  const handleSubmitAnswer = (answerToSubmit: string) => {
    if (feedbackState !== "none" || currentIdx >= questions.length) return;

    const timeTakenMs = Date.now() - questionStartTimeRef.current;
    const currentQuestion = questions[currentIdx];
    const correct = isAnswerCorrect(answerToSubmit, currentQuestion.answer);

    const resultRecord: QuestionResult = {
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: answerToSubmit,
      isCorrect: correct,
      timeTakenMs,
      isTimeout: false
    };

    const updatedResults = [...results, resultRecord];
    const updatedCorrectCount = correct ? correctCount + 1 : correctCount;

    if (correct) {
      setCorrectCount(updatedCorrectCount);
      setResults(updatedResults);
      setFeedbackState("correct");
      // Rapid 150ms auto-advance for fluid workflow
      setTimeout(() => {
        advanceQuiz(updatedResults, updatedCorrectCount);
      }, 150);
    } else {
      setResults(updatedResults);
      setFeedbackState("incorrect");
      // Rapid 200ms shake/red flash before advance
      setTimeout(() => {
        advanceQuiz(updatedResults, updatedCorrectCount);
      }, 250);
    }
  };

  // Handle timeout (expired question)
  const handleTimeout = () => {
    if (feedbackState !== "none" || currentIdx >= questions.length) return;

    const timeTakenMs = timePerQuestion * 1000;
    const currentQuestion = questions[currentIdx];

    const resultRecord: QuestionResult = {
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: "[TIMED OUT]",
      isCorrect: false,
      timeTakenMs,
      isTimeout: true
    };

    const updatedResults = [...results, resultRecord];
    setTimeoutAnswer(String(currentQuestion.answer));
    setResults(updatedResults);
    setFeedbackState("timeout");

    // 1-second timeout showcase before advance
    setTimeout(() => {
      advanceQuiz(updatedResults, correctCount);
    }, 1200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAnswer(userAnswer);
  };

  // Current active question
  const activeQuestion = questions[currentIdx];

  // Overall session percentage (for progress tracker at top)
  const sessionProgress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col h-screen overflow-hidden select-none">
      {/* Precision Countdown Timer Line */}
      <div className="fixed top-0 left-0 w-full z-50">
        <TimerBar progress={timerProgress} />
      </div>

      {/* Progress header */}
      <div className="w-full border-b border-app-outline-variant/30 bg-app-surface px-4 py-4 md:px-8 flex justify-between items-center select-none shrink-0 mt-1">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="p-1 border border-app-outline-variant hover:border-app-error hover:text-app-error rounded-app transition-colors text-app-secondary"
            title="Abandon Drill Session"
          >
            <X size={16} />
          </Link>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-app-secondary">Session Progress</span>
            <span className="text-sm font-extrabold text-app-primary tabular-nums mt-0.5">
              Question {currentIdx + 1} of {numQuestions}
            </span>
          </div>
        </div>

        {/* Global indicator bar (overall items complete) */}
        <div className="w-24 md:w-48 bg-app-outline-variant/20 h-2 rounded-full hidden sm:block overflow-hidden mx-4">
          <div className="bg-app-primary h-full transition-all duration-150" style={{ width: `${sessionProgress}%` }} />
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-bold tracking-widest text-app-secondary">Current Score</span>
          <span className="text-sm font-extrabold text-app-accent tabular-nums mt-0.5">
            {correctCount} / {numQuestions}
          </span>
        </div>
      </div>

      {/* Main interactive area */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        {activeQuestion ? (
          <div className="max-w-xl w-full flex flex-col items-center">
            {/* Countdown floating visual */}
            <div className="mb-4 text-center">
              <span className={`text-4xl font-extrabold tabular-nums select-none ${
                secondsLeft <= 3 ? "text-app-error animate-pulse" : "text-app-primary"
              }`}>
                {secondsLeft}s
              </span>
            </div>

            <Card 
              className={`w-full border-2 transition-all duration-150 text-center ${
                feedbackState === "correct" 
                  ? "border-app-success shadow-lg shadow-app-success/10 bg-app-success/5" 
                  : feedbackState === "incorrect" 
                    ? "border-app-error shadow-lg shadow-app-error/10 bg-app-error/5 animate-shake" 
                    : feedbackState === "timeout"
                      ? "border-app-accent/40 bg-app-accent/5"
                      : "border-app-outline-variant bg-app-surface"
              }`}
            >
              {/* Math problem text */}
              <div className="py-4 md:py-8">
                <div className="text-5xl md:text-7xl font-extrabold text-app-primary tracking-tight select-none tabular-nums">
                  {activeQuestion.question}
                </div>
              </div>

              {/* Timeout Correct Answer Flash */}
              {feedbackState === "timeout" ? (
                <div className="mt-4 p-4 bg-app-error/15 border border-app-error/25 text-app-error rounded-app max-w-sm mx-auto animate-pulse">
                  <div className="text-[10px] uppercase font-bold tracking-wider">Time's Up</div>
                  <div className="text-lg font-extrabold mt-0.5">Correct Answer: <span className="underline">{timeoutAnswer}</span></div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="mt-6 max-w-xs mx-auto">
                  <input
                    ref={inputRef}
                    type={mode.inputType === "numeric" ? "number" : "text"}
                    inputMode={mode.inputType === "numeric" ? "numeric" : "text"}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={feedbackState !== "none"}
                    autoFocus
                    placeholder="Enter Answer"
                    className="w-full text-center text-3xl font-extrabold tracking-wide py-3 bg-app-bg border-2 border-app-outline-variant rounded-app text-app-text focus:outline-none focus:border-app-primary transition-all tabular-nums block-cursor"
                  />
                  
                  <p className="text-[9px] uppercase font-bold tracking-widest text-app-secondary mt-3">
                    Press Enter / Go to submit
                  </p>

                  {/* Add helpful buttons for Divisibility Yes/No question, to help mobile speed! */}
                  {mode.id === "divisibility" && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleSubmitAnswer("Yes")}
                        disabled={feedbackState !== "none"}
                        className="py-3 font-bold border-2 border-app-outline hover:bg-app-success/15 hover:border-app-success"
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleSubmitAnswer("No")}
                        disabled={feedbackState !== "none"}
                        className="py-3 font-bold border-2 border-app-outline hover:bg-app-error/15 hover:border-app-error"
                      >
                        No
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-app-primary" />
            <p className="text-sm text-app-secondary mt-2">Loading drills...</p>
          </div>
        )}
      </main>
    </div>
  );
};

// React component helper for loader icon
const Loader2: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }> = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Quiz;
