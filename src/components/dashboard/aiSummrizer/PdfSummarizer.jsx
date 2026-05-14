import React, { useState, useRef, useCallback } from 'react';
import { logActivity } from '../../../services/analyzerData';
import './summarizer.css';
import ReactMarkdown from 'react-markdown';

const PdfSummarizer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const dropped = droppedFiles[0];
      if (dropped.type === 'application/pdf') {
        setFile(dropped);
      } else {
        setError('Only PDF files are accepted.');
      }
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    setError('');
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type === 'application/pdf') {
        setFile(selected);
      } else {
        setError('Only PDF files are accepted.');
      }
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSummary('');
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      // Use the production webhook URL (/webhook/) instead of the test URL (/webhook-test/)
      // so the workflow executes automatically without needing to click "Execute Workflow" in n8n.
      const response = await fetch('https://workflow.ccbp.in/webhook/4f54047d-45e7-4f19-822a-c08b2ef86858', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const summaryText = Array.isArray(data) ? data[0]?.output : data?.summary;
      if (!summaryText) {
        throw new Error('Invalid response from server');
      }
      setSummary(summaryText);
      logActivity("AI Summarizer", `Summarized PDF: ${file.name}`, 10);
    } catch (err) {
      console.error('Summarization error:', err);
      setError(`Failed to summarize: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="summarizer-wrapper">
      {/* ════════ TOP PANEL — 20% ════════ */}
      <div className="summarizer-top-panel">
        <div className="summarizer-action-row">
          <div
            className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${file ? 'dropzone--has-file' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="dropzone-content">
                <div className="dropzone-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="dropzone-text">Drag & drop your PDF here</p>
                <button className="btn btn--upload" onClick={handleUploadClick} type="button">
                  Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,application/pdf"
                  className="file-input-hidden"
                />
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-preview-icon">📄</div>
                <div className="file-preview-info">
                  <span className="file-preview-name">{file.name}</span>
                  <span className="file-preview-size">{formatFileSize(file.size)}</span>
                </div>
                <button className="btn btn--remove" onClick={handleRemoveFile} type="button" aria-label="Remove file">
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            className={`btn btn--summarize ${isLoading ? 'btn--loading' : ''}`}
            onClick={handleSummarize}
            disabled={isLoading || !file}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Summarizing...
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Summarize
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
              <h2 className="summary-title">Summary Output</h2>
            </div>

            <div className="summary-header-right">
              <div className="summary-small-branding">
                <span className="small-branding-title" style={{ color: "white" }}>⚡ AI PDF Summarizer</span>
                <span className="small-branding-subtitle">Instant AI-powered summary</span>
              </div>
              {summary && (
                <button className="btn btn--copy" onClick={() => navigator.clipboard.writeText(summary)} type="button">
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
            ) : summary ? (
              <div className="summary-text">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="summary-placeholder">
                <div className="placeholder-icon">🤖</div>
                <p className="placeholder-text">Your AI-generated summary will appear here</p>
                <p className="placeholder-subtext">Upload a PDF and click "Summarize" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSummarizer;