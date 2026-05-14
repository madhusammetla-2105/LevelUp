import React, { useState } from 'react';
import './LearningPathGenerator.css';
import ReactMarkdown from 'react-markdown';

const LearningPathGenerator = () => {
  const [topic, setTopic] = useState('');
  const [path, setPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPath('');
    setIsAdded(false);

    try {
      const response = await fetch('https://workflow.ccbp.in/webhook-test/ai-learning-path-generater', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the response data dynamically based on common n8n webhook outputs
      const generatedPath = Array.isArray(data) ? data[0]?.output || data[0]?.text || data[0]?.path : data?.output || data?.text || data?.path || data?.reply || data?.response;

      if (!generatedPath) {
        console.log("Full Backend Response:", data);
        // Fallback if we can't find standard keys, just stringify the whole thing so they see something
        setPath(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      } else {
        setPath(generatedPath);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(`Failed to generate path: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToResources = () => {
    if (!path) return;
    
    const existingPaths = JSON.parse(localStorage.getItem('saved_learning_paths') || '[]');
    const newPath = {
      id: Date.now().toString(),
      title: `${topic} Learning Path`,
      status: 'Not Started',
      duration: 'Self-paced',
      dateGenerated: new Date().toLocaleDateString(),
      description: path.substring(0, 100) + '...',
      links: [], // AI didn't provide specific links in a structured way, so empty for now
      progress: 0,
      fullContent: path
    };
    
    existingPaths.push(newPath);
    localStorage.setItem('saved_learning_paths', JSON.stringify(existingPaths));
    setIsAdded(true);
    
    // reset notification after 3 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  };

  return (
    <div className="summarizer-wrapper">
      {/* ════════ TOP PANEL — 20% ════════ */}
      <div className="summarizer-top-panel">
        <div className="summarizer-action-row">
          
          <div className="path-input-container dropzone dropzone--active">
             <input
                type="text"
                placeholder="What do you want to learn? (e.g. ReactJS)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="path-input-field"
             />
          </div>

          <button
            className={`btn btn--summarize ${isLoading ? 'btn--loading' : ''}`}
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate Path
              </>
            )}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* ════════ BOTTOM PANEL — 80% ════════ */}
      <div className="summarizer-bottom-panel">
        <div className="summary-container">
          <div className="summary-header">
            <div className="summary-header-left">
              <span className="summary-dot" />
              <h2 className="summary-title">Learning Path Output</h2>
            </div>

            <div className="summary-header-right">
              <div className="summary-small-branding">
                <span className="small-branding-title" style={{ color: "white" }}>⚡ AI Learning Path Generator</span>
                <span className="small-branding-subtitle">Instant personalized roadmap</span>
              </div>
              {path && (
                <button className="btn btn--copy" onClick={() => navigator.clipboard.writeText(path)} type="button">
                  📋 Copy
                </button>
              )}
            </div>
          </div>

          <div className="summary-body">
            {isLoading ? (
              <div className="summary-placeholder summary-placeholder--loading">
                <div className="skeleton-line skeleton-line--long" />
                <div className="skeleton-line skeleton-line--medium" />
                <div className="skeleton-line skeleton-line--long" />
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line skeleton-line--medium" />
                <div className="skeleton-line skeleton-line--long" />
              </div>
            ) : path ? (
              <div className="summary-text">
                 <ReactMarkdown>{path}</ReactMarkdown>
              </div>
            ) : (
              <div className="summary-placeholder">
                <div className="placeholder-icon">🗺️</div>
                <p className="placeholder-text">Your AI-generated learning path will appear here</p>
                <p className="placeholder-subtext">Enter a topic and click "Generate Path" to get started</p>
              </div>
            )}
          </div>
          
          {path && !isLoading && (
            <div className="summary-footer">
              <button 
                className={`btn btn--add-resources ${isAdded ? 'btn--success' : ''}`} 
                onClick={handleAddToResources}
                disabled={isAdded}
              >
                {isAdded ? '✅ Added to Resources' : '➕ Add path to resources'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathGenerator;
