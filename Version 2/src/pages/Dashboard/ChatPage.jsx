import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import api from '../../utils/axios';
import { FaPaperPlane, FaTrash, FaRobot, FaUser, FaBars, FaXmark, FaPlus, FaLightbulb, FaGavel, FaFileContract, FaScaleUnbalanced } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import DeleteModal from '../../components/Common/DeleteModal'; // Use shared component

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
`;

// Layout
const ChatPageLayout = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, #1e1e2f, #13141a);
  position: relative;
  overflow: hidden;
`;

// Sidebar
const Sidebar = styled.div`
  width: ${props => props.$isOpen ? '300px' : '0'};
  background: rgba(18, 18, 24, 0.95);
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const CloseSidebarBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: white; }
`;

const NewChatBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border: none;
  color: white;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(108, 93, 211, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 93, 211, 0.4);
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

const HistoryItem = styled.div`
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  color: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.7)'};
  background: ${props => props.$active ? 'linear-gradient(90deg, rgba(108, 93, 211, 0.2), transparent)' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255,255,255,0.03);
    color: white;
    .delete-btn { opacity: 1; }
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ff4d4d;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 6px;
  border-radius: 4px;
  &:hover { background: rgba(255, 77, 77, 0.1); }
`;

// Main Chat Area
const MainChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; 
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(108, 93, 211, 0.03) 0%, transparent 50%);
`;

const ToggleBtn = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 100;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  display: ${props => props.$isOpen ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 5%;
  padding-bottom: 140px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%; /* Ensure full height */
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
  padding-bottom: 100px; /* Counteract the container padding slightly to center visually */

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff 0%, #a0e6ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p { color: var(--text-secondary); margin-bottom: 3rem; font-size: 1.1rem; }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
  width: 100%;
  max-width: 800px;
`;

const SuggestionCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--primary);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  h4 { color: white; margin: 0; font-size: 1rem; font-weight: 600; }
  span { color: var(--text-secondary); font-size: 0.9rem; }
  svg { color: var(--primary); font-size: 1.4rem; margin-bottom: 0.5rem; }
