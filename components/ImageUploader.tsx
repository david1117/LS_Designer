import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (base64: string) => void;
  title?: string;
  description?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, description }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {imagePreview ? (
        <div>
          <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-md shadow-sm" />
          <button onClick={onButtonClick} className="mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300">
            更換圖片
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer" onClick={onButtonClick}>
          <UploadIcon className="w-10 h-10 text-gray-500" />
          <p className="text-sm font-semibold text-gray-300">
            {title || "點擊上傳或拖放檔案"}
          </p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      )}
    </div>
  );
};