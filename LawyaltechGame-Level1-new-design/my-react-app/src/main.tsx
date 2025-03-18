import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Changed to react-router-dom
import "./index.css";
import App from "./App.tsx";
import { QuestionTypeProvider } from "./context/QuestionTypeContext";
import { HighlightedTextProvider } from "./context/HighlightedTextContext"; // Import HighlightedTextProvider

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <HighlightedTextProvider>
        <QuestionTypeProvider>
          <App />
        </QuestionTypeProvider>
      </HighlightedTextProvider>
    </StrictMode>
  </BrowserRouter>
);
