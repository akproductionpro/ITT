import React, { useState } from "react";

export default function WorkView({ t, setCurrentPage, project, onSaveProject }) { const [title, setTitle] = useState(project?.title || ""); const [content, setContent] = useState(project?.content || "");

const handleSave = () => { onSaveProject({ ...project, title, content }); };

return ( <div className="p-6"> <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{t('work')}</h2>

{/* Title Input */}
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="शीर्षक लिखें"
    className="w-full p-2 mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
  />

  {/* Content Box */}
  <textarea
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="कंटेंट लिखें"
    rows="10"
    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
  />

  <div className="flex gap-4 mt-4">
    <button
      onClick={handleSave}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      सेव
    </button>

    <button
      onClick={() => setCurrentPage({ name: 'home' })}
      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
    >
      वापस
    </button>
  </div>
</div>

); }
