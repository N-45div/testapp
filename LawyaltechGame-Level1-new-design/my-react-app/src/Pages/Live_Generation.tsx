// Live_Generation.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { determineQuestionType, findPlaceholderByValue, textTypes, numberTypes, radioTypes } from "../utils/questionTypeUtils";
import { documentText } from "../utils/EmploymentAgreement";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";

const extractClauses = (documentText: string) => {
  const sections = documentText.split("<h2");
  const clauses: string[] = [];
  sections.forEach((section) => {
    if (section.includes("[")) {
      clauses.push(`<h2${section}`);
    }
  });
  console.log("Extracted clauses:", clauses); // Debug log
  return clauses;
};

const mapQuestionsToClauses = (
  clauses: string[],
  textTypes: { [key: string]: string },
  numberTypes: { [key: string]: string },
  radioTypes: { [key: string]: string }
) => {
  const questionClauseMap: { [key: string]: string[] } = {};
  const priorityMappings: { [key: string]: string } = {
    "What's the name of the employee?": "PARTIES",
    "What's the employee's address?": "PARTIES",
  };

  clauses.forEach((clause) => {
    Object.keys(textTypes).forEach((key) => {
      const placeholder = `[${key}]`;
      if (clause.replace(/\s+/g, " ").includes(placeholder)) {
        if (!textTypes[key]) {
          console.error(`Error: No question mapped for ${key}`);
        }
        if (!questionClauseMap[textTypes[key]]) questionClauseMap[textTypes[key]] = [];
        questionClauseMap[textTypes[key]].push(clause);
        console.log(`Mapped ${textTypes[key]} to clause with ${placeholder}`); // Debug log
      }
    });

    Object.keys(numberTypes).forEach((key) => {
      const placeholder = `[${key}]`;
      const question = numberTypes[key];
      if (question && clause.includes(placeholder)) {
        if (!questionClauseMap[numberTypes[key]]) questionClauseMap[numberTypes[key]] = [];
        questionClauseMap[numberTypes[key]].push(clause);
        console.log(`Mapped ${numberTypes[key]} to clause with ${placeholder}`); // Debug log
      }
    });

    const fullProbationClause = "The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.";
    const fullTerminatonClause = "After the probationary period, either party may terminate the employment by providing [Notice Period] written notice. The Company reserves the right to make a payment in lieu of notice. The Company may summarily dismiss the Employee without notice in cases of gross misconduct.";
    
    Object.keys(radioTypes).forEach((key) => {
      const placeholder = `[${key}]`;
      console.log(`Checking: key=${key}, placeholder=${placeholder}, mapped question=${textTypes[key]}`);
      console.log(`Scanning clause: "${clause}" for placeholder "${placeholder}"`);
      if (clause.includes(placeholder) || clause.includes(fullProbationClause) || clause.includes(fullTerminatonClause)) {
        if (!questionClauseMap[radioTypes[key]]) questionClauseMap[radioTypes[key]] = [];
        questionClauseMap[radioTypes[key]].push(clause);
        console.log(`Mapped ${radioTypes[key]} to clause with ${placeholder || fullProbationClause || fullTerminatonClause}`); // Debug log
      }
    });
    if (clause.includes(fullProbationClause)) {
      if (!questionClauseMap["What's the probation period length?"]) questionClauseMap["What's the probation period length?"] = [];
      questionClauseMap["What's the probation period length?"].push(clause);
      if (!questionClauseMap["What's the probation extension length?"]) questionClauseMap["What's the probation extension length?"] = [];
      questionClauseMap["What's the probation extension length?"].push(clause);
      
      console.log(`Mapped probation follow-ups to ${fullProbationClause}`); // Debug log
    }
    if (clause.includes(fullTerminatonClause)) {
      if (!questionClauseMap["What's the notice period?"]) questionClauseMap["What's the notice period?"] = [];
      questionClauseMap["What's the notice period?"].push(clause);
      
      console.log(`Mapped probation follow-ups to ${fullTerminatonClause}`); // Debug log
    }
  });

  Object.keys(priorityMappings).forEach((question) => {
    if (!questionClauseMap[question]) {
      questionClauseMap[question] = [];
      
      const partiesClause = clauses.find((clause) =>
        clause.includes('<h2 className="text-2xl font-bold">PARTIES</h2>')
      );
      if (partiesClause) {
        questionClauseMap[question].push(partiesClause);
        console.log(`Fallback mapped ${question} to PARTIES clause`); // Debug log
      }
    }
  });

  console.log("Final questionClauseMap:", questionClauseMap); // Debug log
  return questionClauseMap;
};

