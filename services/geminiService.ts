import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' });

export const generateDayImage = async (eventSummaries: string[], customPrompt?: string): Promise<string | null> => {
  if (!apiKey) throw new Error("API Key missing");

  // Simplified prompt to ensure better adherence to style
  const prompt = `
    Create a soft, faded watercolor painting collage representing: ${eventSummaries.join(', ')}. 
    Style: Whimsical, minimal, pastel colors, white background. 
    ${customPrompt ? `Special Twist/Element: ${customPrompt}` : ''}
    Important: The image will be used as a background for text, so keep it uncluttered and light.
    Do NOT include any text, letters, or numbers in the artwork.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1", 
        }
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
         }
       }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateMonthHeader = async (monthName: string, theme?: string): Promise<string | null> => {
  if (!apiKey) throw new Error("API Key missing");
  
  const selectedTheme = theme || "Tollgate Elementary School Gators (Pickerington Local School District)";

  const prompt = `
    Create a wide, fun, panoramic header illustration for a school calendar for ${monthName}.
    Theme: ${selectedTheme}.
    Style: Playful watercolor illustration, vibrant but suitable for a header. 
    Format: Wide landscape banner.
    Do NOT include any text, numbers, or calendars in the image itself.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9", // Closest to a banner we can get, we will crop visually
        }
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
         }
       }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating header:", error);
    return null;
  }
};