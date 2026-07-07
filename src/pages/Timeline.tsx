import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getModeById } from "../questionGenerators";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { 
  Flame, 
  Calendar, 
  BarChart2, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";

interface HistoryEntry {
  id: string;
  modeId: string;
  numQuestions: number;
  timePerQuestion: number;
  correctCount: number;
  accuracy: number;
  totalTimeSeconds: number;
  completedAt: Timestamp;
}

export const Timeline: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Interaction States
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; count: number } | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const historyRef = collection(db, "history");
      
      let querySnapshot;
      try {
        const q = query(
          historyRef,
          where("uid", "==", user.uid),
          orderBy("completedAt", "desc"),
          limit(500) // Retrieve up to 500 drills for analytics
        );
        querySnapshot = await getDocs(q);
      } catch (indexErr: any) {
        console.warn("Index not ready for history, using client-side fallback sorting", indexErr);
        // Fallback query (uses index merging or single-field, requiring no custom composite index)
        const fallbackQ = query(
          historyRef,
          where("uid", "==", user.uid),
          limit(500)
        );
        querySnapshot = await getDocs(fallbackQ);
      }

      const tempHistory: HistoryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tempHistory.push({
          id: doc.id,
          modeId: data.modeId,
          numQuestions: data.numQuestions,
          timePerQuestion: data.timePerQuestion,
          correctCount: data.correctCount,
          accuracy: data.accuracy,
          totalTimeSeconds: data.totalTimeSeconds,
          completedAt: data.completedAt
        });
      });

      // Sort chronological logs client-side in case fallback query was used
      const sortedHistory = tempHistory.sort((a, b) => {
        const timeA = a.completedAt?.toMillis() || 0;
        const timeB = b.completedAt?.toMillis() || 0;
        return timeB - timeA; // Descending
      });

      setHistory(sortedHistory);
    } catch (err: any) {
      console.error("Error loading user practice history", err);
      setError("Could not load your activity history logs. Try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // --- STATS & STREAKS COMPUTATIONS ---
  
  // Date counts mapping
  const dateCounts: { [dateStr: string]: number } = {};
  history.forEach((item) => {
    if (!item.completedAt) return;
    const d = item.completedAt.toDate();
    const dateStr = d.toISOString().split("T")[0];
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  // Streaks calculation
  const calculateStreaks = () => {
    const activeDates = Object.keys(dateCounts).sort((a, b) => b.localeCompare(a)); // Descending dates
    if (activeDates.length === 0) return { current: 0, longest: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check if user was active today or yesterday to continue current streak
    const checkDate = new Date();
    const checkDateStr = checkDate.toISOString().split("T")[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split("T")[0];

    const hasActiveTodayOrYesterday = dateCounts[checkDateStr] || dateCounts[yesterdayStr];

    if (hasActiveTodayOrYesterday) {
      const runner = new Date();
      while (true) {
        const rStr = runner.toISOString().split("T")[0];
        if (dateCounts[rStr]) {
          currentStreak++;
          runner.setDate(runner.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest Streak across all history
    const allDaysSortedAsc = Object.keys(dateCounts).sort((a, b) => a.localeCompare(b));
    if (allDaysSortedAsc.length > 0) {
      let prevTime: Date | null = null;
      allDaysSortedAsc.forEach((dStr) => {
        const currTime = new Date(dStr);
        if (prevTime === null) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round((currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        prevTime = currTime;
      });
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreaks();

  // --- GRID MAP GENERATOR ---
  const generateContributionGrid = () => {
    const today = new Date();
    
    // Get account creation date
    const createdDate = userProfile?.createdAt
      ? new Date(userProfile.createdAt.seconds * 1000)
      : new Date();
      
    // Set start date to the beginning of the creation week (Sunday)
    const startDate = new Date(createdDate);
    startDate.setHours(0, 0, 0, 0);
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    // Calculate number of weeks between startDate and today
    // Align today to the end of the current week (Saturday)
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    const endDay = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDay));

    const diffTime = Math.max(0, endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let numWeeks = Math.ceil(diffDays / 7);

    // Always show at least 4 weeks so the grid doesn't look empty/squished
    if (numWeeks < 4) {
      numWeeks = 4;
      // Adjust start date backwards to show at least 4 weeks
      startDate.setDate(endDate.getDate() - (numWeeks * 7 - 1));
      const newStartDay = startDate.getDay();
      startDate.setDate(startDate.getDate() - newStartDay);
    }

    const cols: { date: Date; dateStr: string; count: number }[][] = [];
    const runner = new Date(startDate);

    for (let c = 0; c < numWeeks; c++) {
      const week: { date: Date; dateStr: string; count: number }[] = [];
      for (let r = 0; r < 7; r++) {
        const dStr = runner.toISOString().split("T")[0];
        week.push({
          date: new Date(runner),
          dateStr: dStr,
          count: dateCounts[dStr] || 0
        });
        runner.setDate(runner.getDate() + 1);
      }
      cols.push(week);
    }
    return cols;
  };

  const gridData = generateContributionGrid();

  // Get grid cell color mapping
  const getCellClass = (count: number) => {
    if (count === 0) return "bg-slate-200 dark:bg-slate-800/40 hover:bg-slate-300 dark:hover:bg-slate-700/60";
    if (count <= 2) return "bg-emerald-200 dark:bg-emerald-950/40 border border-emerald-300/30 hover:bg-emerald-300/50";
    if (count <= 5) return "bg-emerald-300 dark:bg-emerald-800 border border-emerald-400/30 hover:bg-emerald-400/50";
    if (count <= 9) return "bg-emerald-400 dark:bg-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/50";
    return "bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-300";
  };

  // Filter history entries by selected date
  const filteredHistory = selectedDateStr 
    ? history.filter((item) => item.completedAt.toDate().toISOString().split("T")[0] === selectedDateStr)
    : history;

  // Format dates for headings
  const formatDateHeading = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- SVG GRAPHS CALCULATIONS ---
  // Line chart calculation helper (oldest to newest)
  const recentDrills = [...history].reverse().slice(-15); // Last 15 sessions chronologically

  // Accuracy Plot coordinates
  const renderAccuracyLineChart = () => {
    if (recentDrills.length < 2) return <p className="text-xs text-app-secondary font-semibold italic text-center py-10">Complete at least 2 sessions to display trends</p>;

    const svgWidth = 400;
    const svgHeight = 150;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Build coordinates
    const points = recentDrills.map((drill, index) => {
      const x = paddingLeft + (index / (recentDrills.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (drill.accuracy / 100) * chartHeight;
      return { x, y, val: drill.accuracy };
    });

    const dPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const dArea = `${dPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-app-text">
        <defs>
          <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 50, 100].map((labelY) => {
          const y = paddingTop + chartHeight - (labelY / 100) * chartHeight;
          return (
            <g key={labelY} className="opacity-15">
              <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[9px] font-mono fill-current font-bold">{labelY}%</text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <path d={dArea} fill="url(#accuracyGrad)" />
        
        {/* Line */}
        <path d={dPath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Dots */}
        {points.map((p, idx) => (
          <circle 
            key={idx} 
            cx={p.x} 
            cy={p.y} 
            r="3.5" 
            className="fill-app-surface stroke-app-primary hover:r-5 transition-all cursor-pointer" 
            strokeWidth="2" 
          >
            <title>Session {recentDrills.length - 15 + idx + 1}: {p.val}% Accuracy</title>
          </circle>
        ))}

        {/* X Axis label */}
        <text x={paddingLeft + chartWidth / 2} y={svgHeight - 4} textAnchor="middle" className="text-[9px] font-bold uppercase tracking-wider fill-app-secondary">Last 15 Sessions</text>
      </svg>
    );
  };

  // Speed Plot coordinates (Seconds per question)
  const renderSpeedLineChart = () => {
    if (recentDrills.length < 2) return <p className="text-xs text-app-secondary font-semibold italic text-center py-10">Complete at least 2 sessions to display trends</p>;

    const svgWidth = 400;
    const svgHeight = 150;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Calculate response speed (Seconds / Question)
    const speeds = recentDrills.map(d => d.numQuestions > 0 ? d.totalTimeSeconds / d.numQuestions : 0);
    const maxSpeedVal = Math.max(...speeds, 5); // Minimum y-range height is 5 seconds
    const minSpeedVal = 0;

    const points = recentDrills.map((drill, index) => {
      const speed = drill.numQuestions > 0 ? drill.totalTimeSeconds / drill.numQuestions : 0;
      const x = paddingLeft + (index / (recentDrills.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((speed - minSpeedVal) / (maxSpeedVal - minSpeedVal)) * chartHeight;
      return { x, y, val: speed };
    });

    const dPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const dArea = `${dPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-app-text">
        <defs>
          <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, Math.round(maxSpeedVal / 2), Math.round(maxSpeedVal)].map((labelY) => {
          const y = paddingTop + chartHeight - ((labelY - minSpeedVal) / (maxSpeedVal - minSpeedVal)) * chartHeight;
          return (
            <g key={labelY} className="opacity-15">
              <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[9px] font-mono fill-current font-bold">{labelY}s</text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <path d={dArea} fill="url(#speedGrad)" />

        {/* Line */}
        <path d={dPath} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, idx) => (
          <circle 
            key={idx} 
            cx={p.x} 
            cy={p.y} 
            r="3.5" 
            className="fill-app-surface stroke-app-accent hover:r-5 transition-all cursor-pointer" 
            strokeWidth="2" 
          >
            <title>Session {recentDrills.length - 15 + idx + 1}: {p.val.toFixed(2)}s/Q</title>
          </circle>
        ))}

        {/* X Axis label */}
        <text x={paddingLeft + chartWidth / 2} y={svgHeight - 4} textAnchor="middle" className="text-[9px] font-bold uppercase tracking-wider fill-app-secondary">Last 15 Sessions</text>
      </svg>
    );
  };

  // Category counts distribution
  const getCategoryCounts = () => {
    const categoryMapping: { [key: string]: number } = {
      Arithmetic: 0,
      Alphabet: 0,
      Division: 0,
      Powers: 0,
      Divisibility: 0
    };

    history.forEach((drill) => {
      const modeData = getModeById(drill.modeId);
      if (modeData && categoryMapping[modeData.category] !== undefined) {
        categoryMapping[modeData.category]++;
      }
    });

    return Object.keys(categoryMapping).map((name) => ({
      name,
      count: categoryMapping[name]
    }));
  };

  const categoryDistribution = getCategoryCounts();
  const maxCategoryCount = Math.max(...categoryDistribution.map((c) => c.count), 1);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
        <Loader2 size={40} className="animate-spin text-app-primary" />
        <p className="text-xs uppercase tracking-widest text-app-secondary font-bold mt-4">
          Retrieving activity logs...
        </p>
      </div>
    );
  }

  // Calculate some year stats
  const totalAttemptsCount = history.length;
  const averageAccuracyOverall = totalAttemptsCount > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalAttemptsCount) 
    : 0;

  const joinMonthYear = userProfile?.createdAt
    ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
      })
    : "";

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 select-none">
      
      {/* Title Header */}
      <div className="border-b border-app-outline-variant/30 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold text-app-primary tracking-tight flex items-center gap-2">
          <Calendar className="text-app-accent" size={24} />
          <span>Practice Timeline</span>
        </h1>
        <p className="text-xs text-app-secondary mt-1 uppercase font-bold tracking-wider">
          Analytical heatmap and historical session drills overview
        </p>
      </div>

      {error && (
        <Card className="text-center p-8 mb-6 border-app-error/20 bg-app-error/5 text-app-error">
          <p className="text-sm font-semibold mb-3">{error}</p>
          <Button onClick={fetchHistory} className="px-4 py-2 text-xs"><RefreshCw size={14} className="mr-1" /> Retry</Button>
        </Card>
      )}

      {/* Grid of Streaks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-app-accent/10 text-app-accent rounded-app">
            <Flame size={24} className="fill-app-accent animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold tracking-tight tabular-nums text-app-accent">{currentStreak}</div>
            <div className="text-[10px] uppercase font-bold text-app-secondary">Current Streak</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-app-primary/10 text-app-primary rounded-app">
            <Flame size={24} className="text-app-primary" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold tracking-tight tabular-nums text-app-primary">{longestStreak}</div>
            <div className="text-[10px] uppercase font-bold text-app-secondary">Longest Streak</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-app-success/10 text-app-success rounded-app">
            <CheckCircle size={24} className="text-app-success" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold tracking-tight tabular-nums text-app-success">{averageAccuracyOverall}%</div>
            <div className="text-[10px] uppercase font-bold text-app-secondary">Avg Accuracy</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-app-secondary/15 text-app-secondary rounded-app">
            <Clock size={24} className="text-app-secondary" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold tracking-tight tabular-nums text-app-primary">{totalAttemptsCount}</div>
            <div className="text-[10px] uppercase font-bold text-app-secondary">Total Drills</div>
          </div>
        </Card>
      </div>

      {/* GitHub-Style Contribution Heatmap Card */}
      <Card className="p-6 mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-app-primary uppercase tracking-wider">
              {totalAttemptsCount} sessions {joinMonthYear ? `since ${joinMonthYear}` : "since joining"}
            </h3>
            <p className="text-xs text-app-secondary mt-0.5 font-semibold">
              Click on any square to filter attempts for that date.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-app-secondary uppercase tracking-wider">
            <span>Less</span>
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-800/40 rounded-[2px]" />
            <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-950/40 rounded-[2px]" />
            <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-800 rounded-[2px]" />
            <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-[2px]" />
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-[2px]" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex gap-[3px] min-w-[720px] select-none p-1">
            {gridData.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3px]">
                {week.map((day, rowIdx) => {
                  const isActive = selectedDateStr === day.dateStr;
                  return (
                    <div
                      key={rowIdx}
                      onClick={() => setSelectedDateStr(selectedDateStr === day.dateStr ? null : day.dateStr)}
                      onMouseEnter={() => setHoveredCell({ dateStr: day.dateStr, count: day.count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer ${getCellClass(day.count)} ${
                        isActive ? "ring-2 ring-app-accent scale-125 z-10" : ""
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Cell Hover Tooltip Banner */}
        <div className="h-6 mt-4 flex items-center justify-between text-[11px] font-bold text-app-secondary uppercase tracking-wider">
          <div>
            {hoveredCell ? (
              <span className="text-app-primary">
                {hoveredCell.count} session{hoveredCell.count !== 1 ? "s" : ""} on {new Date(hoveredCell.dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : selectedDateStr ? (
              <span className="text-app-accent">
                Viewing drills for: {new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              <span>Hover over a box for daily drill counts</span>
            )}
          </div>
          {selectedDateStr && (
            <button 
              onClick={() => setSelectedDateStr(null)}
              className="text-app-accent hover:underline cursor-pointer normal-case font-bold"
            >
              Clear Filter
            </button>
          )}
        </div>
      </Card>

      {/* Analytics Graphs section */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Accuracy Trend */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-app-primary uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <TrendingUp size={14} className="text-app-primary" />
                <span>Accuracy Trend</span>
              </h4>
              <div className="w-full">
                {renderAccuracyLineChart()}
              </div>
            </div>
            <div className="text-[10px] text-app-secondary text-center mt-3 font-semibold">
              Timeline of accuracy percentage over your recent drills
            </div>
          </Card>

          {/* Speed Trend */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-app-primary uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Clock size={14} className="text-app-accent" />
                <span>Response Speed (s/Q)</span>
              </h4>
              <div className="w-full">
                {renderSpeedLineChart()}
              </div>
            </div>
            <div className="text-[10px] text-app-secondary text-center mt-3 font-semibold">
              Average seconds spent per question (lower is faster)
            </div>
          </Card>

          {/* Practice Distribution */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-app-primary uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <BarChart2 size={14} className="text-app-success" />
                <span>Drill Category Distribution</span>
              </h4>
              <div className="space-y-3.5 mt-2">
                {categoryDistribution.map((cat) => {
                  const percentage = Math.round((cat.count / maxCategoryCount) * 100);
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-app-secondary">
                        <span className="text-app-primary">{cat.name}</span>
                        <span className="font-mono">{cat.count} drills</span>
                      </div>
                      <div className="h-2 bg-app-outline-variant/35 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-app-primary rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] text-app-secondary text-center mt-3 font-semibold">
              Practice balance across mathematical and lexical categories
            </div>
          </Card>

        </div>
      )}

      {/* Activity Timeline List */}
      <div>
        <h3 className="text-sm font-extrabold text-app-primary uppercase tracking-wider mb-4">
          {selectedDateStr ? `Drills on ${formatDateHeading(selectedDateStr)}` : "Recent Activity Log"}
        </h3>

        {filteredHistory.length === 0 ? (
          <Card className="p-8 text-center text-app-secondary py-16">
            <BarChart2 size={40} className="mx-auto text-app-outline-variant mb-3 opacity-60" />
            <p className="text-sm font-bold uppercase tracking-wider text-app-secondary">No drills found</p>
            <p className="text-xs text-app-secondary/80 mt-1 max-w-sm mx-auto">
              {selectedDateStr 
                ? "You did not complete any calculation drills on this date."
                : "Your practice logs are empty. Head to the Dashboard to launch your first speed drill!"}
            </p>
            {!selectedDateStr && (
              <Link to="/" className="inline-block mt-5">
                <Button className="flex items-center gap-1 px-4 py-2 text-xs">
                  <Play size={12} className="fill-current" />
                  <span>Start Drill</span>
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="relative border-l border-app-outline-variant/50 ml-3 pl-6 space-y-4">
            {filteredHistory.map((drill) => {
              const modeData = getModeById(drill.modeId);
              const drillDate = drill.completedAt.toDate();
              const timeString = drillDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const dateString = drillDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              
              if (!modeData) return null;

              return (
                <div key={drill.id} className="relative group">
                  {/* Timeline point indicator */}
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-app-bg border-[2.5px] border-app-primary rounded-full group-hover:scale-125 transition-transform" />

                  <Card className="p-4 border-app-outline-variant/30 hover:border-app-primary/40 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-app-primary uppercase tracking-wide">
                            {modeData.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-app-surface-container text-app-secondary px-1.5 py-0.5 rounded-app border border-app-outline-variant/30">
                            {modeData.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-app-secondary mt-1 font-bold uppercase tracking-wide">
                          Completed at {timeString} — {dateString}
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex flex-wrap gap-4 text-xs font-mono">
                        {/* Score */}
                        <div className="flex items-center gap-1 text-app-secondary">
                          <Award size={14} className="text-app-accent" />
                          <span className="font-bold text-app-primary tabular-nums">
                            {drill.correctCount}/{drill.numQuestions}
                          </span>
                        </div>

                        {/* Accuracy */}
                        <div className="flex items-center gap-1 text-app-secondary">
                          <CheckCircle size={14} className="text-app-success" />
                          <span className={`font-bold tabular-nums ${
                            drill.accuracy >= 90 ? "text-app-success" : "text-app-primary"
                          }`}>
                            {drill.accuracy}%
                          </span>
                        </div>

                        {/* Speed */}
                        <div className="flex items-center gap-1 text-app-secondary">
                          <Clock size={14} className="text-app-secondary" />
                          <span className="font-bold text-app-primary tabular-nums">
                            {drill.totalTimeSeconds}s
                          </span>
                          <span className="text-[10px] text-app-secondary/70">
                            ({(drill.totalTimeSeconds / drill.numQuestions).toFixed(2)}s/q)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
