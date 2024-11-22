import React, {useEffect, useState} from 'react';
import {X, CheckCircle} from 'lucide-react';
import './AnkiModal.css';

// @ts-ignore
const AnkiModal = ({c, onClose, handleSave}) => {
    const [content, setContent] = useState(c);
    const [isValidJson, setIsValidJson] = useState(true);

    useEffect(() => {
        handleChange(c);
    }, []);

    const handleChange = (value: string) => {
        setContent(value);
        try {
            JSON.parse(value);
            setIsValidJson(true);
        } catch (error) {
            setIsValidJson(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 ">
            <div
                className="bg-white dark:bg-gray-800  p-4 w-full h-full max-w-xl shadow-2xl border-gray-200 dark:border-gray-700">
                <textarea
                    className={`w-1/2 h-1/2 border font-mono textarea-text
                         'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'
                        focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200`}
                    value={content}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="Enter valid JSON for Anki cards"
                    spellCheck="false"
                />

                {/*TODO 右侧是一个json解析后的展示*/}

                <div className="flex justify-end space-x-1">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center transition-colors duration-200"
                    >
                        <X className="mr-1 h-3 w-3"/> Cancel
                    </button>

                    <button
                        onClick={() => handleSave(content)}
                        disabled={!isValidJson}
                        className={`px-3 py-1 text-sm rounded-md flex items-center transition-colors duration-200 
                            ${isValidJson
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        <CheckCircle className="mr-1 h-3 w-3"/> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnkiModal;
