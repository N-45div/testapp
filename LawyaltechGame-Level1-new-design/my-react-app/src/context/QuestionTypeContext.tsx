// QuestionTypeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

interface QuestionTypeContextProps {
  selectedTypes: (string | null)[];
  setSelectedTypes: (types: (string | null)[]) => void;
  editedQuestions: string[];
  setEditedQuestions: (questions: string[]) => void;
}

interface QuestionTypeProviderProps {
  children: ReactNode;
}

const QuestionTypeContext = createContext<QuestionTypeContextProps | undefined>(undefined);

export const QuestionTypeProvider: React.FC<QuestionTypeProviderProps> = ({ children }) => {
  const [selectedTypes, setSelectedTypes] = useState<(string | null)[]>([]);
  const [editedQuestions, setEditedQuestions] = useState<string[]>([]);

  return (
    <QuestionTypeContext.Provider value={{ selectedTypes, setSelectedTypes, editedQuestions, setEditedQuestions }}>
      {children}
    </QuestionTypeContext.Provider>
  );
};

export const useQuestionType = () => {
  const context = useContext(QuestionTypeContext);
  if (!context) {
    throw new Error("useQuestionType must be used within a QuestionTypeProvider");
  }
  return context;
};