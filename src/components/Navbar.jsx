import React from "react";

export default function Navbar({ theme, setTheme, lang, setLang, t, isAuthReady, userId }) { return ( <nav className="w-full bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center"> <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('appName')}</h1>

<div className="flex items-center gap-4">
    {/* Language Switch */}
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    >
      <option value="hi">Hindi</option>
      <option value="en">English</option>
    </select>

    {/* Theme Switch */}
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  </div>
</nav>

); }
