import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, TriageResponse } from "../types";

const TRIAGE_MODEL = "gemini-2.5-flash";
const ANALYSIS_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

export const GeminiService = {
  /**
   * Assesses a user's reported symptoms to determine severity and advice.
   * Supports Text and Location-based grounding (Maps).
   */
  async assessCrisis(
    message: string, 
    chatHistory: string[], 
    location?: { latitude: number; longitude: number }
  ): Promise<TriageResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const historyContext = chatHistory.join("\n");
      
      const parts: any[] = [];
      if (message) parts.push({ text: message });

      const prompt = `
        You are Dr. Gemini, an expert Hematologist and dedicated medical AI agent specializing in Sickle Cell Disease.
        
        Patient History Context:
        ${historyContext}
        
        INSTRUCTIONS:
        1. Analyze the input for pain severity (0-10) and emergency symptoms.
        2. If the user asks for hospitals, doctors, or help nearby, USE the Google Maps tool to find real locations based on their coordinates.
        3. **CRITICAL OUTPUT FORMAT**: 
           Start your response strictly with a status line in this format: 
           "STATUS: { "severity": 7, "requiresEmergency": true }"
           
           Then provide your empathetic, clinical advice and map details (if applicable) in natural language below that line.

        Red Flags (Emergency): Chest pain, fever > 101F, difficulty breathing, seizure, inability to move.
      `;

      // Add system instruction as part of the content or config if supported, 
      // but putting it in the prompt part is reliable for 2.5 Flash mixed with tools.
      parts.unshift({ text: prompt });

      const requestConfig: any = {
        tools: [{ googleMaps: {} }],
      };

      if (location) {
        requestConfig.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: TRIAGE_MODEL,
        contents: { parts },
        config: requestConfig
      });

      const text = response.text || "I am unable to process your request at this moment.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Parse the Custom Status Header
      let severity = 0;
      let requiresEmergency = false;
      let advice = text;

      const statusRegex = /STATUS:\s*({.*?})/;
      const match = text.match(statusRegex);

      if (match && match[1]) {
        try {
          const status = JSON.parse(match[1]);
          severity = status.severity || 0;
          requiresEmergency = status.requiresEmergency || false;
          // Remove the status line from the advice shown to user
          advice = text.replace(match[0], '').trim();
        } catch (e) {
          console.warn("Failed to parse status header", e);
        }
      }

      return {
        severity,
        requiresEmergency,
        advice,
        groundingChunks
      };

    } catch (error) {
      console.error("Crisis Assessment Error:", error);
      return {
        severity: 0,
        requiresEmergency: false,
        advice: "I am having trouble connecting to my medical systems. If you are in pain, please call 911.",
        groundingChunks: []
      };
    }
  },

  /**
   * Generates a calming visualization background using Nano Banana Pro.
   */
  async generateImmersiveBackground(scenePrompt: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: {
          parts: [
            { text: `Generate a high-quality, photorealistic, serene, wide-angle image for VR meditation. Theme: ${scenePrompt}. Soft lighting, calming colors, no text, atmospheric.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
           if (part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
           }
        }
      }
      return null;
    } catch (error) {
      console.error("Image Gen Error:", error);
      return null;
    }
  },

  /**
   * Analyzes journal entries to find triggers and correlations.
   */
  async analyzePatterns(entries: JournalEntry[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      if (entries.length === 0) return "No journal entries to analyze yet.";

      const entriesText = entries.map(e => 
        `Date: ${e.date} (${new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' })}), Context: ${e.activityContext || 'N/A'}, Pain Level: ${e.painLevel}, Notes: ${e.notes}`
      ).join("\n");
      
      const response = await ai.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: `
          Analyze these Sickle Cell pain journal entries for patterns and correlations.
          
          Data:
          ${entriesText}
          
          Tasks:
          1. Identify correlation between pain and specific days of the week (e.g., Work days vs Weekends).
          2. Identify context triggers (School, Work, Exercise).
          3. Look for weather or hydration patterns in the notes.
          
          Output a helpful, medical-style summary in 3 concise paragraphs. Use bolding for key findings.
        `
      });

      return response.text || "No patterns detected yet.";
    } catch (error) {
      console.error("Analysis Error:", error);
      return "Unable to analyze patterns at this time.";
    }
  }
};