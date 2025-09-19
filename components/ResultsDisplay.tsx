import React from 'react';
import { PhotoIcon, DownloadIcon } from './icons';

interface ResultsDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImages: string[];
}

const LoadingSkeleton: React.FC = () => (
  <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
);

const handleDownload = (base64Image: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `generated-room-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, error, generatedImages }) => {
  const latestImage = generatedImages[0];
  const historyImages = generatedImages.slice(1);

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[300px] flex flex-col justify-center items-center">
      {isLoading && <LoadingSkeleton />}

      {!isLoading && error && (
        <div className="text-center text-red-400">
          <h3 className="font-semibold">生成失敗</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && generatedImages.length > 0 && (
        <div className="w-full space-y-8">
          <div>
             <h3 className="text-lg font-semibold text-gray-100 mb-3">最新生成</h3>
            <div className="aspect-square rounded-lg overflow-hidden shadow-md group relative">
              <img src={latestImage} alt={`最新生成的空間`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
               <button 
                onClick={() => handleDownload(latestImage, 0)}
                className="absolute top-3 right-3 p-2 bg-gray-900/70 backdrop-blur-sm rounded-full text-gray-100 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="下載圖片"
               >
                <DownloadIcon className="w-5 h-5" />
               </button>
            </div>
          </div>
          {historyImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">歷史紀錄</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {historyImages.map((src, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-sm group relative">
                     <img src={src} alt={`生成的空間歷史紀錄 ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                     <button 
                        onClick={() => handleDownload(src, index + 1)}
                        className="absolute top-2 right-2 p-2 bg-gray-900/70 backdrop-blur-sm rounded-full text-gray-100 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="下載圖片"
                     >
                        <DownloadIcon className="w-4 h-4" />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && generatedImages.length === 0 && (
        <div className="text-center text-gray-500">
          <PhotoIcon className="w-16 h-16 mx-auto text-gray-600" />
          <h3 className="mt-2 text-lg font-semibold">您生成的空間</h3>
          <p className="mt-1 text-sm">您用 AI 設計的空間將會顯示在這裡。</p>
        </div>
      )}
    </div>
  );
};