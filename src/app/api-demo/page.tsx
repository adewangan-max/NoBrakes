"use client";
import React, { useState, useEffect } from 'react';

type Tab = 'posts' | 'users' | 'comments';

export default function ApiDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Fetch data based on the currently active tab
    fetch(`https://jsonplaceholder.typicode.com/${activeTab}`)
      .then(res => res.json())
      .then(json => {
        // Limit to 12 items for a clean grid layout
        setData(json.slice(0, 12));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch API data", err);
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">API Data Explorer</h1>
        <p className="text-zinc-500 mt-2">Fetching live data from JSONPlaceholder API</p>
      </div>

      {/* Header Tabs */}
      <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto">
        {(['posts', 'users', 'comments'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize transition-colors whitespace-nowrap ${activeTab === tab
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Content Grid */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((item: any) => (
              <div
                key={item.id}
                className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:shadow-md transition-shadow"
              >
                {activeTab === 'posts' && (
                  <>
                    <h3 className="font-bold text-lg mb-3 capitalize line-clamp-1 dark:text-zinc-100">{item.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-4 leading-relaxed">{item.body}</p>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                        {item.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-md dark:text-zinc-100">{item.name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-500 text-xs">@{item.username}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-600 dark:text-zinc-400">📧 {item.email}</p>
                      <p className="text-zinc-600 dark:text-zinc-400">🏢 {item.company?.name}</p>
                      <p className="text-zinc-600 dark:text-zinc-400">📍 {item.address?.city}</p>
                    </div>
                  </>
                )}
                {activeTab === 'comments' && (
                  <>
                    <h3 className="font-bold text-sm mb-1 truncate dark:text-zinc-100">{item.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs mb-3 truncate font-medium">{item.email}</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">"{item.body}"</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
