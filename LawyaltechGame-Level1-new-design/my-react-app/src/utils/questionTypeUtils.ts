// Define an expanded QuestionType to include all possible types from your dropdown
export type QuestionType = "Radio" | "Text" | "Number" | "Paragraph" | "Email" | "Unknown";

export const textTypes: { [key: string]: string } = {
  "Employer Name": "What's the name of the employer?",
  "Registered Address": "What's the registered address of the employer?",
  "Employee Name": "What's the name of the employee?",
  "Employee Address": "What's the employee's address?",
  "Employment Start Date": "What's the employment start date?",
  "Previous Employment Start Date": "What's the previous employment start date?",
  "Job Title": "What's the name of the job title?",
  "Reporting Manager": "What's the name of the reporting manager?",
  "Brief Description of Duties": "What's the description of duties?",
  "Workplace Address": "What's the workplace address?",
  "Days of Work": "What's the days of work?",
  "Start Time": "When is the start time?",
  "End Time": "When is the end time?",
  "Payment Frequency": "What's the payment frequency?",
  "Payment Date": "When is the payment date?",
  "Details of Company Sick Pay Policy": "What's the sick pay policy?",
  "HR/Relevant Contact": "What's the name of HR/relevant contact?",
  "Notice Period": "What's the notice period?",
  "Company Handbook/HR": "What's the company handbook?",
  "Authorized Representative": "What's the name of the representative?",
  "Date": "What's the date?",
};

export const numberTypes: { [key: string]: string } = {
  "Probation Period Length": "What's the probation period length?",
  "Probation Extension Length": "What's the probation extension length?",
  "one week's": "How many weeks?",
  "Overtime Pay Rate": "What's the overtime pay rate?",
  "Annual Salary": "What's the annual salary?",
  "Holiday Entitlement": "What's the holiday entitlement?",
};

export const radioTypes: { [key: string]: string } = {
  // Using the full clause as the key
  "The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.": "Is the clause of probationary period applicable?",
  'or, if applicable, "on [Previous Employment Start Date] with previous continuous service taken into account"': "Is the previous service applicable?",
  // "Previous Employment Start Date": "Is the previous service applicable?",
  // "Overtime Pay Rate": "Is the overtime payment applicable?",
  "The Employee may also be entitled to Company sick pay of [Details of Company Sick Pay Policy].": "Is the sick pay policy applicable?",
  // "Details of Company Sick Pay Policy": "Is the sick pay policy applicable?",
  "The Employee shall not receive additional payment for overtime worked": "Should the employee not receive overtime payment?",
  "After the probationary period, either party may terminate the employment by providing [Notice Period] written notice. The Company reserves the right to make a payment in lieu of notice. The Company may summarily dismiss the Employee without notice in cases of gross misconduct.": "Is the termination clause applicable?",
  "The Employee is entitled to overtime pay at a rate of [Overtime Pay Rate] for authorized overtime work": "Does the employee receive overtime payment?",
};

// New validation function to check if a question relates to the specific placeholder
export const validateQuestionRelevance = (placeholder: string, question: string): boolean => {
  const lowerQuestion = question.toLowerCase().trim();

  // Text type placeholders (ensure relevance to the specific field)
  if (textTypes.hasOwnProperty(placeholder)) {
    if (placeholder === "Employer Name") {
      return (
        lowerQuestion.includes("employer") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("company"))
      );
    }
    if (placeholder === "Registered Address") {
      return (
        lowerQuestion.includes("address") &&
        (lowerQuestion.includes("employer") || lowerQuestion.includes("company") || lowerQuestion.includes("registered"))
      );
    }
    if (placeholder === "Employee Name") {
      return (
        lowerQuestion.includes("employee") &&
        (lowerQuestion.includes("name") || lowerQuestion.includes("person"))
      );
    }
    if (placeholder === "Employee Address") {
      return (
        lowerQuestion.includes("employee") &&
        lowerQuestion.includes("address")
      );
    }
    // Add similar checks for other textTypes as needed (e.g., "Employment Start Date", "Job Title", etc.)
    return lowerQuestion.includes(placeholder.toLowerCase().replace(/ /g, " ")) || lowerQuestion.includes(placeholder.toLowerCase());
  }

  // Number type placeholders (ensure relevance to numerical aspects)
  if (numberTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("what") &&
      (lowerQuestion.includes("length") || lowerQuestion.includes("weeks") || lowerQuestion.includes("rate") || lowerQuestion.includes("salary") || lowerQuestion.includes("entitlement"))
    );
  }

  // Radio type placeholders (ensure relevance to Yes/No applicability)
  if (radioTypes.hasOwnProperty(placeholder)) {
    return (
      lowerQuestion.includes("is") &&
      (lowerQuestion.includes("applicable") || lowerQuestion.includes("apply"))
    );
  }

  return true; // Fallback for unknown placeholders
};

export const findKeyByValue = (obj: { [key: string]: string }, value: string): string | undefined => {
  return Object.keys(obj).find(key => obj[key] === value);
};
export const findPlaceholderByValue = (value: string): string | undefined => {
  return (
    findKeyByValue(textTypes, value) ||
    findKeyByValue(numberTypes, value) ||
    findKeyByValue(radioTypes, value)
  );
};

export const determineQuestionType = (text: string): { 
  primaryType: QuestionType, 
  primaryValue: string, 
  validTypes: QuestionType[], 
  alternateType?: QuestionType, 
  alternateValue?: string 
} => {
  let primaryType: QuestionType = "Unknown";
  let primaryValue: string = "";
  let validTypes: QuestionType[] = [];
  let alternateType: QuestionType | undefined;
  let alternateValue: string | undefined;

  // Radio types (restrict to Radio only, including full clause)
  const fullProbationClause = "The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. The Company may extend the probationary period by up to [Probation Extension Length] if further assessment is required. During the probationary period, either party may terminate the employment by providing [one week's] written notice. Upon successful completion, the Employee will be confirmed in their role.";
  const fullTerminationClause = "After the probationary period, either party may terminate the employment by providing [Notice Period] written notice. The Company reserves the right to make a payment in lieu of notice. The Company may summarily dismiss the Employee without notice in cases of gross misconduct.";
  if (radioTypes.hasOwnProperty(text) || text === fullProbationClause || text === fullTerminationClause) {
    
    // if (primaryType === "Unknown") {
    //   primaryType = "Radio";
    //   primaryValue = radioTypes[text] || radioTypes[fullProbationClause];
    // } else {
    //   alternateType = "Radio";
    //   alternateValue = radioTypes[text] || radioTypes[fullProbationClause];
    // }
    // validTypes.push("Radio");
    primaryType = "Radio"; 
    primaryValue = radioTypes[text] || radioTypes[fullProbationClause];
    validTypes.push("Radio");
  }

  // Text types (restrict to Text only)
  if (textTypes.hasOwnProperty(text)) {
    primaryType = "Text";
    primaryValue = textTypes[text];
    validTypes = ["Text"]; // Enforce Text type for all text placeholders
  }

  // Number types (restrict to Number only)
  if (numberTypes.hasOwnProperty(text)) {
    if (primaryType === "Unknown") {
      primaryType = "Number";
      primaryValue = numberTypes[text];
    } else {
      alternateType = "Number";
      alternateValue = numberTypes[text];
    }
    validTypes.push("Number");
  }

  

  if (validTypes.length === 0) {
    return { primaryType: "Unknown", primaryValue: "", validTypes: ["Text", "Paragraph", "Email", "Number", "Radio"] };
  }

  return { primaryType, primaryValue, validTypes, alternateType, alternateValue };
};