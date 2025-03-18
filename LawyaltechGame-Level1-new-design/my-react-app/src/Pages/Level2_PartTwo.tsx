import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { ImLoop2 } from "react-icons/im";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import EmploymentAgreement from "../utils/EmploymentAgreement";

const icons = [
  { icon: <FaPenToSquare />, label: "Edit PlaceHolder" },
  { icon: <TbSettingsMinus />, label: "Small Condition" },
  { icon: <TbSettingsPlus />, label: "Big Condition" },
  { icon: <ImLoop2 />, label: "Loop" },
];

const GEMINI_API_KEY = import.meta.env;

const LevelTwoPart_Two = () => {
  const [tooltip, setTooltip] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const contentRef = useRef("");
  const debounceTimerRef = useRef(null);
  
  const extractContent = () => {
    const content = document.body.innerText || "";
    contentRef.current = content;
    
    const placeholders = content.match(/\[(.*?)\]/g) || [];
    const smallConditions = content
      .split('\n')
      .filter((text) => text.length >= 40 && text.length <= 450);
    const bigConditions = content
      .split('\n')
      .filter((text) => text.length > 450);
  
    return { placeholders, smallConditions, bigConditions };
  };
  
  const analyzeContent = async () => {
    try {
      if (isAnalyzing) return;
      setIsAnalyzing(true);
      
      const { placeholders, smallConditions, bigConditions } = extractContent();
      
      // Skip analysis if there's no significant content
      if (placeholders.length === 0 && smallConditions.length === 0 && bigConditions.length === 0) {
        setIsAnalyzing(false);
        return;
      }
    
      const prompt = `
        The document contains the following sections:

        ### 1. **Placeholders**:
        ${placeholders.length > 0 ? placeholders.join('\n') : 'None'}

        ### 2. **Small Conditions**:
        ${smallConditions.length > 0 ? smallConditions.slice(0, 5).join('\n') : 'None'}

        ### 3. **Big Conditions**:
        ${bigConditions.length > 0 ? bigConditions.slice(0, 2).join('\n') : 'None'}

        ### 🔎 **Objective**:
        Analyze the placeholders, small conditions, and big conditions in the document. Provide the following feedback:
        - ✅ **General Feedback**: Overall clarity, consistency, and relevance of the document.
        - 📌 **Specific Feedback**: For each section:
          - Identify any missing or redundant placeholders.
          - Suggest improvements in clarity and accuracy.
          - Point out any logical inconsistencies or contradictions.
          - Highlight any potential legal or formatting issues.
          
        ### 🎯 **Goal**:
        The feedback should help improve the document's structure, clarity, and professional tone. Keep the feedback clear and actionable.
     `;

      console.log("Sending analysis request to Gemini API");
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        setFeedback("Error analyzing document. Please try again later.");
        setIsAnalyzing(false);
        return;
      }
    
      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        const feedbackText = result.candidates[0].content.parts[0].text;
        console.log('Feedback received:', feedbackText.substring(0, 100) + '...');
        setFeedback(feedbackText);
      } else {
        console.error('Unexpected API response structure:', result);
        setFeedback("Unable to generate feedback. Please try again later.");
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      setFeedback("An error occurred during analysis. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const debouncedAnalyzeContent = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      analyzeContent();
    }, 2000); // 2 second debounce
  };

  const setupObserver = () => {
    const observer = new MutationObserver((mutations) => {
      let shouldAnalyze = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          shouldAnalyze = true;
        }
      });
      
      if (shouldAnalyze) {
        console.log("Document change detected, scheduling analysis");
        debouncedAnalyzeContent();
      }
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    
    return observer;
  };

  useEffect(() => {
    console.log("Component mounted, setting up observer");
    const observer = setupObserver();
    
    // Initial analysis
    setTimeout(() => {
      analyzeContent();
    }, 1000);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleIconClick = (label) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      const textWithoutBrackets = selectedText.slice(1, -1);
      
      if (highlightedTexts.includes(textWithoutBrackets)) {
        alert("This placeholder has already been selected.");
        return;
      }
      
      let span = document.createElement("span");
      span.textContent = selectedText;
      
      if (label === "Edit PlaceHolder") {
        if (selectedText.length >= 40) return;
        addHighlightedText(textWithoutBrackets);
        span.style.backgroundColor = "yellow";
      } else if (label === "Small Condition") {
        if (selectedText.length < 35 || selectedText.length > 450) return;
        addHighlightedText(textWithoutBrackets);
        span.style.backgroundColor = "lightblue";
        
        const sickPayClause = "[The Employee may also be entitled to Company sick pay]";
        if (selectedText === sickPayClause) {
          addHighlightedText("Company Sick Pay");
        }
      } else if (label === "Big Condition") {
        if (selectedText.length < 450) return;
        addHighlightedText(textWithoutBrackets);
        span.style.backgroundColor = "lightgreen";
        
        const probationClause = "[The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee's performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.]";
        if (selectedText === probationClause) {
          addHighlightedText("Probation Period Length");
        }
      } else if (label === "Loop") {
        addHighlightedText(textWithoutBrackets);
        span.style.backgroundColor = "yellow";
      }
      
      range.deleteContents();
      range.insertNode(span);
      
      // Trigger analysis after modification
      debouncedAnalyzeContent();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-green-100 via-purple-100 to-blue-100">
      <Navbar />
      <div className="fixed flex top-16 right-0 z-50 px-6 py-3 space-x-6">
        {icons.map(({ icon, label }, index) => (
          <div key={index} className="relative flex items-center">
            <button
              className="p-2 rounded-full bg-lime-300 hover:bg-lime-400 transition-colors duration-200 flex items-center justify-center text-3xl"
              onMouseEnter={() => setTooltip(label)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => handleIconClick(label)}
            >
              {icon}
            </button>
            {tooltip === label && (
              <div className="absolute -left-10 top-full mt-2 px-3 py-1 text-sm text-white bg-gray-800 rounded shadow-md whitespace-nowrap">
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-purple-100/50 mt-20">
        <h2 className="text-xl font-bold text-purple-800 mb-4">
          ☑️ Selected Placeholders
        </h2>
        {highlightedTexts.length > 0 ? (
          <ul className="space-y-2 bg-purple-50/50 p-4 rounded-lg">
            {highlightedTexts.map((text, index) => (
              <li
                key={index}
                className="flex items-center text-purple-700 bg-white/70 p-3 rounded-md shadow-sm hover:bg-purple-100/50 transition-colors duration-200"
              >
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-sm font-medium truncate">{text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 bg-purple-50/50 rounded-lg">
            <p className="text-purple-500 italic">
              No placeholders selected yet
            </p>
          </div>
        )}
        {highlightedTexts.length > 0 && (
          <div className="mt-4 text-right">
            <span className="text-sm text-purple-500">
              Total Placeholders: {highlightedTexts.length}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-8 pb-16">
        <EmploymentAgreement />
      </div>
      
      {feedback && (
        <div 
          className="fixed bottom-6 left-6 z-50 max-w-md max-h-96 overflow-y-auto rounded-xl shadow-lg border border-blue-100"
          style={{
            background: 'linear-gradient(to right, #ffffff, #f0f7ff)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            className="flex items-center justify-between p-3 rounded-t-xl"
            style={{
              background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              color: 'white',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <strong className="text-base">AI Document Analysis</strong>
            </div>
            <button
              onClick={() => setFeedback('')}
              className="bg-transparent border-0 text-white text-lg cursor-pointer hover:opacity-100 opacity-80 transition-opacity"
            >
              ×
            </button>
          </div>
          <div className="p-4 text-sm leading-relaxed">
            {feedback.split('\n\n').map((section, index) => {
              if (section.includes('**General Feedback**')) {
                return (
                  <div key={index} className="mb-3">
                    <div className="font-bold text-blue-600 flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">📊</span>
                      General Feedback
                    </div>
                    <p>{section.replace('### ✅ **General Feedback**:', '')}</p>
                  </div>
                );
              } else if (section.includes('**Specific Feedback**')) {
                return (
                  <div key={index} className="mb-3">
                    <div className="font-bold text-indigo-600 flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">📌</span>
                      Specific Feedback
                    </div>
                    <p>{section.replace('### 📌 **Specific Feedback**:', '')}</p>
                  </div>
                );
              } else {
                return <p key={index} className="mb-2">{section}</p>;
              }
            })}
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="fixed bottom-6 right-6 bg-white p-3 rounded-lg shadow-md text-blue-600 flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          Analyzing document...
        </div>
      )}
    </div>
  );
};

export default LevelTwoPart_Two;
