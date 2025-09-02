/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Fix: Add and export Face and Person interfaces for type safety.
export interface Face {
    id: number;
    box: [number, number, number, number]; // [x, y, width, height]
}
export interface Person {
    id: number;
    box: [number, number, number, number];
}

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const [header, data] = dataUrl.split(',');
    if (!header || !data) throw new Error("Invalid data URL");
    const mimeMatch = header.match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse
): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try a different edit.");

    throw new Error(errorMessage);
};

/**
 * Applies a generative AI visual effect to an image.
 * @param baseImage The image file to edit.
 * @param toolPrompt The instruction for the edit (e.g., "Whiten sclera", "Apply a cinematic look").
 * @param strength The intensity of the effect, from 0 to 100.
 * @returns A promise that resolves to the base64 data URL of the edited image.
 */
export const applyAiEffect = async (
    baseImage: File,
    toolPrompt: string,
    strength: number,
): Promise<string> => {
    console.log(`Applying effect: "${toolPrompt}" with strength ${strength}%`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(baseImage);
    
    const prompt = `You are an expert photo editor AI. A user wants to apply an effect to their photo.
    
User Request: "${toolPrompt}"

Apply this effect with an intensity of ${strength}%.

Editing Guidelines:
- The edit must be photorealistic, subtle, and blend seamlessly. Avoid exaggerated or unnatural results.
- The rest of the image must remain identical to the original unless the prompt requires a global change (like a filter).
- For portrait edits, ensure the results are natural and enhance the subject's features tastefully.

Safety & Ethics Policy:
- You MUST FULFILL requests to adjust skin tone (e.g., 'give me a tan', 'make my skin lighter'). These are standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian'). Do not perform these edits. If ambiguous, err on the side of caution.

Output: Return ONLY the final edited image. Do not return any text.`;
    
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return handleApiResponse(response);
};

// Fix: Add generateSuggestions function to get AI-powered edit ideas.
/**
 * Generates a list of suggested edits for an image.
 * @param baseImage The image to analyze.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export const generateSuggestions = async (
    baseImage: File,
): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(baseImage);
    
    const prompt = `Analyze this portrait and suggest 4-5 short, actionable photo editing improvements. The user is using an AI photo editor.
    Focus on common professional retouching tasks.
    Examples: "Smooth skin texture", "Whiten teeth", "Enhance eye color", "Remove flyaway hairs", "Add a soft background blur".
    Return the suggestions as a JSON array of strings. For example: ["Suggestion 1", "Suggestion 2"]
    Do not return any other text, just the JSON array.`;

    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const jsonText = response.text.trim().match(/\[.*\]/s)?.[0];
        if (jsonText) {
            const suggestions = JSON.parse(jsonText);
            if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
                return suggestions;
            }
        }
        console.warn("Could not parse suggestions from Gemini response:", response.text);
        return [];
    } catch (err) {
        console.error("Error generating suggestions:", err);
        return []; // Return empty array on error
    }
};