import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router";
import Confetti from "react-confetti";
import parse from "html-react-parser"; // Import html-react-parser for rendering HTML

import { documentText } from "../utils/EmploymentAgreement";
import { textTypes, numberTypes, radioTypes, findPlaceholderByValue } from "../utils/questionTypeUtils";

// Define the type for userAnswers
interface UserAnswers {
  [key: string]: string | boolean;
}

// Custom function to process HTML and replace placeholders with answers
const processAgreement = (html: string, answers: UserAnswers) => {
  let updatedHtml = html;

  // Replace placeholders with answers
  Object.entries(answers).forEach(([question, answer]) => {
    const placeholder =
      Object.keys(textTypes).find((key) => textTypes[key] === question) ||
      Object.keys(numberTypes).find((key) => numberTypes[key] === question) ||
      Object.keys(radioTypes).find((key) => radioTypes[key] === question) ||
      "";

    if (placeholder) {
      const probationQuestion = "Is the clause of probationary period applicable?";
      const terminationQuestion = "Is the termination clause applicable?";
      const sickPayQuestion = "Is the sick pay policy applicable?";
      const prevEmploymentQuestion = "Is the previous service applicable?";
      const overtimeNoQuestion = "Should the employee not receive overtime payment?";
      const overtimeYesQuestion = "Does the employee receive overtime payment?";

      if (question === probationQuestion && answer === false) {
        const probationClauseStart = updatedHtml.indexOf('<h2 className="text-2xl font-bold mt-6">PROBATIONARY PERIOD</h2>');
        const probationClauseEnd = updatedHtml.indexOf('<h2 className="text-2xl font-bold mt-6">JOB TITLE AND DUTIES</h2>');
        if (probationClauseStart !== -1 && probationClauseEnd !== -1) {
          updatedHtml = updatedHtml.slice(0, probationClauseStart) + updatedHtml.slice(probationClauseEnd);
        }
      } else if (question === terminationQuestion && answer === false) {
        const terminationClauseStart = updatedHtml.indexOf('<h2 className="text-2xl font-bold mt-6">TERMINATION</h2>');
        const terminationClauseEnd = updatedHtml.indexOf('<h2 className="text-2xl font-bold mt-6">CONFIDENTIALITY</h2>');
        if (terminationClauseStart !== -1 && terminationClauseEnd !== -1) {
          updatedHtml = updatedHtml.slice(0, terminationClauseStart) + updatedHtml.slice(terminationClauseEnd);
        }
      } else if (question === sickPayQuestion && answer === false) {
        const sickPaySectionStart = updatedHtml.indexOf('<h2 className="text-2xl font-bold mt-6">SICKNESS ABSENCE</h2>');
        if (sickPaySectionStart !== -1) {
          updatedHtml = updatedHtml.replace(/\[.*?\]/g, ""); // Remove text inside square brackets
        }
      } else if ((question === prevEmploymentQuestion || 
                  question === overtimeNoQuestion || 
                  question === overtimeYesQuestion) && answer === false) {
        const placeholder = findPlaceholderByValue(question);
        if (!placeholder) return;
        const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
        updatedHtml = updatedHtml.replace(new RegExp(`.*${escapedPlaceholder}.*`, "gi"), "");
      } 
      else {
        const answerValue = typeof answer === "boolean" ? answer.toString() : answer;
        updatedHtml = updatedHtml.replace(
          new RegExp(`\\[${placeholder.replace(/\s+/g, " ").trim()}\\]`, "gi"),
          answerValue || `[${placeholder}]`
        );
      }
    }
  });

  return updatedHtml;
};

const Finish = () => {
  const [confetti, setConfetti] = useState(false);
  const navigation = useNavigate();
  const location = useLocation();
  const [finalAgreement, setFinalAgreement] = useState<React.ReactNode>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: document.body.scrollHeight || window.innerHeight,
  });

  useEffect(() => {
    // Function to update dimensions
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: Math.max(document.body.scrollHeight, window.innerHeight),
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener for resize
    window.addEventListener("resize", updateDimensions);

    // Set confetti to true and process agreement
    setConfetti(true);
    const answers: UserAnswers = location.state?.userAnswers || {};
    let updatedText = processAgreement(documentText, answers);
    setFinalAgreement(parse(updatedText)); // Use parse to safely render the HTML content

    // Update dimensions again after content loads
    setTimeout(updateDimensions, 100);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateDimensions);
  }, [location.state]);

  const handleBackClick = () => {
    // Navigate back to the previous page
    navigation(-1); // Go back in history
  };

  const handleHomeClick = () => {
    navigation("/"); // Navigate to home page
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col bg-gradient-to-r from-green-100 via-purple-100 to-blue-100 relative">
      {confetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={150}
          gravity={0.15}
          initialVelocityY={3}
          tweenDuration={5000}
          run={true}
        />
      )}
      <Navbar />
      <div className="flex justify-center mt-16 mb-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-10 w-4/5">
          <h1 className="text-blue-700 text-4xl font-bold mb-10 tracking-wide text-center border-b-2 border-blue-200 pb-4">
            EMPLOYMENT AGREEMENT
          </h1>
          <div className="text-blue-700 leading-relaxed">{finalAgreement}</div>
        </div>
      </div>
      <div className="flex justify-center mb-8 space-x-6">
        <button
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:scale-105 transition-all duration-300 font-semibold shadow-md"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:scale-105 transition-all duration-300 font-semibold shadow-md"
          onClick={handleHomeClick}
        >
          Return to Home Page
        </button>
      </div>
    </div>
  );
};

export default Finish;
