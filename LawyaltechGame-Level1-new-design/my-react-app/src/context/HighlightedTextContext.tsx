import { createContext, useContext, useState, ReactNode } from "react";

interface HighlightedTextContextType {
  highlightedTexts: string[];
  addHighlightedText: (text: string) => void;
  highlightedPlaceholders: { [key: string]: boolean };
  addHighlightedPlaceholder: (placeholder: string) => void;
}

const HighlightedTextContext = createContext<HighlightedTextContextType | undefined>(undefined);

export const HighlightedTextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [highlightedPlaceholders, setHighlightedPlaceholders] = useState<{ [key: string]: boolean }>({});

  const addHighlightedText = (text: string) => {
    setHighlightedTexts((prev) => [...prev, text]);
  };

  const addHighlightedPlaceholder = (placeholder: string) => {
    setHighlightedPlaceholders((prev) => ({
      ...prev,
      [placeholder]: true,
    }));
  };

  return (
    <HighlightedTextContext.Provider value={{ highlightedTexts, addHighlightedText, highlightedPlaceholders, addHighlightedPlaceholder }}>
      {children}
    </HighlightedTextContext.Provider>
  );
};

export const useHighlightedText = () => {
  const context = useContext(HighlightedTextContext);
  if (!context) {
    throw new Error("useHighlightedText must be used within a HighlightedTextProvider");
  }
  return context;
};


