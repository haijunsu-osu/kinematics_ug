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

    // Priority: notes first, then video, then first available
    const notesTab = newTabs.find(t => t.id === 'notes' && !t.disabled);
    if (notesTab) {
      setActiveTab('notes');
      return;
    }

    const videoTab = newTabs.find(t => t.id === 'video' && !t.disabled);
    if (videoTab) {
      setActiveTab('video');
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
        }}>
          Robot Kinematics Explorer
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {courseData.map((module, moduleIdx) => (
            <div key={moduleIdx} style={{ marginBottom: '20px' }}>
              {/* Module Title - Purple color */}
              <button
                onClick={() => toggleModule(moduleIdx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none'
                }}
              >
                {expandedModules[moduleIdx] ? <ChevronDown size={14} style={{ marginRight: '4px' }} /> : <ChevronRight size={14} style={{ marginRight: '4px' }} />}
                {module.title}
              </button>

              {expandedModules[moduleIdx] && (
                <div style={{ marginTop: '8px', marginLeft: '16px', borderLeft: '2px solid #e5e7eb', paddingLeft: '12px' }}>
                  {module.topics.map((topic, topicIdx) => {
                    const isActive = activeTopic === topic;
                    return (
                      <div key={topicIdx} style={{ marginBottom: '4px' }}>
                        <button
                          onClick={() => handleTopicClick(topic)}
                          style={{
                            display: 'block',
                            textAlign: 'left',
                            fontSize: '14px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: isActive ? '#fde047' : 'transparent',
                            color: isActive ? '#1f2937' : '#2563eb',
                            fontWeight: isActive ? '700' : '400',
                            textDecoration: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            width: '100%'
                          }}
                          title={topic.title}
                          onMouseEnter={(e) => { if (!isActive) e.target.style.textDecoration = 'underline'; }}
                          onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; }}
                        >
                          {topic.title}
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
          height: '48px',
          borderBottom: '1px solid #d1d5db',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          padding: '4px 8px',
          gap: '4px'
        }}>
          {currentTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  // 3D effect: selected = pressed down, unselected = raised
                  background: tab.disabled
                    ? '#d1d5db'
                    : isSelected
                      ? '#3b82f6'
                      : '#f9fafb',
                  color: tab.disabled
                    ? '#9ca3af'
                    : isSelected
                      ? '#ffffff'
                      : '#374151',
                  boxShadow: tab.disabled
                    ? 'none'
                    : isSelected
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.1)'
                      : '2px 2px 4px rgba(0,0,0,0.15), -1px -1px 2px rgba(255,255,255,0.8)',
                  transform: isSelected ? 'translateY(1px)' : 'translateY(0)'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
          {/* Breadcrumb / Title Area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
            {activeTopic.title}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
          {activeTopic.isAboutContent ? (
            // About Content
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                About Robot Kinematics Learning Materials
              </h1>

              <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>
                <p style={{ marginBottom: '20px' }}>
                  These study materials are prepared by <strong>Prof. Haijun Su</strong> for
                  <strong> Robot Kinematics</strong> coursework at The Ohio State University.
                </p>

                <p style={{ marginBottom: '20px' }}>
                  This course covers the fundamentals of 3D robot kinematics, including spatial descriptions,
                  Euler angles, quaternions, Denavit-Hartenberg convention, forward and inverse kinematics,
                  and path planning for robotic manipulators.
                </p>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginTop: '32px', marginBottom: '16px' }}>
                  📚 What's Included
                </h2>
                <ul style={{ marginLeft: '24px', marginBottom: '20px' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Lecture Notes</strong> – PDF documents covering course topics</li>
                  <li style={{ marginBottom: '8px' }}><strong>Lecture Videos</strong> – Recorded video explanations</li>
                  <li style={{ marginBottom: '8px' }}><strong>Interactive Apps</strong> – Design and visualization tools for hands-on learning</li>
                  <li style={{ marginBottom: '8px' }}><strong>AI Chat (NotebookLM)</strong> – AI-powered Q&A based on course materials</li>
                </ul>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginTop: '32px', marginBottom: '16px' }}>
                  🔐 Requirements
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  A <strong>Google account</strong> is required to access some apps (AI Studio) and the Chat feature (NotebookLM).
                </p>

                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  marginTop: '32px'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                    ⚠️ Disclaimer
                  </h2>
                  <p style={{ color: '#92400e', margin: 0 }}>
                    Some materials in this collection were created with AI assistance and may contain errors.
                    Please use them with caution and verify critical information independently.
                  </p>
                </div>
              </div>
            </div>
          ) : activeUrl ? (
            (activeUrl.includes('ai.studio') || activeUrl.includes('notebooklm.google.com')) ? (
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
    </div >
  );
}

export default App;
