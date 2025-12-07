import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Video, AppWindow, MessageSquare, Monitor, ChevronRight, ChevronDown, FileText, Youtube, Code, Globe, Folder } from 'lucide-react';
import { courseData } from './data/courseData';

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTopic, setActiveTopic] = useState(courseData[0].topics[0]);
  const [activeTab, setActiveTab] = useState('notes');
  const [expandedModules, setExpandedModules] = useState({});

  // Initialize expanded state for all modules
  useEffect(() => {
    const initialExpandedModules = {};
    courseData.forEach((module, mIdx) => {
      initialExpandedModules[mIdx] = true;
    });
    setExpandedModules(initialExpandedModules);
  }, []);

  const toggleModule = (idx) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper to normalize content into an array
  const getContentArray = (content) => {
    if (!content) return [];
    return Array.isArray(content) ? content : [content];
  };

  // Generate tabs dynamically based on the active topic
  const getTabsForTopic = (topic) => {
    const types = [
      { id: 'notes', label: 'Notes', icon: BookOpen, data: topic.notes },
      { id: 'video', label: 'Video', icon: Video, data: topic.video },
      { id: 'app', label: 'App', icon: AppWindow, data: topic.app },
      { id: 'chat', label: 'Chat', icon: MessageSquare, data: topic.chat },
    ];

    let tabs = [];
    types.forEach(type => {
      const contents = getContentArray(type.data);
      if (contents.length === 0) {
        tabs.push({ ...type, disabled: true });
      } else if (contents.length === 1) {
        tabs.push({ ...type, url: contents[0] });
      } else {
        contents.forEach((url, idx) => {
          tabs.push({
            id: `${type.id}-${idx}`,
            label: `${type.label} ${idx + 1}`,
            icon: type.icon,
            url: url
          });
        });
      }
    });
    return tabs;
  };

  const currentTabs = getTabsForTopic(activeTopic);

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
    const newTabs = getTabsForTopic(topic);

    // Check if the exact active tab exists in the new topic
    const activeTabExists = newTabs.find(t => t.id === activeTab);
    if (activeTabExists && !activeTabExists.disabled) {
      return; // Stay on current tab
    }

    // Try to switch to a tab of the same type (e.g., 'app-1' -> 'app' or 'app-0')
    const currentType = activeTab.split('-')[0];
    const sameTypeTab = newTabs.find(t => t.id.startsWith(currentType) && !t.disabled);
    if (sameTypeTab) {
      setActiveTab(sameTypeTab.id);
      return;
    }

    // Fallback to the first available tab
    const firstAvailable = newTabs.find(t => !t.disabled);
    if (firstAvailable) {
      setActiveTab(firstAvailable.id);
    } else {
      setActiveTab('notes'); // Default fallback
    }
  };

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = Math.max(150, Math.min(mouseMoveEvent.clientX, 600));
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Get active content URL and type
  const activeTabObj = currentTabs.find(t => t.id === activeTab);
  const activeUrl = activeTabObj ? activeTabObj.url : null;
  const activeType = activeTab.split('-')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* LEFT PANEL: Content Selector */}
      <div style={{
        width: `${sidebarWidth}px`,
        height: '100%',
        backgroundColor: '#f8f9fa', // Lighter gray for better contrast
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #e5e7eb' // gray-200
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '14px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#1f2937', // gray-800
          backgroundColor: '#ffffff'
        }}>
          Course Explorer
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {courseData.map((module, moduleIdx) => (
            <div key={moduleIdx} className="mb-8 pb-4 border-b-2 border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
              <button
                onClick={() => toggleModule(moduleIdx)}
                className="w-full flex items-center py-3 text-lg font-black text-gray-900 hover:text-blue-700 transition-colors text-left uppercase tracking-wide"
                style={{ outline: 'none' }}
              >
                {expandedModules[moduleIdx] ? <ChevronDown size={20} className="mr-1 text-gray-800" /> : <ChevronRight size={20} className="mr-1 text-gray-800" />}
                <Folder size={20} className="mr-2 text-gray-800 fill-gray-200" />
                {module.title}
              </button>

              {expandedModules[moduleIdx] && (
                <div className="mt-3 space-y-1">
                  {module.topics.map((topic, topicIdx) => {
                    const isActive = activeTopic === topic;
                    return (
                      <div key={topicIdx} className="ml-4"> {/* Indent Topics */}
                        <button
                          onClick={() => handleTopicClick(topic)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 rounded-l-md border-r-4 ${isActive
                            ? 'bg-blue-50 text-blue-700 font-bold border-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 border-transparent'
                            }`}
                          title={topic.title}
                          style={{ outline: 'none' }}
                        >
                          {/* Dot indicator for active state */}
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                          <span className="">{topic.title}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SPLITTER */}
      <div
        onMouseDown={startResizing}
        style={{
          width: '4px',
          cursor: 'col-resize',
          backgroundColor: isResizing ? '#3b82f6' : 'transparent', // Blue when resizing, transparent otherwise (but visible due to hover)
          height: '100%',
          zIndex: 10,
          marginLeft: '-2px', // Overlap slightly
          marginRight: '-2px',
          position: 'relative'
        }}
        className="hover:bg-blue-400 transition-colors"
      />

      {/* RIGHT PANEL: Content Viewer */}
      <div style={{ flex: 1, height: '100%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Tabs Header */}
        <div style={{
          height: '40px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto'
        }} className="no-scrollbar">
          {currentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 h-full text-sm border-r border-gray-200 min-w-fit transition-colors ${activeTab === tab.id
                ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 font-medium'
                : tab.disabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 bg-gray-50 border-t-2 border-t-transparent'
                }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          {/* Breadcrumb / Title Area */}
          <div className="flex-1 flex items-center justify-end px-4 text-xs text-gray-400 italic truncate">
            {activeTopic.title}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
          {activeUrl ? (
            ((activeUrl.includes('ai.studio') && !activeUrl.includes('embed=true')) || activeUrl.includes('notebooklm.google.com')) ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <Globe size={48} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700 mb-1">External Content</p>
                  <p className="text-sm text-gray-500 max-w-md">
                    This resource cannot be embedded directly in the app due to provider restrictions.
                  </p>
                </div>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Open in New Tab
                  <Globe size={16} />
                </a>
              </div>
            ) : (
              <iframe
                key={activeUrl} // Force re-render when URL changes
                src={activeUrl}
                style={{ flex: 1, width: '100%', border: 'none' }}
                title={`${activeType} Viewer`}
                allow={activeType === 'video' ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : undefined}
                allowFullScreen={activeType === 'video'}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3" style={{ flex: 1 }}>
              <Monitor size={48} className="opacity-10" />
              <p className="text-sm">No content available for this tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
