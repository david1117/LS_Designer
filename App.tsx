import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GenerationControls } from './components/GenerationControls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { generateBackgrounds } from './services/geminiService';
import type { SpaceOption, StyleOption } from './types';
import { GenerationMethod } from './types';

export default function App() {
  const [furnitureImage, setFurnitureImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [decorationImage, setDecorationImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [generationMethod, setGenerationMethod] = useState<GenerationMethod>(GenerationMethod.RemoveObject);
  
  const [spaceOption, setSpaceOption] = useState<SpaceOption>('Living Room');
  const [styleOption, setStyleOption] = useState<StyleOption>('Modern');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!furnitureImage) {
      setError('請先上傳主要圖片。');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    let prompt = '';
    let secondImage: string | null = null;
    
    if (generationMethod === GenerationMethod.Edit) {
        if (!customPrompt) {
            setError('請輸入您想如何修改空間的指令。');
            setIsLoading(false);
            return;
        }
        prompt = `根據以下指令修改提供的圖片：'${customPrompt}'。在修改時，請務必保持整個場景光源的一致性。任何新增或改變的物件，其光照和陰影都必須與原圖的光線環境完美匹配，並呈現柔和、自然的質感，以維持照片的真實感。`;
    } else if (generationMethod === GenerationMethod.Describe) {
        const description = customPrompt || `${styleOption}風格的${spaceOption}`;
        prompt = `生成一個符合以下描述的逼真室內空間：'${description}'。這個空間必須有清晰、合乎邏輯的光源，且光影效果應偏向柔和自然。然後，將上傳的家具無縫地整合到這個空間中。最關鍵的一步是：精確地調整家具的光照和陰影，使其完全匹配你所創造的柔和場景光源，達到照片般真實的效果。`;
    } else if (generationMethod === GenerationMethod.Reference) {
        if (!referenceImage) {
            setError('此生成方式請上傳參考圖片。');
            setIsLoading(false);
            return;
        }
        secondImage = referenceImage;
        prompt = `分析參考圖片的整體風格、氛圍和光線條件。基於此分析，創造一個新的、風格一致的空間。然後，將上傳的家具放置到這個新空間中。最關鍵的一步是：完全複製參考圖片中的光源特性（方向、色溫、柔和度），並將其應用於家具上，調整其光照和陰影，使其呈現柔和、自然的質感，以實現無縫、逼真的整合。`;
    } else if (generationMethod === GenerationMethod.AddDecoration) {
        if (!decorationImage) {
            setError('此生成方式請上傳裝飾品圖片。');
            setIsLoading(false);
            return;
        }
        secondImage = decorationImage;
        prompt = `將第二張圖片（有白色背景的裝飾品）自然地放置到第一張圖片（場景）中的合適平面上（例如桌子、架子）。請務必移除裝飾品的白色背景，並根據場景的光源，為裝飾品添加準確、柔和的光照和陰影，使其完美融入場景中，達到照片般真實的效果。`;
    } else if (generationMethod === GenerationMethod.RemoveObject) {
        if (customPrompt.trim()) {
            prompt = `從提供的圖片中移除 '${customPrompt}'，並以符合周圍環境的方式真實地填補被移除的區域。`;
        } else if (maskImage) {
            secondImage = maskImage;
            prompt = `第二張圖片是一張遮罩。請從第一張圖片中移除遮罩所標示的區域（白色部分），並以符合周圍環境的方式真實地填補該區域，確保填補後的紋理、光線和陰影與背景無縫融合。`;
        } else {
            setError('請描述要移除的物件，或上傳一張遮罩圖片。');
            setIsLoading(false);
            return;
        }
    }

    try {
      const newImage = await generateBackgrounds(
        furnitureImage,
        prompt,
        secondImage
      );
      setGeneratedImages(prevImages => [newImage, ...prevImages]);
       if (generationMethod === GenerationMethod.Edit || 
           (generationMethod === GenerationMethod.RemoveObject && customPrompt.trim())) {
            setCustomPrompt('');
       }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('發生未知錯誤。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [furnitureImage, referenceImage, decorationImage, maskImage, generationMethod, spaceOption, styleOption, customPrompt]);

  const isGenerateEnabled = !isLoading && !!furnitureImage && 
      (generationMethod === GenerationMethod.Describe || 
      (generationMethod === GenerationMethod.Reference && !!referenceImage) ||
      (generationMethod === GenerationMethod.Edit && !!customPrompt.trim()) ||
      (generationMethod === GenerationMethod.AddDecoration && !!decorationImage) ||
      (generationMethod === GenerationMethod.RemoveObject && (!!customPrompt.trim() || !!maskImage)));

  const getStep1Description = () => {
    switch (generationMethod) {
        case GenerationMethod.AddDecoration:
            return '上傳一張您想要加入裝飾品的空間照片。';
        case GenerationMethod.Edit:
            return '上傳一張您想要編輯的空間照片。';
        case GenerationMethod.RemoveObject:
            return '上傳一張您想要移除物件的空間照片。';
        case GenerationMethod.Reference:
        case GenerationMethod.Describe:
        default:
            return '為獲得最佳效果，請使用素色或白色背景的照片。';
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">1</span>
                  <h2 className="text-xl font-bold text-gray-100">上傳照片</h2>
                </div>
                <div className="pl-11">
                  <p className="text-sm text-gray-400 mb-3">{getStep1Description()}</p>
                  <ImageUploader onImageUpload={setFurnitureImage} />
                </div>
              </div>

              <hr className="border-gray-700" />

              {/* Step 2 */}
              <div className={`space-y-3 transition-opacity duration-500 ${!furnitureImage ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex items-center space-x-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white transition-colors ${furnitureImage ? 'bg-indigo-600' : 'bg-gray-600'}`}>2</span>
                      <h2 className="text-xl font-bold text-gray-100">選擇生成方式</h2>
                  </div>
                  <div className="pl-11">
                    <GenerationControls 
                      generationMethod={generationMethod}
                      setGenerationMethod={setGenerationMethod}
                      spaceOption={spaceOption}
                      setSpaceOption={setSpaceOption}
                      styleOption={styleOption}
                      setStyleOption={setStyleOption}
                      customPrompt={customPrompt}
                      setCustomPrompt={setCustomPrompt}
                      onReferenceImageUpload={setReferenceImage}
                      onDecorationImageUpload={setDecorationImage}
                      onMaskImageUpload={setMaskImage}
                    />
                  </div>
              </div>

              <hr className="border-gray-700" />

              {/* Step 3 */}
               <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white transition-colors ${isGenerateEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}>3</span>
                      <h2 className="text-xl font-bold text-gray-100">生成空間</h2>
                  </div>
                  <div className="pl-11">
                    <button
                      onClick={handleGenerate}
                      disabled={!isGenerateEnabled}
                      className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          生成中...
                        </>
                      ) : (
                        '生成空間'
                      )}
                    </button>
                  </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            <ResultsDisplay 
              isLoading={isLoading}
              error={error}
              generatedImages={generatedImages}
            />
          </div>
        </div>
      </main>
    </div>
  );
}