const Live_Generation = () => {
  const navigation = useNavigate();
  const { highlightedTexts } = useHighlightedText();
  const { selectedTypes, editedQuestions } = useQuestionType();
  const [, setQuestionClauseMap] = useState<{ [key: string]: string[] }>({});
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | boolean }>(initializeUserAnswers(highlightedTexts, selectedTypes));
  const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);
  const [, setHighlightedPlaceholder] = useState<{ [key: string]: boolean }>({}); // Track highlighted placeholders per question
  const [agreement, setAgreement] = useState<string>(documentText);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Reintroduced

  // Helper function to initialize userAnswers with default values
  function initializeUserAnswers(highlightedTexts: string[], selectedTypes: (string | null)[]): { [key: string]: string | boolean } {
    const initialAnswers: { [key: string]: string | boolean } = {};
    highlightedTexts.forEach((text, index) => {
      const { primaryValue } = determineQuestionType(text);
      const type = selectedTypes[index] || "Text";
      if (primaryValue) {
        initialAnswers[primaryValue] = type === "Radio" ? false : "";
      }
    });
    return initialAnswers;
  }

  const formatDateAnswer = (answer: string): string => {
    const cleanedAnswer = answer.trim().replace(/[^0-9A-Za-z\s/]/g, '');
    if (cleanedAnswer.includes('/')) {
      const dateParts = cleanedAnswer.split('/').map(part => part.trim());
      if (dateParts.length === 3 && dateParts.every(part => !isNaN(Number(part)))) {
        const [month, day, year] = dateParts;
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const formattedYear = year.length === 2 ? `20${year}` : year;
        return `${formattedMonth}/${formattedDay}/${formattedYear}`;
      }
      return cleanedAnswer;
    }
    return cleanedAnswer;
  };

  useEffect(() => {
    const clauses = extractClauses(documentText);
    const map = mapQuestionsToClauses(clauses, textTypes, numberTypes, radioTypes);
    setQuestionClauseMap(map);
  }, []);

  useEffect(() => {
    const probationQuestion = "Is the clause of probationary period applicable?";
    const followUpQuestions = ["What's the probation period length?", "What's the probation extension length?", "How many weeks?"];
    const isProbationApplicable = userAnswers[probationQuestion] as boolean || false;
    const terminationQuestion = "Is the termination clause applicable?";
    const followUpTermination = ["What's the notice period?"];
    const isTerminationApplicable = userAnswers[terminationQuestion] as boolean || false;
    const sickPayQuestion = "Is the sick pay policy applicable?"
    const followUpSickPay = ["What's the sick pay policy?"];
    const isSickPayApplicable = userAnswers[sickPayQuestion] as boolean || false;
    const prevEmploymentQuestion = "Is the previous service applicable?";
    const followUpPrev = ["What's the previous employment start date?"];
    const isPrevApplicable = userAnswers[prevEmploymentQuestion] as boolean || false;
    const overtimeQuestion = "Does the employee receive overtime payment?";
    const followUpOvertime = ["What's the overtime pay rate?"];
    const isOvertimeApplicable = userAnswers[overtimeQuestion] as boolean || false;

    const skipped = [
      ...(isProbationApplicable ? [] : followUpQuestions), 
      ...(isTerminationApplicable ? [] : followUpTermination),
      ...(isSickPayApplicable ? [] : followUpSickPay),
      ...(isPrevApplicable ? [] : followUpPrev),
      ...(isOvertimeApplicable ? []: followUpOvertime),
    ];
  
    setSkippedQuestions(skipped);
  }, [userAnswers["Is the clause of probationary period applicable?"], 
      userAnswers["Is the termination clause applicable?"], 
      userAnswers["Is the sick pay policy applicable?"],
      userAnswers["Is the previous service applicable?"],
      userAnswers["Does the employee receive overtime payment?"]]);

  useEffect(() => {
    let updatedText = documentText;
    Object.entries(userAnswers).forEach(([question, answer]) => {
      const placeholder = findPlaceholderByValue(question);
      if (!placeholder) return;
      const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
      console.log("Processing answer:", { placeholder, question, answer });
      if (typeof answer === "boolean") {
        if (!answer) {
          updatedText = updatedText.replace(new RegExp(`.*${escapedPlaceholder}.*`, "gi"), "");
        }
      } else {
        updatedText = updatedText.replace(
          new RegExp(`\\[${placeholder.replace(/\s+/g, " ")}\\]`, "gi"),
          answer ? `<span class="bg-lime-300">${answer}</span>` : `[${placeholder}]`
        );
      }
    });
  
    setAgreement(updatedText);
  }, [userAnswers]);

  const handleAnswerChange = (index: number, value: string | boolean) => {
    const { primaryValue } = determineQuestionType(highlightedTexts[index] || "");
    const currentType = selectedTypes[index] || "Text";
    const placeholder = Object.keys(textTypes).find(key => textTypes[key] === primaryValue) ||
                      Object.keys(numberTypes).find(key => numberTypes[key] === primaryValue) ||
                      Object.keys(radioTypes).find(key => radioTypes[key] === primaryValue) || "";

    console.log("Handling answer change for:", { primaryValue, value, currentType, index, placeholder });

    setHighlightedPlaceholder(prev => ({
      ...prev,
      [placeholder || '']: true,
    }));

    setUserAnswers((prev) => ({
      ...prev,
      [primaryValue]: value,
    }));
  };

  const renderAnswerInput = (index: number) => {
    const questionText = highlightedTexts[index] || "";
    const { primaryValue } = determineQuestionType(questionText);
    const currentType = selectedTypes[index] || "Text";
    const answer = userAnswers[primaryValue] || (currentType === "Radio" ? false : "");
    const isProbationFollowUp = primaryValue === "What's the probation period length?" || primaryValue === "What's the probation extension length?" || primaryValue === "How many weeks?";
    const isProbationApplicable = userAnswers["Is the clause of probationary period applicable?"] === true;

    if (isProbationFollowUp && !isProbationApplicable) {
      return (
        <div className="mt-4 p-2 w-full border border-gray-300 rounded-md text-gray-500 bg-gray-100">
          This clause will not be populated in the Final Agreement since it has been selected as 'No'
        </div>
      );
    }

    switch (currentType) {
      case "Text":
        return (
          <input
            ref={el => { if (el) inputRefs.current[index] = el; }}
            type="text"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="mt-4 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your text answer"
          />
        );
      case "Number":
        return (
          <input
            ref={el => { if (el) inputRefs.current[index] = el; }}
            type="text"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleAnswerChange(index, formatDateAnswer(e.target.value))}
            className="mt-4 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter a number or text"
          />
        );
      case "Radio":
        return (
          <div className="mt-4 flex space-x-4">
            <label>
              <input
                type="radio"
                name={`answer-${index}`}
                value="true"
                checked={answer === true}
                onChange={() => handleAnswerChange(index, true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`answer-${index}`}
                value="false"
                checked={answer === false}
                onChange={() => handleAnswerChange(index, false)}
              />
              No
            </label>
          </div>
        );
      default:
        return (
          <input
            ref={el => { if (el) inputRefs.current[index] = el; }}
            type="text"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="mt-4 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your answer"
          />
        );
    }
  };

  const handleFinish = () => {
    navigation("/Finish", { state: { userAnswers } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-100 via-purple-100 to-blue-100 relative">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-row w-full p-8">
          {/* Left section for questions */}
          <div className="flex flex-col w-1/2 pl-1 pr-8 sticky top-0 max-h-screen overflow-y-auto">
            {highlightedTexts.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Questions</h2>
                {highlightedTexts.map((text, index) => {
                  const { primaryValue } = determineQuestionType(text);
                  if (!skippedQuestions.includes(primaryValue || "")) {
                    return (
                      <div key={index} className="flex mb-6">
                        <div className="w-full pr-4">
                          {/* Use editedQuestions instead of primaryValue */}
                          <p className="text-lg">{editedQuestions[index] || primaryValue || "Unnamed Question"}</p>
                          {renderAnswerInput(index)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                <div className="flex justify-end mt-6">
                  <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:scale-110 transition-all duration-300"
                    onClick={handleFinish}
                  >
                    Finish
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 w-full">
                <p className="text-gray-600">No questions have been generated yet.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Please go to the Questionnaire tab, create or select questions from the Document tab, and then return here to answer them and generate a live document preview.
                </p>
              </div>
            )}
          </div>
  
          {/* Right section for the agreement preview */}
          <div className="w-1/2 pl-8 bg-white rounded-lg shadow-sm border border-black-100">
            <div className="mt-4 p-4 rounded-md bg-white text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: agreement }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live_Generation;