`;

const MessageBubble = styled.div`
  display: flex;
  gap: 1rem;
  align-self: ${props => props.$isBot ? 'flex-start' : 'flex-end'};
  max-width: ${props => props.$isBot ? '90%' : '80%'};
  flex-direction: ${props => props.$isBot ? 'row' : 'row-reverse'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$isBot ? 'linear-gradient(135deg, #19c37d, #10a37f)' : 'linear-gradient(135deg, #6c5dd3, #5a4ad1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  font-size: 0.9rem;
`;

const Content = styled.div`
  background: ${props => props.$isBot ? 'rgba(30,30,40,0.6)' : 'var(--primary)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$isBot ? 'rgba(255,255,255,0.08)' : 'transparent'};
  padding: 1rem 1.5rem;
  border-radius: ${props => props.$isBot ? '4px 20px 20px 20px' : '20px 4px 20px 20px'};
  color: ${props => props.$isBot ? '#e1e1e6' : 'white'};
  line-height: 1.7;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow-wrap: break-word;

  /* Markdown Styles */
  h1, h2, h3 { margin-top: 1rem; margin-bottom: 0.5rem; color: white; }
  p { margin-bottom: 0.8rem; &:last-child { margin-bottom: 0; } }
  ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; }
  li { margin-bottom: 0.4rem; }
  strong { color: #fff; font-weight: 700; }
  code { 
    background: rgba(0,0,0,0.3); 
    padding: 2px 6px; 
    border-radius: 4px; 
    font-family: 'Consolas', monospace; 
    font-size: 0.9em; 
  }
  pre {
    background: #1e1e2f;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
    code { background: transparent; padding: 0; }
  }
  blockquote {
    border-left: 4px solid var(--primary);
    padding-left: 1rem;
    margin: 1rem 0;
    color: rgba(255,255,255,0.7);
    font-style: italic;
  }
`;

const InputArea = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 2rem;
  background: linear-gradient(to top, #13141a 40%, transparent);
  display: flex;
  justify-content: center;
  z-index: 10;
`;

const InputWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  background: rgba(30, 32, 45, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 0.8rem 1rem; // Reduced padding
  display: flex;
  align-items: flex-end; 
  gap: 1rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  transition: all 0.3s;
  position: relative;
  margin-bottom: 1rem;

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 10px 50px rgba(108, 93, 211, 0.25);
    background: rgba(30, 32, 45, 0.9);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.05rem;
  font-family: 'Inter', sans-serif;
  resize: none;
  max-height: 200px;
  padding: 0.6rem;
  line-height: 1.5;

  &:focus { outline: none; }
  &::placeholder { color: rgba(255,255,255,0.4); }
`;

const SendButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: scale(1.05) rotate(-10deg);
    box-shadow: 0 5px 15px rgba(108, 93, 211, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: default;
    background: rgba(255,255,255,0.1);
  }
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  animation: ${pulse} 1.4s infinite ease-in-out both;
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
`;

const ChatPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [deleteId, setDeleteId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); // For modal message

  const resizeInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => { resizeInput(); }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/api/chat/sessions');
        if (res.data && Array.isArray(res.data.data)) {
          setSessions(res.data.data);
        } else {
          setSessions([]);
        }
      } catch (err) {
        setSessions([]);
      }
    };
    fetchSessions();
  }, []);

  const loadSession = async (id) => {
    try {
      setLoading(true);
      setCurrentSessionId(id);
      const res = await api.get(`/api/chat/session/${id}`);
      if (res.data && res.data.data && Array.isArray(res.data.data.messages)) {
        setMessages(res.data.data.messages);
      } else {
        setMessages([]);
      }
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    if (inputRef.current) inputRef.current.focus();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSend = async (val = input) => {
    if (!val.trim()) return;
    const userMsg = val;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/chat/send', {
        message: userMsg,
        sessionId: currentSessionId
      });

      const responseData = res.data.data;

      if (responseData && responseData.sessionId && !currentSessionId) {
        setCurrentSessionId(responseData.sessionId);
        setSessions(prev => [{ _id: responseData.sessionId, title: userMsg.substring(0, 30) + '...' }, ...prev]);
      }

      const botContent = (responseData && responseData.response) ? responseData.response : "Received empty response.";
      setMessages(prev => [...prev, { role: 'bot', content: botContent }]);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteClick = (e, session) => {
    e.stopPropagation();
    setDeleteId(session._id);
    setItemToDelete(session.title);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/chat/session/${deleteId}`);
      setSessions(prev => prev.filter(s => s._id !== deleteId));
      if (currentSessionId === deleteId) handleNewChat();
    } catch (err) { console.error(err); }
    setDeleteId(null);
    setItemToDelete(null);
  };

  const suggestions = [
    { icon: <FaGavel />, title: "Explain Case Law", text: "Summarize the Kesavananda Bharati case." },
    { icon: <FaFileContract />, title: "Draft Agreement", text: "Draft a simple freelance consulting agreement." },
    { icon: <FaScaleUnbalanced />, title: "Legal Advice", text: "What are the rights of a tenant in India?" },
    { icon: <FaLightbulb />, title: "IPC Section", text: "Explain Section 420 of IPC with examples." }
  ];

  return (
    <ChatPageLayout>
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this chat history?"
        itemName={itemToDelete}
      />

      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader>
          <div style={{ flex: 1, fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaRobot style={{ color: 'var(--primary)' }} /> HISTORY
          </div>
          <CloseSidebarBtn onClick={() => setIsSidebarOpen(false)}>
            <FaXmark size={20} />
          </CloseSidebarBtn>
        </SidebarHeader>

        <div style={{ padding: '1rem' }}>
          <NewChatBtn onClick={handleNewChat}>
            <FaPlus /> New Chat
          </NewChatBtn>
        </div>

        <HistoryList>
          {sessions.map(s => (
            <HistoryItem key={s._id} $active={currentSessionId === s._id} onClick={() => loadSession(s._id)}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
              <DeleteBtn className="delete-btn" onClick={(e) => onDeleteClick(e, s)}><FaTrash size={12} /></DeleteBtn>
            </HistoryItem>
          ))}
          {sessions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', marginTop: '2rem' }}>No history yet.</p>
          )}
        </HistoryList>
      </Sidebar>

      <MainChatArea>
        {!isSidebarOpen && (
          <ToggleBtn $isOpen={false} onClick={() => setIsSidebarOpen(true)}>
            <FaBars />
          </ToggleBtn>
        )}

        <MessagesContainer>
          {messages.length === 0 && !loading && (
            <WelcomeScreen>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '24px', // Slightly squared for modern look
                  background: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 0 40px rgba(108, 93, 211, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <FaRobot style={{ fontSize: '3.5rem', color: '#a0e6ff', filter: 'drop-shadow(0 0 10px rgba(160, 230, 255, 0.4))' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ margin: 0, fontSize: '3rem' }}>Hello, {user?.name?.split(' ')[0] || 'Counselor'}</h1>
                  <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>Your AI Legal Assistant is ready.</p>
                </div>
              </div>
              <SuggestionsGrid>
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} onClick={() => handleSend(s.text)}>
                    {s.icon}
                    <h4>{s.title}</h4>
                    <span>{s.text}</span>
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </WelcomeScreen>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} $isBot={msg.role === 'bot'}>
              <Avatar $isBot={msg.role === 'bot'}>
                {msg.role === 'bot' ? <FaRobot size={20} /> : (user?.name?.[0] || <FaUser size={14} />)}
              </Avatar>
              <Content $isBot={msg.role === 'bot'}>
                {msg.role === 'bot' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </Content>
            </MessageBubble>
          ))}

          {loading && (
            <MessageBubble $isBot={true}>
              <Avatar $isBot={true}><FaRobot size={20} /></Avatar>
              <Content $isBot={true} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '1rem' }}>
                <TypingDot />
                <TypingDot />
                <TypingDot />
              </Content>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputArea>
          <InputWrapper>
            <TextArea
              ref={inputRef}
              rows={1}
              placeholder="Ask a legal question... (e.g. 'Draft a Rent Agreement')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <SendButton onClick={() => handleSend()} disabled={!input.trim() || loading}>
              <FaPaperPlane size={18} />
            </SendButton>
          </InputWrapper>
        </InputArea>

      </MainChatArea>

    </ChatPageLayout>
  );
};

export default ChatPage;
