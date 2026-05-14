// AIStudyCoach.jsx
import React, { useEffect, useRef, useState } from "react";
import "./aiStudyCoach.css";
import { sendMessageToAI } from "../../../services/api";
import { logActivity } from "../../../services/analyzerData";
import ReactMarkdown from "react-markdown";

const initialMessages = [
    {
        id: 1,
        role: "assistant",
        content:
            "Hi! I’m your AI Study Coach. Ask me anything related to your studies, concepts, or revision topics.",
        time: "Today • 3:42 PM",
    },
];

const suggestions = [
    "Explain React hooks",
    "Teach recursion simply",
    "Quiz me on JavaScript",
    "Summarize DBMS normalization"
];

export default function AIStudyCoach() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    // Auto-scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const handleSend = async (overrideText) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : input;
        if (!textToSend.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: textToSend,
            time: "Just now",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        const aiReply = await sendMessageToAI(textToSend);

        const aiMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: aiReply,
            time: "Just now",
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        logActivity("AI Study Coach", `Asked question: ${textToSend.substring(0, 50)}...`, 5);
    };

    const handleSuggestionClick = (text) => {
        handleSend(text);
    };

    return (
        <div className="coach-wrapper">
            <div className="coach-container">
                {/* Header */}
                <div className="coach-header">
                    <div className="coach-header-left">
                        <div className="coach-icon">✦</div>

                        <div>
                            <h1>AI Study Coach</h1>
                            <p>Ask doubts, revise concepts, and study smarter.</p>
                        </div>
                    </div>

                    <div className="coach-status">
                        <span className="status-dot"></span>
                        Online
                    </div>
                </div>

                {/* Chat Body */}
                <div className="chat-body">
                    {messages.length <= 1 && (
                        <div className="empty-state">
                            <h2>What would you like to learn today?</h2>

                            <div className="suggestions-grid">
                                {suggestions.map((item, index) => (
                                    <button
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => handleSuggestionClick(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="messages-container">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-row ${message.role === "user" ? "user-row" : "assistant-row"
                                    }`}
                            >
                                <div
                                    className={`message-bubble ${message.role === "user"
                                        ? "user-bubble"
                                        : "assistant-bubble"
                                        }`}
                                >
                                    <div className="markdown-content">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                    <span>{message.time}</span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message-row assistant-row">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef}></div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="chat-input-wrapper">
                    <div className="chat-input-container">
                        <input
                            type="text"
                            placeholder="Ask anything about your studies..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" ? handleSend() : null
                            }
                        />

                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}