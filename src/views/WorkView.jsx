import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// --- AI API कॉन्फ़िगरेशन ---
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
const apiKey = "gen-lang-client-0369718699"; // आपकी API key यहाँ डालें

// --- Base64 Conversion --- 
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

export default function WorkView({ t, currentProject, setCurrentPage, userId, onSaveProject }) {
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [imageMimeType, setImageMimeType] = useState(null);
    const [output, setOutput] = useState(currentProject?.extractedText || '');
    const [command, setCommand] = useState(currentProject?.prompt || '');
    const [projectTitle, setProjectTitle] = useState(currentProject?.title || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (currentProject) {
            setOutput(currentProject.extractedText);
            setCommand(currentProject.prompt);
            setProjectTitle(currentProject.title);
        }
    }, [currentProject]);

    // --- इमेज अपलोड हैंडलर ---
    const handleImageUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            setError(t('fileError'));
            setImageBase64(null);
            setImageFile(null);
            return;
        }
        setError(null);
        setImageFile(file);
        setImageMimeType(file.type);
        try {
            const base64Data = await toBase64(file);
            setImageBase64(base64Data);
        } catch (e) {
            console.error("Base64 conversion failed", e);
            setError("इमेज को प्रोसेस करने में त्रुटि।");
        }
    }, [t]);

    // --- AI Analysis ---
    const generateAnalysis = useCallback(async () => {
        if (!imageBase64) {
            setError(t('fileError'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);
        setOutput(t('analyzing'));

        const safeCommand = command.trim() ? ` Additional Command: ${command.trim()}` : '';
        const fullPrompt = `${t('defaultPrompt')}${safeCommand}`;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: fullPrompt },
                        {
                            inlineData: {
                                mimeType: imageMimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: { temperature: 0.2 }
        };

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            let response;
            for (let attempt = 0; attempt < 5; attempt++) {
                response = await fetch(`${API_URL}?key=${apiKey}`, options);
                if (response.status === 429 || response.status >= 500) {
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(errorBody.error?.message || `API call failed with status ${response.status}`);
                }
                break;
            }

            const result = await response.json();
            const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (generatedText) {
                const cleanedText = generatedText.replace(/^\s*\*\*\*|\*\*\*\s*$/g, '').trim();
                setOutput(cleanedText);
                await onSaveProject({
                    id: currentProject?.id || doc(collection(db, 'artifacts', userId, 'projects')).id,
                    title: projectTitle,
                    extractedText: cleanedText,
                    prompt: command,
                });
                setMessage(t('saveSuccess'));
            } else {
                setError("AI से कोई टेक्स्ट उत्पन्न नहीं हुआ।");
                setOutput('');
            }

        } catch (err) {
            console.error("Analysis Error:", err);
            setError(`${t('error')}: ${err.message || 'नेटवर्क या API त्रुटि'}`);
            setOutput('');
        } finally {
            setIsLoading(false);
        }
    }, [imageBase64, imageMimeType, command, t, onSaveProject, currentProject, projectTitle, userId]);

    // --- Copy Text ---
    const copyText = () => {
        if (!output) return;
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = output;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.left = '-9999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        let success = false;
        try { success = document.execCommand('copy'); } catch (err) { console.error(err); }
        document.body.removeChild(tempTextArea);
        if (success) setMessage(t('copySuccess')); else setError(t('copyFailure'));
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setCurrentPage({ name: 'home' })} className="p-3 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition flex items-center">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('newProjectButton')}</h2>
                <div className="w-8"></div>
            </div>

            <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder={t('title')} className="p-3 border rounded-lg w-full mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <label className="flex flex-col items-center justify-center p-8 bg-indigo-50/50 dark:bg-gray-700/50 border-2 border-dashed rounded-xl cursor-pointer h-40">
                        <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} />
                        {imageFile ? <span>✅ {imageFile.name} (Uploaded)</span> : <span>{t('uploadPrompt')}</span>}
                    </label>

                    <textarea rows="4" value={command} onChange={(e) => setCommand(e.target.value)} placeholder={t('commandBoxPlaceholder')} className="p-3 border rounded-lg w-full"></textarea>

                    <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl border flex items-center justify-center overflow-hidden">
                        {imageBase64 ? <img src={`data:${imageMimeType};base64,${imageBase64}`} alt="Preview" className="max-h-full w-auto object-contain" /> : <span>{t('imagePreview')}</span>}
                    </div>
                </div>

                <div className="space-y-6">
                    <button onClick={generateAnalysis} disabled={isLoading || !imageBase64} className="w-full py-3 bg-indigo-600 text-white rounded-xl">{isLoading ? t('analyzing') : t('extractTextButton')}</button>

                    {(error || message) && <div className={`p-3 rounded-lg text-sm ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{error || message}</div>}

                    <textarea rows="15" value={output} readOnly className="p-3 border rounded-lg w-full h-96 resize-none" />
                    <button onClick={copyText} className="w-full py-2 bg-gray-200 rounded-lg">{t('copyButton')}</button>
                </div>
            </div>
        </div>
    );
                                                       }
