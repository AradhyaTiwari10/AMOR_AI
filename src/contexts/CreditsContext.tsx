
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

interface CreditsContextType {
  credits: number;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  loading: boolean;
}

const CreditsContext = createContext<CreditsContextType | null>(null);

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load credits from localStorage when user logs in
    if (isSignedIn && user) {
      const storedCredits = localStorage.getItem(`userCredits_${user.id}`);
      if (storedCredits) {
        setCredits(parseInt(storedCredits));
      } else {
        // New user starts with 0 credits
        setCredits(0);
        localStorage.setItem(`userCredits_${user.id}`, "0");
      }
      setLoading(false);
    }
  }, [isSignedIn, user]);

  const addCredits = (amount: number) => {
    if (!isSignedIn || !user) return;
    
    const newTotal = credits + amount;
    setCredits(newTotal);
    localStorage.setItem(`userCredits_${user.id}`, newTotal.toString());
  };

  const deductCredits = (amount: number): boolean => {
    if (!isSignedIn || !user) return false;
    
    if (credits >= amount) {
      const newTotal = credits - amount;
      setCredits(newTotal);
      localStorage.setItem(`userCredits_${user.id}`, newTotal.toString());
      return true;
    }
    return false;
  };

  return (
    <CreditsContext.Provider value={{ credits, setCredits, addCredits, deductCredits, loading }}>
      {children}
    </CreditsContext.Provider>
  );
};
