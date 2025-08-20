import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Quiz {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  autoValidate?: boolean;
}

interface Card {
  id: number;
  text_description: string;
  quiz_id: number;
}

interface Category {
  id: number;
  name: string;
  quiz_id: number;
}

interface Submission {
  id: number;
  user_name: string;
  card_description: string;
  category_name: string;
  timestamp: string;
  status: string;
}

interface AppContextType {
  activeQuizzes: Quiz[];
  allQuizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentCards: Card[];
  currentCategories: Category[];
  currentCardIndex: number;
  userName: string;
  isAuthenticated: boolean;
  authType: 'validation' | 'admin' | null;
  pendingSubmissions: { [key: string]: Submission[] };
  loadActiveQuizzes: () => Promise<void>;
  loadAllQuizzes: () => Promise<void>;
  loadQuiz: (id: number) => Promise<void>;
  setUserName: (name: string) => void;
  submitAnswer: (cardId: number, categoryId: number) => Promise<void>;
  nextCard: () => void;
  resetQuiz: () => void;
  authenticate: (password: string, type: 'validation' | 'admin') => Promise<boolean>;
  logout: () => void;
  loadPendingSubmissions: () => Promise<void>;
  updateSubmissionStatus: (id: number, status: 'approved' | 'rejected') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentCards, setCurrentCards] = useState<Card[]>([]);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authType, setAuthType] = useState<'validation' | 'admin' | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<{ [key: string]: Submission[] }>({});

  // Debug: Log currentCardIndex whenever it changes
  useEffect(() => {
    console.log('currentCardIndex changed:', currentCardIndex);
  }, [currentCardIndex]);

  // Restore userName from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('quizUserName');
    if (savedName) setUserName(savedName);
  }, []);

  // Save userName to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quizUserName', userName);
  }, [userName]);

  // Save currentCardIndex per quiz to localStorage whenever it or the quiz changes
  // (Plus besoin de localStorage pour la progression)

  const API_BASE = '/api';

  const loadActiveQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE}/quiz/active`);
      const data = await response.json();
      // Ensure autoValidate is always boolean
      setActiveQuizzes(
        data.quizzes.map((q: any) => ({
          ...q,
          autoValidate: !!q.autoValidate
        }))
      );
    } catch (error) {
      console.error('Error loading active quizzes:', error);
    }
  };

  const loadAllQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE}/quiz/all`);
      const data = await response.json();
      // Ensure autoValidate is always boolean
      setAllQuizzes(
        data.quizzes.map((q: any) => ({
          ...q,
          autoValidate: !!q.autoValidate
        }))
      );
    } catch (error) {
      console.error('Error loading all quizzes:', error);
    }
  };

  const loadQuiz = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/quiz/${id}`);
      const data = await response.json();
      // Ensure autoValidate is always boolean
      setCurrentQuiz({ ...data.quiz, autoValidate: !!data.quiz.autoValidate });
      setCurrentCards(data.cards);
      setCurrentCategories(data.categories);
  // Get shared progress from server
  const progressRes = await fetch(`${API_BASE}/quiz/${id}/progress`);
  const progressData = await progressRes.json();
  setCurrentCardIndex(typeof progressData.currentIndex === 'number' ? progressData.currentIndex : 0);
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  }, []);

  const submitAnswer = async (cardId: number, categoryId: number) => {
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          card_id: cardId,
          category_id: categoryId,
        }),
      });
      // Si autovalidation est active, valider la soumission immédiatement
      if (currentQuiz?.autoValidate && res.ok) {
        const submission = await res.json();
        if (submission?.id) {
          await fetch(`${API_BASE}/submissions/${submission.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
          });
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const nextCard = async () => {
    if (!currentQuiz) return;
    const newIndex = currentCardIndex + 1;
    setCurrentCardIndex(newIndex);
    // Update shared progress on server
    try {
      await fetch(`/api/quiz/${currentQuiz.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentIndex: newIndex })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression partagée:', error);
    }
  };

  const resetQuiz = async () => {
    setCurrentCardIndex(0);
    setUserName('');
    // Reset shared progress on server
    if (currentQuiz) {
      try {
        await fetch(`/api/quiz/${currentQuiz.id}/progress`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentIndex: 0 })
        });
      } catch (error) {
        console.error('Erreur lors de la réinitialisation de la progression partagée:', error);
      }
    }
  };

  const authenticate = async (password: string, type: 'validation' | 'admin'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthType(type);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error authenticating:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthType(null);
  };

  const loadPendingSubmissions = async () => {
    try {
      const response = await fetch(`${API_BASE}/submissions/pending`);
      const data = await response.json();
      setPendingSubmissions(data.submissions);
    } catch (error) {
      console.error('Error loading pending submissions:', error);
    }
  };

  const updateSubmissionStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await fetch(`${API_BASE}/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      // Remove from pending submissions
      setPendingSubmissions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(category => {
          updated[category] = updated[category].filter(sub => sub.id !== id);
          if (updated[category].length === 0) {
            delete updated[category];
          }
        });
        return updated;
      });
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  useEffect(() => {
    loadActiveQuizzes();
  }, []);

  const value = {
    activeQuizzes,
    allQuizzes,
    currentQuiz,
    currentCards,
    currentCategories,
    currentCardIndex,
    userName,
    isAuthenticated,
    authType,
    pendingSubmissions,
    loadActiveQuizzes,
    loadAllQuizzes,
    loadQuiz,
    setUserName,
    submitAnswer,
    nextCard,
    resetQuiz,
    authenticate,
    logout,
    loadPendingSubmissions,
    updateSubmissionStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};