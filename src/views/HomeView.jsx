import React from "react";

export default function HomeView({ t, projects, setCurrentPage, userId, isAuthReady, onDeleteProject }) { return ( <div className="p-6"> <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{t('appName')}</h2>

{/* Create New Project Button */}
  <button
    onClick={() => setCurrentPage({ name: 'work', project: null })}
    className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
  >
    + नया प्रोजेक्ट
  </button>

  {/* Projects List */}
  <div className="grid gap-4">
    {projects.length === 0 && (
      <p className="text-gray-600 dark:text-gray-400">कोई प्रोजेक्ट नहीं मिला।</p>
    )}

    {projects.map((p) => (
      <div
        key={p.id}
        className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow flex justify-between items-center"
      >
        <div onClick={() => setCurrentPage({ name: 'work', project: p })} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{p.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{p.date?.toDate?.().toLocaleString?.() || ''}</p>
        </div>

        <button
          onClick={() => onDeleteProject(p.id)}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          डिलीट
        </button>
      </div>
    ))}
  </div>
</div>

); }
