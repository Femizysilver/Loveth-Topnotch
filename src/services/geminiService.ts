import { GoogleGenAI } from "@google/genai";
import { LOVETH_CONTACT } from "../constants";

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini Warning] GEMINI_API_KEY is not defined in environment variables.");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: apiKey || "placeholder-key-for-initialization",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export async function getChatResponse(message: string, history: { role: string; parts: { text: string }[] }[], propertiesContext: string) {
  try {
    const ai = getAIClient();
    const model = ai.models.generateContent({
      model: "gemini-3.5-flash", 
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are the TopNotch Virtual Assistant for Loveth TopNotch Global Properties Ltd. 
        Your tone is premium, professional, friendly, and trustworthy.
        
        About Loveth:
        Loves TopNotch Global Properties Ltd helps Nigerians at home and abroad secure genuine properties. 
        Based in Nigeria, serving Lagos, Abuja, Adana, Aba, Ibadan, Ogun, and beyond.
        Contact: Phone ${LOVETH_CONTACT.phone}, Email ${LOVETH_CONTACT.email}.
        
        Available Properties Context:
        ${propertiesContext}
        
        Your Goal:
        1. Answer questions about available properties based on the context provided.
        2. If the user is interested in a property or needs a consultation, politely ask for their Name, Email, and Phone Number so Loveth can contact them.
        3. Explain investment opportunities like the Real Estate Buyback (50-75% ROI).
        4. Assist diaspora clients specifically by explaining how Loveth handles verification and handovers.
        5. If asked about something not in the context, refer them to Loveth's contact details.
        
        Keep responses concise and elegant. Use Markdown for formatting.`,
        temperature: 0.7,
      },
    });

    const response = await model;
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having a bit of trouble connecting. Please reach out to Loveth directly at " + LOVETH_CONTACT.phone;
  }
}
