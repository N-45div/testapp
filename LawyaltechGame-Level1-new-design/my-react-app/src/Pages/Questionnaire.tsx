// Questionnaire.tsx
import Navbar from "../components/Navbar";
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useHighlightedText } from "../context/HighlightedTextContext";
import {
  determineQuestionType,
  numberTypes,
  radioTypes,
  textTypes,
  QuestionType,
} from "../utils/questionTypeUtils";

interface DivWithDropdownProps {
  textValue: string;
  index: number;
  onTypeChange: (index: number, type: string) => void;
  onQuestionTextChange: (index: number, newText: string) => void;
  initialQuestionText: string;
}

const DivWithDropdown: React.FC<DivWithDropdownProps> = ({
  textValue,
  index,
  onTypeChange,
  onQuestionTextChange,
  initialQuestionText,
}) => {
  const [questionText, setQuestionText] = useState(
    initialQuestionText || "No text selected"
  );
  const [selectedType, setSelectedType] = useState<string>("Text");
  const [isOpen, setIsOpen] = useState(false);
  const { highlightedTexts } = useHighlightedText();
  const { primaryValue, validTypes } = determineQuestionType(textValue);

  const handleTypeSelect = (type: string) => {
    const validType = validTypes.includes(type as QuestionType);
    if (!validType) {
      alert(
        `Only ${validTypes.join(", ")} type questions can be made for this question. Please select an appropriate type.`
      );
      return;
    }

    const probationClause =
      "[The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee's performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.]";
    if (highlightedTexts[index] === probationClause && type !== "Radio") {
      alert(
        "This question must be of Radio type for the probationary period clause."
      );
      return;
    }

    setSelectedType(type);
    onTypeChange(index, type);

    let newQuestionText = questionText;
    if (questionText === primaryValue || questionText === "No text selected") {
      if (type.toLowerCase() === "radio" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "text" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "number" && primaryValue) {
        newQuestionText = primaryValue;
      }
      setQuestionText(newQuestionText);
      onQuestionTextChange(index, newQuestionText);
    }
    setIsOpen(false);
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setQuestionText(newText);
    onQuestionTextChange(index, newText);
  };

  const dropdownOptions = ["Text", "Paragraph", "Email", "Radio", "Number"];

  return (
    <div className="flex items-center space-x-20 w-full">
      <button className="flex flex-col justify-between h-10 w-10 p-1">
        <span className="block h-1 w-20 bg-black rounded"></span>
        <span className="block h-1 w-20 bg-black rounded"></span>
        <span className="block h-1 w-20 bg-black rounded"></span>
      </button>
      <div className="relative w-200 h-40 bg-lime-300 rounded-lg shadow-md flex flex-col items-center justify-center text-black text-lg font-semibold p-4 z-10">
        <div className="relative w-full flex items-center">
          <div className="h-0.5 w-2/5 bg-black absolute left-0"></div>
          <input
            type="text"
            value={questionText}
            onChange={handleQuestionTextChange}
            className="px-2 py-1 text-sm bg-transparent w-2/5 relative z-10 top-[-14px] max-w-full overflow-hidden border-b border-gray-500 focus:outline-none focus:border-blue-600"
            placeholder="Edit question text"
          />
        </div>

        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 flex items-center space-x-2">
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-black text-sm bg-white px-2 py-1 rounded"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{selectedType}</span>
              <FaChevronDown />
            </button>
            {isOpen && (
              <div
                className="absolute right-0 mt-2 h-[16vh] w-40 bg-white border rounded shadow-lg z-50"
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="hide-scrollbar">
                  {dropdownOptions.map((type) => (
                    <div
                      key={type}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Questionnaire = () => {
  const [leftActive, setLeftActive] = useState(true);
  const [rightActive, setRightActive] = useState(false);
  const { highlightedTexts } = useHighlightedText();
  const { selectedTypes, setSelectedTypes, editedQuestions, setEditedQuestions } = useQuestionType();
  const [uniqueQuestions, setUniqueQuestions] = useState<string[]>([]);
  const [duplicateDetected, setDuplicateDetected] = useState<boolean>(false);
  const [questionTexts, setQuestionTexts] = useState<string[]>([]);

  // Initialize only when highlightedTexts changes, and preserve existing editedQuestions
  useEffect(() => {
    const processedTexts = [];
    const questionMap = new Map();

    for (const text of highlightedTexts) {
      const { primaryValue } = determineQuestionType(text);

      if (primaryValue && !questionMap.has(primaryValue)) {
        questionMap.set(primaryValue, text);
        processedTexts.push(text);
      } else if (primaryValue && questionMap.get(primaryValue) === text) {
        setDuplicateDetected(true);
        setTimeout(() => setDuplicateDetected(false), 3000);
      }
    }

    setUniqueQuestions(processedTexts);

    // Only initialize if there are no existing editedQuestions or if the length doesn't match
    if (editedQuestions.length === 0 || editedQuestions.length !== processedTexts.length) {
      const initialTexts = processedTexts.map(
        (text) => determineQuestionType(text).primaryValue || "No text selected"
      );
      const initialTypes = processedTexts.map((text) => {
        const probationClause =
          "[The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee's performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.]";
        if (text === probationClause) return "Radio";
        if (textTypes.hasOwnProperty(text)) return "Text";
        if (numberTypes.hasOwnProperty(text)) return "Number";
        if (radioTypes.hasOwnProperty(text)) return "Radio";
        return "Text";
      });
      setQuestionTexts(initialTexts);
      setSelectedTypes(initialTypes);
      setEditedQuestions(initialTexts); // Initialize edited questions only if new
    } else {
      // Sync local questionTexts with existing editedQuestions
      setQuestionTexts([...editedQuestions]);
      setSelectedTypes(selectedTypes.length === processedTexts.length ? [...selectedTypes] : processedTexts.map(() => "Text"));
    }
  }, [highlightedTexts, setSelectedTypes, setEditedQuestions, editedQuestions.length, selectedTypes.length]);

  const handleTypeChange = (index: number, type: string) => {
    const textValue = uniqueQuestions[index];
    const { validTypes } = determineQuestionType(textValue);
    const validType = validTypes.includes(type as QuestionType);
    if (!validType) {
      alert(
        `Only ${validTypes.join(", ")} type questions can be made for this question. Please select an appropriate type.`
      );
      return;
    }

    const newTypes = [...selectedTypes];
    newTypes[index] = type;
    setSelectedTypes(newTypes);

    const { primaryValue } = determineQuestionType(textValue);
    const newTexts = [...questionTexts];
    if (
      newTexts[index] === primaryValue ||
      newTexts[index] === "No text selected"
    ) {
      if (type.toLowerCase() === "radio" && primaryValue) {
        newTexts[index] = primaryValue;
      } else if (type.toLowerCase() === "text" && primaryValue) {
        newTexts[index] = primaryValue;
      } else if (type.toLowerCase() === "number" && primaryValue) {
        newTexts[index] = primaryValue;
      }
      setQuestionTexts(newTexts);
      setEditedQuestions(newTexts); // Update edited questions
    }
  };

  const handleQuestionTextChange = (index: number, newText: string) => {
    const newTexts = [...questionTexts];
    newTexts[index] = newText;
    setQuestionTexts(newTexts);
    setEditedQuestions(newTexts); // Update edited questions
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-100 via-purple-100 to-blue-100 relative">
      <Navbar />
      <div className="absolute top-16 right-6 w-80 h-10 bg-lime-300 rounded-lg shadow-md flex items-center justify-center text-black text-sm font-semibold">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${
              leftActive ? "text-gray-600" : "text-blue-600"
            }`}
          >
            <span>Employer</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setLeftActive(true);
                setRightActive(false);
              }}
            >
              <FaChevronLeft className="text-xl hover:scale-110" />
            </button>
            <button
              onClick={() => {
                setRightActive(true);
                setLeftActive(false);
              }}
            >
              <FaChevronRight className="text-xl hover:scale-110" />
            </button>
          </div>
          <div
            className={`flex items-center space-x-2 ${
              rightActive ? "text-gray-600" : "text-blue-600"
            }`}
          >
            <span>Employee</span>
          </div>
        </div>
      </div>

      {duplicateDetected && (
        <div className="absolute top-28 right-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md transition-opacity duration-400">
          <p className="font-bold">Duplicate Question</p>
          <p>This question already exists in the questionnaire.</p>
        </div>
      )}

      <div className="flex-grow flex flex-col items-center justify-center pt-20 pb-8 px-4 overflow-y-auto">
        <div className="space-y-20 w-full max-w-3xl">
          {uniqueQuestions.length > 0 ? (
            uniqueQuestions.map((text, index) => (
              <DivWithDropdown
                key={index}
                textValue={text}
                index={index}
                onTypeChange={handleTypeChange}
                onQuestionTextChange={handleQuestionTextChange}
                initialQuestionText={questionTexts[index] || editedQuestions[index] || "No text selected"}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No text has been selected yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Go to the Document tab and select text in square brackets to
                generate questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;