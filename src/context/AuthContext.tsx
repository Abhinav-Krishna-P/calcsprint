import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { 
  onAuthStateChanged, 
  signOut,
  signInWithPopup
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";

export interface UserStats {
  bestScore: number;
  bestAccuracy: number;
  bestTimeSeconds: number;
  totalAttempts: number;
}

export interface UserProfile {
  username: string;
  usernameLower: string;
  avatarId: string;
  badges: string[];
  createdAt: any;
  stats: {
    [modeId: string]: UserStats;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createProfile: (username: string, avatarId: string) => Promise<void>;
  checkUsernameUnique: (username: string) => Promise<boolean>;
  updateQuizStats: (
    modeId: string, 
    correctCount: number, 
    totalCount: number, 
    totalTimeSeconds: number
  ) => Promise<{ newBadges: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google sign in
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in error", error);
      setLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    } catch (error) {
      console.error("Logout error", error);
      setLoading(false);
      throw error;
    }
  };

  // Check username uniqueness (using case-insensitive lowercase query)
  const checkUsernameUnique = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return false;
    const usernameDocRef = doc(db, "usernames", cleanUsername);
    const usernameSnap = await getDoc(usernameDocRef);
    return !usernameSnap.exists();
  };

  // Onboarding profile creation
  const createProfile = async (username: string, avatarId: string) => {
    if (!user) throw new Error("No authenticated user found.");
    const cleanUsername = username.trim();
    const usernameLower = cleanUsername.toLowerCase();

    // Verification check
    const isUnique = await checkUsernameUnique(usernameLower);
    if (!isUnique) {
      throw new Error("Username is already taken.");
    }

    const batch = writeBatch(db);

    // 1. Create users/{uid} profile
    const profileRef = doc(db, "users", user.uid);
    const profileData: UserProfile = {
      username: cleanUsername,
      usernameLower,
      avatarId,
      badges: [],
      createdAt: serverTimestamp(),
      stats: {}
    };
    batch.set(profileRef, profileData);

    // 2. Lock username in usernames/{usernameLower}
    const usernameRef = doc(db, "usernames", usernameLower);
    batch.set(usernameRef, { uid: user.uid });

    await batch.commit();
    setUserProfile(profileData);
  };

  // Update statistics after completing a quiz and check for badges
  const updateQuizStats = async (
    modeId: string, 
    correctCount: number, 
    totalCount: number, 
    totalTimeSeconds: number
  ): Promise<{ newBadges: string[] }> => {
    if (!user || !userProfile) throw new Error("User must be logged in with a profile.");

    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const avgTimePerQuestion = totalCount > 0 ? totalTimeSeconds / totalCount : 999;

    const currentStats = userProfile.stats[modeId] || {
      bestScore: 0,
      bestAccuracy: 0,
      bestTimeSeconds: 999999,
      totalAttempts: 0
    };

    // Calculate new stats
    const updatedStats: UserStats = {
      bestScore: Math.max(currentStats.bestScore, correctCount),
      bestAccuracy: Math.max(currentStats.bestAccuracy, accuracy),
      bestTimeSeconds: accuracy === 100 
        ? Math.min(currentStats.bestTimeSeconds, totalTimeSeconds)
        : currentStats.bestTimeSeconds,
      totalAttempts: currentStats.totalAttempts + 1
    };

    // Sum attempts across all modes to calculate overall total quizzes
    let totalQuizzesFinished = 0;
    Object.keys(userProfile.stats).forEach((mId) => {
      totalQuizzesFinished += userProfile.stats[mId].totalAttempts;
    });
    // Add current attempt
    totalQuizzesFinished += 1;

    // Check badges
    const earnedBadges = [...userProfile.badges];
    const newBadgesAdded: string[] = [];

    const addBadgeIfEligible = (badgeId: string) => {
      if (!earnedBadges.includes(badgeId)) {
        earnedBadges.push(badgeId);
        newBadgesAdded.push(badgeId);
      }
    };

    // Rule: "First Quiz" — complete any 1 quiz
    addBadgeIfEligible("first_quiz");

    // Rule: "Speed Demon" — complete a quiz with avg answer time under 3 seconds
    if (avgTimePerQuestion < 3) {
      addBadgeIfEligible("speed_demon");
    }

    // Rule: "Perfectionist" — 100% accuracy on any quiz of 20+ questions
    if (accuracy === 100 && totalCount >= 20) {
      addBadgeIfEligible("perfectionist");
    }

    // Rule: "Century Club" — complete 100 total quizzes
    if (totalQuizzesFinished >= 100) {
      addBadgeIfEligible("century_club");
    }

    // Update in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const updatedProfile = {
      ...userProfile,
      badges: earnedBadges,
      stats: {
        ...userProfile.stats,
        [modeId]: updatedStats
      }
    };

    await updateDoc(userDocRef, {
      [`stats.${modeId}`]: updatedStats,
      badges: earnedBadges
    });

    setUserProfile(updatedProfile);

    return { newBadges: newBadgesAdded };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signInWithGoogle, 
      logout,
      createProfile,
      checkUsernameUnique,
      updateQuizStats
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
