import React, { useState, useEffect, useCallback } from 'react'; import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth'; import { initializeApp } from 'firebase/app'; import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import Navbar from './components/Navbar'; import HomeView from './components/HomeView'; import WorkView from './components/WorkView'; import { i18n } from './i18n'; import { getProjectPath } from './firebase';

// --- वैश्विक फायरबेस कॉन्फ़िगरेशन --- const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {}; const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase App const app = initializeApp(firebaseConfig); const db = getFirestore(app); const auth = getAuth(app);

export default function App() { const [currentPage, setCurrentPage] = useState({ name: 'home' }); const [theme, setTheme] = useState('light'); const [lang, setLang] = useState('hi'); const [projects, setProjects] = useState([]); const [userId, setUserId] = useState(null); const [isAuthReady, setIsAuthReady] = useState(false);

const t = (key) => i18n[lang][key] || i18n['en'][key];

// --- Firebase Auth और Firestore Setup ---
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) setUserId(user.uid);
        else await signInAnonymously(auth);
        setIsAuthReady(true);
    });

    if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken).catch(() => signInAnonymously(auth));
    } else if (!auth.currentUser) {
        signInAnonymously(auth);
    }
    return () => unsubscribe();
}, []);

useEffect(() => {
    if (!isAuthReady || !userId) return;
    const projectsRef = getProjectPath(userId);
    if (!projectsRef) return;
    const q = query(projectsRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(projectsData);
    });
    return () => unsubscribe();
}, [isAuthReady, userId]);

useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50';
}, [theme]);

const handleSaveProject = useCallback(async (projectData) => {
    if (!userId) return;
    const projectRef = doc(getProjectPath(userId), projectData.id);
    await setDoc(projectRef, { ...projectData, date: serverTimestamp() }, { merge: true });
}, [userId]);

const handleDeleteProject = useCallback(async (projectId) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    if (!userId) return;
    const projectRef = doc(getProjectPath(userId), projectId);
    await deleteDoc(projectRef);
}, [userId, t]);

let content;
const viewKey = currentPage.name + (currentPage.project ? currentPage.project.id : '');
switch (currentPage.name) {
    case 'work':
        content = <WorkView key={viewKey} t={t} currentProject={currentPage.project} setCurrentPage={setCurrentPage} userId={userId} onSaveProject={handleSaveProject} />;
        break;
    case 'home':
    default:
        content = <HomeView key={viewKey} t={t} projects={projects} setCurrentPage={setCurrentPage} userId={userId} isAuthReady={isAuthReady} onDeleteProject={handleDeleteProject} />;
}

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} t={t} isAuthReady={isAuthReady} userId={userId} />
        <main className="max-w-7xl mx-auto pb-20">{content}</main>
    </div>
);

                                                                                                                                                                                }
