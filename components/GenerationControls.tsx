import React, { useState } from 'react';
import type { SpaceOption, StyleOption } from '../types';
import { GenerationMethod } from '../types';
import { ImageUploader } from './ImageUploader';
import { PencilSquareIcon, PhotoIcon, PaintBrushIcon, CubeIcon, MinusCircleIcon } from './icons';

const spaceOptions: SpaceOption[] = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor Patio', 'Kitchen'];
const styleOptions: StyleOption[] = ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Bohemian', 'Coastal', 'Farmhouse', 'Japandi', 'Mediterranean', 'Art Deco', 'Mid-Century Modern', 'French Country', 'Rustic'];

const translations: { [key in SpaceOption | StyleOption]: string } = {
    'Living Room': '客廳',
    'Bedroom': '臥室',
    'Dining Room': '餐廳',
    'Office': '辦公室',
    'Outdoor Patio': '戶外庭院',
    'Kitchen': '廚房',
    'Modern': '現代風',
    'Minimalist': '極簡風',
    'Scandinavian': '北歐風',
    'Industrial': '工業風',
    'Bohemian': '波希米亞風',
    'Coastal': '海岸風',
    'Farmhouse': '農舍風',
    'Japandi': '日式禪風',
    'Mediterranean': '地中海風',
    'Art Deco': '裝飾藝術風',
    'Mid-Century Modern': '世紀中期現代風',
    'French Country': '法式鄉村風',
    'Rustic': '鄉村風',
};

interface GenerationControlsProps {
    generationMethod: GenerationMethod;
    setGenerationMethod: (method: GenerationMethod) => void;
    spaceOption: SpaceOption;
    setSpaceOption: (option: SpaceOption) => void;
    styleOption: StyleOption;
    setStyleOption: (option: StyleOption) => void;
    customPrompt: string;
    setCustomPrompt: (prompt: string) => void;
    onReferenceImageUpload: (base64: string) => void;
    onDecorationImageUpload: (base64: string) => void;
    onMaskImageUpload: (base64: string) => void;
}

const MethodButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ active, onClick, icon, title, description }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
      active ? 'bg-indigo-900/30 border-indigo-500 shadow-lg' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700'
    }`}
  >
    <div className={`mr-4 p-2 rounded-md transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-600'}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-100">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </button>
);


export const GenerationControls: React.FC<GenerationControlsProps> = ({
    generationMethod, setGenerationMethod, spaceOption, setSpaceOption, styleOption, setStyleOption, customPrompt, setCustomPrompt, onReferenceImageUpload, onDecorationImageUpload, onMaskImageUpload
}) => {
    const [removalMode, setRemovalMode] = useState<'text' | 'mask'>('text');

    return (
        <div>
            <div className="space-y-3 mb-6">
                <MethodButton
                    active={generationMethod === GenerationMethod.RemoveObject}
                    onClick={() => setGenerationMethod(GenerationMethod.RemoveObject)}
                    icon={<MinusCircleIcon className="w-6 h-6 text-white" />}
                    title="移除物件"
                    description="移除圖片中的物件並填補背景"
                />
                <MethodButton
                    active={generationMethod === GenerationMethod.Reference}
                    onClick={() => setGenerationMethod(GenerationMethod.Reference)}
                    icon={<PhotoIcon className="w-6 h-6 text-white" />}
                    title="使用參考圖片"
                    description="上傳圖片作為風格參考"
                />
                <MethodButton
                    active={generationMethod === GenerationMethod.AddDecoration}
                    onClick={() => setGenerationMethod(GenerationMethod.AddDecoration)}
                    icon={<CubeIcon className="w-6 h-6 text-white" />}
                    title="新增裝飾品"
                    description="將裝飾品放置到現有場景中"
                />
                <MethodButton
                    active={generationMethod === GenerationMethod.Edit}
                    onClick={() => setGenerationMethod(GenerationMethod.Edit)}
                    icon={<PaintBrushIcon className="w-6 h-6 text-white" />}
                    title="編輯空間"
                    description="透過文字指令修改現有空間"
                />
                <MethodButton
                    active={generationMethod === GenerationMethod.Describe}
                    onClick={() => setGenerationMethod(GenerationMethod.Describe)}
                    icon={<PencilSquareIcon className="w-6 h-6 text-white" />}
                    title="描述空間"
                    description="透過文字描述您想要的風格"
                />
            </div>

            {generationMethod === GenerationMethod.Describe ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="space" className="block text-sm font-medium text-gray-300">空間類型</label>
                        <select id="space" value={spaceOption} onChange={e => setSpaceOption(e.target.value as SpaceOption)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {spaceOptions.map(o => <option key={o} value={o}>{translations[o]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style" className="block text-sm font-medium text-gray-300">風格</label>
                        <select id="style" value={styleOption} onChange={e => setStyleOption(e.target.value as StyleOption)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {styleOptions.map(o => <option key={o} value={o}>{translations[o]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="custom" className="block text-sm font-medium text-gray-300">或自行描述 (選填)</label>
                        <input
                            type="text"
                            id="custom"
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            placeholder="例如：有壁爐的溫馨小木屋"
                            className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500"
                        />
                    </div>
                </div>
            ) : generationMethod === GenerationMethod.Reference ? (
                <div>
                     <p className="text-sm text-gray-400 mb-3">上傳一張您喜歡的空間圖片作為風格、光線和氛圍的參考。</p>
                     <ImageUploader onImageUpload={onReferenceImageUpload} />
                </div>
            ) : generationMethod === GenerationMethod.AddDecoration ? (
                <div>
                     <p className="text-sm text-gray-400 mb-3">上傳一件有白色或素色背景的裝飾品圖片。</p>
                     <ImageUploader onImageUpload={onDecorationImageUpload} />
                </div>
            ) : generationMethod === GenerationMethod.Edit ? (
                 <div>
                    <label htmlFor="custom-edit" className="block text-sm font-medium text-gray-300">您想如何修改？</label>
                    <input
                        type="text"
                        id="custom-edit"
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        placeholder="例如：將地毯換成美式風格地毯"
                        className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500"
                    />
                </div>
            ) : generationMethod === GenerationMethod.RemoveObject ? (
                <div>
                    <div className="flex border border-gray-600 rounded-lg p-1 mb-4 bg-gray-900">
                        <button 
                            onClick={() => setRemovalMode('text')}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${removalMode === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            用文字描述
                        </button>
                        <button
                            onClick={() => setRemovalMode('mask')}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${removalMode === 'mask' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            用遮罩圖片
                        </button>
                    </div>

                    {removalMode === 'text' ? (
                        <div>
                            <label htmlFor="custom-remove" className="block text-sm font-medium text-gray-300">您想移除什麼物件？</label>
                            <input
                                type="text"
                                id="custom-remove"
                                value={customPrompt}
                                onChange={e => setCustomPrompt(e.target.value)}
                                placeholder="例如：圖片中央的桌子"
                                className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500"
                            />
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-400 mb-3">上傳一張遮罩圖片。圖片中白色部分將被移除並填補。</p>
                            <ImageUploader onImageUpload={onMaskImageUpload} />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}