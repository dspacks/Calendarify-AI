/**
 * Gemini AI Service
 *
 * Handles all interactions with Google Gemini AI API for image generation.
 * Uses the Gemini 2.5 Flash Image model to create watercolor-style artwork
 * for calendar events and monthly headers.
 *
 * @module geminiService
 */

import { GoogleGenAI } from "@google/genai";

// Load API key from environment variables
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in process.env");
}

// Initialize Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' });

/**
 * Generates AI artwork for a calendar day's events.
 *
 * Creates a soft, faded watercolor painting style image that represents
 * the day's events. The image is optimized for use as a background with
 * text overlay, so it maintains a light, uncluttered aesthetic.
 *
 * @param eventSummaries - Array of event titles for the day (e.g., ["Team Meeting", "Lunch"])
 * @param customPrompt - Optional custom text to inject creative variations (e.g., "Add a small robot")
 * @returns Promise resolving to base64 encoded data URL, or null if generation fails
 *
 * @example
 * ```typescript
 * const events = ["Team Meeting", "Lunch with Client"];
 * const image = await generateDayImage(events, "Add a fun mascot");
 * if (image) {
 *   element.style.backgroundImage = `url(${image})`;
 * }
 * ```
 *
 * @remarks
 * - Uses 1:1 aspect ratio for square day cells
 * - Generated images contain NO text or numbers
 * - Returns null on API errors rather than throwing
 * - Free tier: ~15 requests per minute limit
 */
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

/**
 * Generates themed header banner images for calendar months.
 *
 * Creates a wide, panoramic illustration suitable for use as a calendar
 * month header. The style is playful watercolor, optimized for display
 * at the top of printable calendars.
 *
 * @param monthName - Full month name (e.g., "January", "December")
 * @param theme - Optional theme description (default: "Tollgate Elementary School Gators")
 * @returns Promise resolving to base64 encoded data URL, or null if generation fails
 *
 * @example
 * ```typescript
 * const header = await generateMonthHeader(
 *   "December",
 *   "Winter Wonderland with snowflakes"
 * );
 * ```
 *
 * @remarks
 * - Uses 16:9 aspect ratio for banner display
 * - Generated images contain NO text, numbers, or calendar elements
 * - Returns null on API errors rather than throwing
 * - Best used before generating daily images to set the month's tone
 */
export const generateMonthHeader = async (monthName: string, theme?: string): Promise<string | null> => {
  if (!apiKey) throw new Error("API Key missing");

  // Use default school theme if none provided
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