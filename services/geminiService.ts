import { GoogleGenAI, Modality, type Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = (base64Data: string, mimeType: string): Part => {
    return {
        inlineData: {
            data: base64Data.split(',')[1],
            mimeType,
        },
    };
};

const getMimeType = (base64Data: string): string => {
    return base64Data.split(';')[0].split(':')[1];
}

export const generateBackgrounds = async (
    base64FurnitureImage: string,
    prompt: string,
    base64ReferenceImage: string | null
): Promise<string> => {
    const furnitureMimeType = getMimeType(base64FurnitureImage);

    const contentParts: Part[] = [
        fileToPart(base64FurnitureImage, furnitureMimeType),
    ];

    if (base64ReferenceImage) {
        const referenceMimeType = getMimeType(base64ReferenceImage);
        contentParts.push(fileToPart(base64ReferenceImage, referenceMimeType));
    }
    
    contentParts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const mimeType = imagePart.inlineData.mimeType;
            const base64Data = imagePart.inlineData.data;
            return `data:${mimeType};base64,${base64Data}`;
        }
        throw new Error("API 回應中未包含有效圖片。");
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        throw new Error("背景生成失敗。模型可能無法處理此請求。");
    }
};