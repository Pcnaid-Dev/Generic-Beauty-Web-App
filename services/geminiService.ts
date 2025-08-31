/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";

export interface Face {
    id: number;
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
}
export interface Person {
    id: number;
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
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

// Helper function to convert a data URL string to a Gemini API Part
const dataUrlToPart = (dataUrl: string): { inlineData: { mimeType: string; data: string; } } => {
    const [header, data] = dataUrl.split(',');
    if (!header || !data) throw new Error("Invalid data URL for mask");
    const mimeMatch = header.match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from mask data URL");
    
    const mimeType = mimeMatch[1];
    return { inlineData: { mimeType, data } };
};


const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
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
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a text prompt and optional targeting.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param options An object that can contain a `face` bounding box or a `mask` data URL.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    options: { face?: Face, mask?: string } = {}
): Promise<string> => {
    const { face, mask } = options;
    console.log('Starting generative edit with options:', options);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const parts: ({ inlineData: { mimeType: string; data: string; } } | { text: string })[] = [originalImagePart];
    
    let prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized, and subtle edit on the provided image based on the user's request.
User Request: "${userPrompt}"\n`;

    if (face) {
        prompt += `Edit Location: The user has selected a face. Focus the edit within the bounding box {x: ${face.box.x}, y: ${face.box.y}, width: ${face.box.width}, height: ${face.box.height}}. The edit must be confined to this person.\n`;
    }

    if (mask) {
        const maskPart = dataUrlToPart(mask);
        parts.push(maskPart);
        prompt += `Edit Location: The user has provided a second image which is a black-and-white mask. You MUST apply the requested edit ONLY to the parts of the original image that correspond to the WHITE areas of the mask image. The BLACK areas of the mask MUST remain completely untouched in the final output.\n`;
    }

    prompt += `
Editing Guidelines:
- The edit must be photorealistic, subtle, and blend seamlessly with the surrounding area. Avoid exaggerated or unnatural results.
- Unless a mask is provided, the rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    
    const textPart = { text: prompt };
    parts.push(textPart);

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a background change applied.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @param peopleToRemove An optional array of Person objects to remove from the background.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateBackgroundChange = async (
    originalImage: File,
    adjustmentPrompt: string,
    peopleToRemove?: Person[],
): Promise<string> => {
    console.log(`Starting background change: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    let prompt = `You are an expert photo editor AI. Your task is to ONLY modify the background of the image based on the user's request. The main subject(s) in the foreground MUST remain completely unchanged and perfectly preserved.
User Request: "${adjustmentPrompt}"\n`;

    if (peopleToRemove && peopleToRemove.length > 0) {
        const locations = peopleToRemove.map(p => `{x: ${p.box.x}, y: ${p.box.y}, width: ${p.box.width}, height: ${p.box.height}}`).join(', ');
        prompt += `\nSpecial Instruction: The user has selected specific people to remove from the background. Their locations are: [${locations}]. Please remove them and fill in the background seamlessly and realistically.`
    }

    prompt += `
Editing Guidelines:
- Critically identify the main subject(s) and do not alter them in any way. This includes their pose, clothing, hair, and the lighting on them.
- The background change must be photorealistic and blend seamlessly with the foreground subject. Match the lighting, shadows, and perspective.

Output: Return ONLY the final adjusted image. Do not return text.`;

    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    return handleApiResponse(response, 'background change');
};

/**
 * Detects human faces in an image and returns their bounding boxes.
 * @param image The image file to process.
 * @returns A promise that resolves to an array of Face objects.
 */
export const detectFaces = async (image: File): Promise<Face[]> => {
    console.log('Starting face detection...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(image);
    const textPart = { text: "Detect all human faces in this image and provide their bounding box coordinates as integers. If no faces are found, return an empty array." };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    faces: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                box: {
                                    type: Type.OBJECT,
                                    properties: {
                                        x: { type: Type.INTEGER },
                                        y: { type: Type.INTEGER },
                                        width: { type: Type.INTEGER },
                                        height: { type: Type.INTEGER },
                                    },
                                    required: ["x", "y", "width", "height"],
                                },
                            },
                            required: ["box"],
                        },
                    },
                },
                required: ["faces"],
            },
        },
    });

    try {
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        console.log("Face detection result:", result);
        if (result && Array.isArray(result.faces)) {
            return result.faces.map((faceData: any, index: number) => ({
                id: index,
                box: faceData.box
            }));
        }
        return [];
    } catch (e) {
        console.error("Error parsing face detection JSON:", e);
        throw new Error("Could not parse face detection results from the model.");
    }
};

/**
 * Detects people in an image and returns their bounding boxes.
 * @param image The image file to process.
 * @returns A promise that resolves to an array of Person objects.
 */
export const detectPeople = async (image: File): Promise<Person[]> => {
    console.log('Starting person detection...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(image);
    const textPart = { text: "Detect all people in this image and provide their bounding box coordinates as integers. Each box should tightly contain one person. If no people are found, return an empty array." };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    people: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                box: {
                                    type: Type.OBJECT,
                                    properties: {
                                        x: { type: Type.INTEGER },
                                        y: { type: Type.INTEGER },
                                        width: { type: Type.INTEGER },
                                        height: { type: Type.INTEGER },
                                    },
                                    required: ["x", "y", "width", "height"],
                                },
                            },
                            required: ["box"],
                        },
                    },
                },
                required: ["people"],
            },
        },
    });

    try {
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        console.log("Person detection result:", result);
        if (result && Array.isArray(result.people)) {
            return result.people.map((personData: any, index: number) => ({
                id: index,
                box: personData.box
            }));
        }
        return [];
    } catch (e) {
        console.error("Error parsing person detection JSON:", e);
        throw new Error("Could not parse person detection results from the model.");
    }
};

/**
 * Analyzes an image and returns a list of creative editing suggestions.
 * @param image The image file to process.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export const generateSuggestions = async (image: File): Promise<string[]> => {
    console.log('Generating suggestions...');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const imagePart = await fileToPart(image);
    const textPart = { 
        text: "Analyze this photograph, paying close attention to the person in it. Suggest 4 creative photo edits. At least two of these suggestions must be focused on enhancing the person (e.g., portrait retouching, hair, or clothing adjustments). The other suggestions can be about the background, lighting, or overall style. Return the suggestions as a simple JSON array of strings. Example: [\"Soften the skin and enhance the eyes\", \"Change the hair color to a warm brown\", \"Apply a vintage film look to the whole image\", \"Blur the background to make the person stand out\"]" 
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                    description: "A single editing suggestion.",
                },
            },
        },
    });

    try {
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        console.log("Suggestion generation result:", result);
        if (Array.isArray(result)) {
            return result;
        }
        return [];
    } catch (e) {
        console.error("Error parsing suggestions JSON:", e);
        throw new Error("Could not parse suggestions from the model.");
    }
};