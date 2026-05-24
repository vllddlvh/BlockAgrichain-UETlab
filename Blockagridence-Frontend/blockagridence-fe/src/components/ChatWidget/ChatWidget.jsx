import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../services/api/chatService';
import './ChatWidget.css';

const WELCOME = {
  role: 'assistant',
  content:
    'Xin chào! Tôi là trợ lý AI của BlockAgrichain 🌱\n\nTôi có thể giúp bạn với:\n• Hướng dẫn sử dụng hệ thống\n• Giải thích blockchain, txHash\n• Hỗ trợ MetaMask\n• Truy xuất nguồn gốc nông sản\n\nBạn cần hỗ trợ gì?',
};

const SUGGESTED = [
  'txHash là gì?',
  'Cách kết nối MetaMask?',
  'Quy trình tạo lô hàng?',
  'Blockchain xác minh dữ liệu thế nào?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }, [input]);

  const doSend = async (text) => {
    text = text.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);

    try {
      const apiHistory = next.map(({ role, content }) => ({ role, content }));
      const reply = await sendMessage(apiHistory);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend(input);
    }
  };

  const showSuggestions = messages.length === 1; // only after welcome

  return (
    <>
      {/* Floating action button */}
      <button
        className={`cw-fab ${isOpen ? 'cw-fab--open' : ''}`}
        onClick={() => setIsOpen(v => !v)}
        aria-label="Trợ lý AI BlockAgrichain"
        title="Trợ lý AI"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
        {!isOpen && <span className="cw-fab-badge">AI</span>}
      </button>

      {/* Chat window */}
      <div className={`cw-window ${isOpen ? 'cw-window--open' : ''}`} aria-hidden={!isOpen}>
        {/* Header */}
        <div className="cw-header">
          <div className="cw-header-left">
            <div className="cw-avatar">🌱</div>
            <div>
              <div className="cw-title">Trợ lý BlockAgrichain</div>
              <div className="cw-subtitle">
                <span className="cw-dot" />
                AI · Blockchain &amp; Truy xuất nguồn gốc
              </div>
            </div>
          </div>
          <button className="cw-close-btn" onClick={() => setIsOpen(false)} aria-label="Đóng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="cw-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cw-row cw-row--${msg.role}`}>
              {msg.role === 'assistant' && <div className="cw-icon">🌱</div>}
              <div className={`cw-bubble cw-bubble--${msg.role} ${msg.isError ? 'cw-bubble--error' : ''}`}>
                {msg.content.split('\n').map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="cw-row cw-row--assistant">
              <div className="cw-icon">🌱</div>
              <div className="cw-bubble cw-bubble--assistant cw-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && !isLoading && (
            <div className="cw-suggestions">
              {SUGGESTED.map((q) => (
                <button key={q} className="cw-chip" onClick={() => doSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="cw-input-area">
          <textarea
            ref={(el) => { textareaRef.current = el; inputRef.current = el; }}
            className="cw-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi… (Enter gửi, Shift+Enter xuống dòng)"
            rows={1}
            disabled={isLoading}
          />
          <button
            className="cw-send-btn"
            onClick={() => doSend(input)}
            disabled={!input.trim() || isLoading}
            aria-label="Gửi"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
