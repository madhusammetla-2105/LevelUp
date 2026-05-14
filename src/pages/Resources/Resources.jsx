import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Resources.css';

function Resources() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const savedPaths = JSON.parse(localStorage.getItem('saved_learning_paths') || '[]');
    setPaths(savedPaths.reverse()); // Show newest first
  }, []);

  return (
    <div className="resources-wrapper page-wrapper" style={{ padding: "10px" }}>
      <div className="resources-container">
        
        {/* Header */}
        <div className="resources-header">
          <div className="resources-header-left">
            <div className="resources-icon">📚</div>
            <div>
              <h1>Learning Resources</h1>
              <p>Your AI-generated learning paths and saved materials.</p>
            </div>
          </div>
          <button className="btn-generate-new" onClick={() => navigate('/dashboard/generate-path')}>
            <span>✨</span> Generate New Path
          </button>
        </div>

        {/* Content Body */}
        <div className="resources-body">
          {paths.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>No Learning Paths Yet</h3>
              <p>Generate your first AI personalized learning path and save it here.</p>
            </div>
          ) : (
            <div className="resources-grid">
              {paths.map((path) => (
                <div key={path.id} className="resource-card">
                  
                  <div className="card-header">
                    <span className={`status-badge status-${path.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {path.status}
                    </span>
                    <button className="btn-icon" onClick={() => {
                      const newPaths = paths.filter(p => p.id !== path.id);
                      setPaths(newPaths);
                      localStorage.setItem('saved_learning_paths', JSON.stringify(newPaths.reverse()));
                    }}>🗑️</button>
                  </div>

                  <h3 className="card-title">{path.title}</h3>
                  
                  <div className="card-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span> {path.duration}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📅</span> {path.dateGenerated}
                    </span>
                  </div>

                  <p className="card-description">{path.description}</p>

                  {path.links && path.links.length > 0 && (
                    <div className="card-links">
                      <h4>Recommended Resources:</h4>
                      <ul>
                        {path.links.map((link, idx) => (
                          <li key={idx}>
                            <a href={link.url} target="_blank" rel="noreferrer">
                              🔗 {link.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="card-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Resources;