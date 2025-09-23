// Vercel Serverless Function to securely call the Gemini API
// This file should be placed in the /api directory of your project.

// FIX: Import GoogleGenAI and other necessary types from the SDK.
import { GoogleGenAI, Modality, Part } from "@google/genai";

// The VercelRequest and VercelResponse types are available globally in Vercel's environment.
// We don't need to import them, avoiding the need for a package.json.
// For local development, you might install `@vercel/node`.

/**
 * Extracts base64 data and mime type from a data URL.
 * @param {string} dataUrl - The full data URL (e.g., "data:image/png;base64,iVBORw0KGgo...")
 * @returns {{mimeType: string, base64Data: string}}
 */
const getBase64Details = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid base64 data URL');
    }
    const mimeType = parts[0].split(':')[1].split(';')[0];
    const base64Data = parts[1];
    return { mimeType, base64Data };
};

export default async function handler(request: any, response: any) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).end('Method Not Allowed');
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: 'API_KEY is not configured on the server.' });
    }

    try {
        const { base64FurnitureImage, prompt, base64ReferenceImage } = request.body;

        if (!base64FurnitureImage || !prompt) {
            return response.status(400).json({ error: 'Missing required parameters: base64FurnitureImage and prompt.' });
        }
        
        // FIX: Use the @google/genai SDK to interact with the Gemini API as per guidelines.
        const ai = new GoogleGenAI({ apiKey });

        const furnitureDetails = getBase64Details(base64FurnitureImage);

        // FIX: Correctly type the contentParts array to allow for both image and text parts, resolving the original TypeScript error.
        const contentParts: Part[] = [
            {
                inlineData: {
                    mimeType: furnitureDetails.mimeType,
                    data: furnitureDetails.base64Data,
                },
            },
        ];

        if (base64ReferenceImage) {
            const referenceDetails = getBase64Details(base64ReferenceImage);
            contentParts.push({
                inlineData: {
                    mimeType: referenceDetails.mimeType,
                    data: referenceDetails.base64Data,
                },
            });
        }

        contentParts.push({ text: prompt });

        // FIX: Use the SDK's generateContent method instead of a manual fetch call.
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: contentParts },
            config: {
                // FIX: Add responseModalities config as required for image editing.
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = result.candidates?.[0]?.content.parts.find((part) => part.inlineData);

        if (imagePart?.inlineData) {
            const mimeType = imagePart.inlineData.mimeType;
            const base64Data = imagePart.inlineData.data;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            return response.status(200).json({ generatedImage: dataUrl });
        } else {
            // FIX: Log the full response from Gemini for better debugging.
            console.error("No image part in Gemini response:", JSON.stringify(result, null, 2));
            throw new Error('API response did not contain a valid image.');
        }

    } catch (error) {
        console.error('Error in /api/generate handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return response.status(500).json({ error: errorMessage });
    }
}
