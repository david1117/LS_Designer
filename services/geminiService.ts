export const generateBackgrounds = async (
    base64FurnitureImage: string,
    prompt: string,
    base64ReferenceImage: string | null
): Promise<string> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            base64FurnitureImage,
            prompt,
            base64ReferenceImage,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        // The server provides a clear error message in the `error` field.
        // Let's propagate that message to the UI.
        const errorMessage = result.error || `An unknown error occurred on the server (status: ${response.status}).`;
        
        // This specific error message is what the UI currently shows.
        if (errorMessage.includes('API_KEY is not configured')) {
            throw new Error("API_KEY environment variable is not set. Please configure it in your deployment environment.");
        }
        
        throw new Error(errorMessage);
    }
    
    if (result.generatedImage) {
        return result.generatedImage;
    }

    // This case should ideally not happen if the server-side logic is correct.
    throw new Error("API response did not contain the expected image data.");
};
