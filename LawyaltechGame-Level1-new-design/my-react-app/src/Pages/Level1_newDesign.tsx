import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import "@fontsource/orbitron/900.css";
import "@fontsource/pixelify-sans/400.css";

// Props for top buttons
interface CustomButtonProps {
  children: ReactNode;
}

// Top bar button (Question 1, Score 100)
const CustomButton: React.FC<CustomButtonProps> = ({ children }) => {
  return (
    <button className="px-4 py-1 bg-white rounded-full text-[#34C759] text-[18px] shadow-lg shadow-black/50">
      {children}
    </button>
  );
};

const LevelOneDesign = () => {
  const [score, setScore] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintLimit, setHintLimit] = useState<number>(5);
  const [hintToggled, setHintToggled] = useState<boolean>(false);


  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selected]);

  const questions = [
    {
      question:
        '1.  What is the best way to automate a placeholder like "Company Name" in an advanced CLM tool like Contract Coder?',
      options: [
        " Put curly braces around the placeholders",
        "Use square braces around the placeholder",
        " Identify a placeholder and click on the placeholder button to automate it",
        "Write the company name in all caps for emphasis",
      ],
      correct: 2,
      hint: "Remember what you learned in the previous video about automating placeholders",
    },
    {
      question:
        "2.  How can you ensure automated documents retrieve the latest data from an external system (e.g., CRM, ERP)?",
      options: [
        " Manually check and update data in the document before finalizing",
        " Integrate API calls or database queries to pull real-time data dynamically",
        " Export data from external systems and copy-paste it into the document",
        "Set a reminder to periodically refresh data by re-importing it manually",
      ],
      correct: 1,
      hint: " Consider how integration with other tools can improve efficiency and accuracy",
    },
    {
      question:
        "3.  How do you dynamically insert repeating sections (e.g., multiple signatories or payment terms)?",
      options: [
        "Copy-paste the required section multiple times as needed",
        " Use a loop to generate multiple entries based on a dataset",
        "Leave placeholders and ask users to fill them in manually",
        " Create separate templates for different numbers of repeating sections",
      ],
      correct: 1,
      hint: "Think about how loops can generate structured data efficiently",
    },
    {
      question: "4.  Why use automation in legal documents?",
      options: [
        " To reduce human error",
        "To save time on repetitive tasks",
        " Both A and B",
        "To increase document length for billing purposes",
      ],
      correct: 2,
      hint: "Think about the main benefits that automation brings to legal workflows",
    },
    {
      question:
        "5.  How can you ensure tasks are assigned to the right team members?",
      options: [
        "Manually assign tasks based on availability",
        "Use role-based assignment rules to automatically assign tasks",
        "Ask team members to pick up tasks themselves",
        " Assign all tasks to a single team member for efficiency",
      ],
      correct: 1,
      hint: "Consider a method that reduces manual effort and ensures tasks are assigned based on predefined criteria",
    },
    {
      question:
        "6. How can you ensure a contract automatically selects the correct jurisdiction based on the client’s location?",
      options: [
        "Ask the user to manually choose the jurisdiction each time",
        "Use a variable that pulls the jurisdiction based on the client’s location data",
        " Include all possible jurisdictions and let the user delete the irrelevant ones",
        "Hardcode a default jurisdiction for all contracts",
      ],
      correct: 1,
      hint: "Automation should adapt based on client-specific details to reduce manual edits",
    },
    {
      question:
        "7. What is the best way to dynamically insert different payment terms based on contract type?",
      options: [
        "Use a conditional rule that selects the relevant payment terms automatically",
        " Manually type the payment terms after generating the document",
        "Include all payment terms in the contract and delete the unnecessary ones",
        "Leave a blank space and ask the user to fill in the payment terms later",
      ],
      correct: 0,
      hint: " Conditional logic helps automate document variations based on contract type",
    },
    {
      question:
        "8.  What is the best way to generate a report of all contracts expiring within the next 30 days?",
      options: [
        " Set up a scheduled workflow that filters and extracts contracts expiring soon",
        "Open each contract manually and check the expiration date",
        "Ask employees to maintain a spreadsheet of contract expiration dates",
        "Review contracts only when a renewal request comes in",
      ],
      correct: 0,
      hint: "Automated workflows help monitor and manage contract deadlines efficiently.",
    },
    {
      question:
        "9. How can you automatically notify stakeholders when a contract reaches a critical stage?",
      options: [
        "Set up an automated workflow to send notifications based on contract milestones",
        "Assign someone to manually send emails when updates are needed",
        "Check contract statuses periodically and inform stakeholders if necessary",
        " Rely on stakeholders to follow up on their own without automated reminders",
      ],
      correct: 0,
      hint: "Automated notifications keep stakeholders informed without manual intervention",
    },
    {
      question:
        "10. How can you automatically pre-fill customer details in a contract?",
      options: [
        " Integrate the contract automation system with a CRM to pull customer data",
        " Manually type the customer details for each new contract",
        "Copy and paste customer details from previous contracts",
        "Leave the fields blank and ask the user to fill them in before sending",
      ],
      correct: 0,
      hint: "Integrating external systems eliminates manual data entry and improves accuracy",
    },
  ];

  const handleSelect = (question: number, answer: number) => {
    setSelected(true);
    const correct = questions[question].correct;
    if (correct == answer) {
      setScore((prevScore) => prevScore + 10);
    } else {
      if (score > 0) {
        setScore((prevScore) => prevScore - 5);
      }
    }
  };
 

  const handleNext = () => {
    if (selected) {
      setSelected(false);
      setShowHint(false);
      setHintToggled(false);
      setProgressIndex((prevIndex) => prevIndex + 1);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelected(false);
      } else {
        setShowPopup(true);
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      alert("Please select an option before proceeding.");
    }
  };

  const handleHint = () => {
    if (!showHint && hintLimit > 0) {
      if (!hintToggled) {
        setHintLimit((prevLimit) => prevLimit - 1);
        setHintToggled(true);
      }
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  };

  return (
    <div className="bg-[url('/src/assets/Level1_background.png')]  bg-center h-screen w-screen px-2 font-[Orbitron] flex flex-col justify-between py-4">
      {/* Header section with progress bar  */}
      <div className="flex-none">
        <div className="flex items-center  space-x-4   lg:mt-2">
          <div className="w-full bg-opacity-30 bg-indigo-300 h-2 md:h-4 rounded-full overflow-hidden border border-indigo-500/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-300"
              style={{ width: `${progressIndex * 10}%` }}
            ></div>
          </div>
        </div>
        {/* Top bar (Question and Score) */}
        <div className="flex justify-between px-4 py-4 mb-4">
        <CustomButton>QUESTION {currentQuestionIndex + 1}</CustomButton>

          <div className="flex gap-x-4">
            <CustomButton>Score :  {score}</CustomButton>
            <CustomButton>Hints :  {hintLimit}</CustomButton>
          </div>
        </div>
      </div>

      {/* Main Content Centered */}
      <div className="flex flex-col items-center gap-8">
        {/* Centered Question */}
        <div
          className="uppercase text-white text-center px-24 py-3 rounded-2xl text-[20px]"
          style={{ backgroundColor: "rgba(84, 84, 86, 0.34)" }}
        >
          {questions[currentQuestionIndex].question}
        </div>

        {/* 2x2 Grid for Answer Options */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-6">
          {questions[currentQuestionIndex].options.map((option, oIndex) => (
            <div className=" h-[65px] w-[460px] bg-white rounded-full border-4 border-[#59CAD3] shadow-lg shadow-black/50 flex px-4">
              <label
                key={oIndex}
                className="flex items-center p-2  cursor-pointer "
              >
                {" "}
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={oIndex}
                  key={`question-${currentQuestionIndex}-option-${oIndex}`}
                  onChange={() => handleSelect(currentQuestionIndex, oIndex)}
                  disabled={selected}
                />
                <span className="text-xs sm:text-sm md:text-base font-sans flex items-center px-4">{`${String.fromCharCode(
                  65 + oIndex
                )}. ${option}`}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => handleHint()}
          className="mt-2 py-2 px-4 bg-gradient-to-r bg-[#B3DCA5]  border-4 border-[#59CAD3] text-white rounded-lg cursor-pointer"
        >
          Show Hint
        </button>
        {showHint && (
          <div className="p-2 mt-2 sm:p-3 md:p-4 rounded-lg bg-indigo-900/50 backdrop-blur-sm border border-indigo-500 w-full md:w-max">
            <p className="text-indigo-200 font-bold text-xs sm:text-sm md:text-base">
              {questions[currentQuestionIndex].hint}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col mt-2">
        {selected && (
          <div
            className="p-2 sm:p-3 md:p-4 md:w-max rounded-lg bg-gradient-to-r from-indigo-900/80 to-violet-900/80 backdrop-blur-sm
                                border-2 border-indigo-500 text-white text-sm"
          >
            <p>
              Correct answer:{" "}
              {String.fromCharCode(
                65 + questions[currentQuestionIndex].correct
              )}
            </p>
            <p>
              Incorrect answers:{" "}
              {questions[currentQuestionIndex].options
                .map((_, i) => i)
                .filter((i) => i !== questions[currentQuestionIndex].correct)
                .map((i) => String.fromCharCode(65 + i))
                .join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={() => handleNext()}
          className="shadow-lg  shadow-black/50 text-white px-6 p-2 rounded-full text-[26px] bg-[#B3DCA5]  border-4 border-[#59CAD3] "
        >
          <span className="text-white">Continue</span>
        </button>
      </div>

      {/* Completion popup */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-gradient-to-r from-indigo-900 to-violet-900 p-4 sm:p-6 md:p-8 rounded-lg shadow-2xl border-2 border-indigo-500 w-full max-w-xs sm:max-w-sm md:max-w-md">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-white">
              Quiz Completed!
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-indigo-200">
              Final Score: {score}
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                window.location.href = "/";
              }}
              className="mt-4 md:mt-6 px-3 sm:px-4 md:px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg
                      hover:from-indigo-400 hover:to-violet-400 transition-all duration-300 cursor-pointer text-xs sm:text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelOneDesign;
