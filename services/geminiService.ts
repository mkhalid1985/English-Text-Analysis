import { GoogleGenAI, Type } from "@google/genai";
import { GuidedQuestion, AnswerEvaluation } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-pro';

export const generateGuidedQuestions = async (text: string, quizType: 'mcq' | 'descriptive' | 'blend', userName: string): Promise<GuidedQuestion[]> => {
  let promptInstructions = '';
  switch (quizType) {
    case 'mcq':
      promptInstructions = `All questions must be multiple-choice. The 'questionType' for all questions must be 'mcq'. You must provide an 'options' field which is an array of 4 strings: 3 incorrect but plausible distractors, and the one correct answer. The 'answer' field must exactly match one of the strings in the 'options' array.`;
      break;
    case 'descriptive':
      promptInstructions = `All questions must be descriptive (open-ended). The 'questionType' for all questions must be 'descriptive'. Do not include an 'options' field.`;
      break;
    case 'blend':
      promptInstructions = `Generate a mix of descriptive (open-ended) and multiple-choice questions. For multiple-choice questions, set 'questionType' to 'mcq' and provide an 'options' field which is an array of 4 strings (3 incorrect, 1 correct). The 'answer' field must match one of the options. For descriptive questions, set 'questionType' to 'descriptive' and do not include the 'options' field.`;
      break;
  }

  const result = await ai.models.generateContent({
    model,
    contents: `You are an expert literary analysis tutor. You are creating a personalized quiz for your student, ${userName}.
    Analyze the following text and generate a series of guided questions to help ${userName} understand it. The text is: "${text}".
    Based on your analysis, create an array of 5-7 questions covering topics like Sentence Types, Figurative Language, Viewpoint, and Lexical Choice.
    ${promptInstructions}
    For each question, provide the following in a strict JSON object format:
    - category: The analysis category (e.g., 'Sentence Types').
    - question: The question for the student. Frame it as if you are asking ${userName} directly.
    - hint: A helpful hint to guide the student.
    - answer: A concise, correct answer to the question.
    - explanation: A detailed explanation of the correct answer and its literary effect.
    - relevantText: The exact quote or text snippet from the original text that this question is about. This must be a verbatim substring from the provided text.
    - questionType: The type of question ('mcq' or 'descriptive').
    - options: (For 'mcq' type only) An array of 4 string options.
    Return ONLY the JSON array of question objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            question: { type: Type.STRING },
            hint: { type: Type.STRING },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            relevantText: { type: Type.STRING },
            questionType: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["category", "question", "hint", "answer", "explanation", "relevantText", "questionType"],
        },
      },
    },
  });
  return JSON.parse(result.text.trim());
};

export const evaluateUserAnswer = async (userAnswer: string, correctAnswer: string): Promise<AnswerEvaluation> => {
    const result = await ai.models.generateContent({
        model,
        contents: `You are an AI teaching assistant. A student was asked a question and the correct answer is: "${correctAnswer}".
        The student's answer is: "${userAnswer}".
        Please evaluate if the student's answer is correct. The student doesn't need to be perfectly verbatim, but their answer should capture the main idea of the correct answer.
        Respond in a strict JSON format with two keys:
        - isCorrect: A boolean value (true if the student's answer is substantially correct, otherwise false).
        - feedback: A short, encouraging feedback message for the student explaining why their answer was right or wrong.
        Return ONLY the JSON object.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isCorrect: { type: Type.BOOLEAN },
                    feedback: { type: Type.STRING },
                },
                required: ["isCorrect", "feedback"],
            },
        },
    });
    return JSON.parse(result.text.trim());
};