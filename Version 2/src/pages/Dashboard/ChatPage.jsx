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

// --- ChatGPT Style Components ---

const ChatPageLayout = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100vh;
  height: 100dvh; /* Mobile viewport fix */
  /* Reverted to Old Theme as requested */
  background: radial-gradient(circle at top right, #1e1e2f, #13141a);
  color: #ececf1;
  position: relative;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: ${props => props.$isOpen ? '260px' : '0'};
  background: #202123; /* Darker Sidebar */
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.1);
  
  @media (max-width: 768px) {
    position: absolute;
    height: 100%;
    z-index: 200;
    box-shadow: ${props => props.$isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'};
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    background: #343541;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    font-weight: 600;
  }
`;

const MainChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  min-height: 0; /* Flexbox scrolling fix */
  padding-top: 0; 
  
  @media (max-width: 768px) {
    padding-top: 60px; /* Space for MobileHeader */
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding-bottom: 120px;
  min-height: 0; /* Flexbox scrolling fix */
  
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #565869; border-radius: 4px; }
  &::-webkit-scrollbar-track { background-color: #343541; }
`;

/* Message Row - Striped like ChatGPT */
const MessageRow = styled.div`
  width: 100%;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  background: ${props => props.$isBot ? '#444654' : 'transparent'};
  padding: 1.5rem;
  
  display: flex;
  justify-content: center;
`;

const MessageContent = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 2px; /* ChatGPT square-ish avatars */
  background: ${props => props.$isBot ? '#10a37f' : '#573cff'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 0.9rem;
`;

const TextBlock = styled.div`
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  color: #ececf1;
  overflow-wrap: break-word;

  /* Markdown Styles */
  p { margin-bottom: 1rem; &:last-child { margin-bottom: 0; } }
  code { 
    font-family: 'Söhne Mono', Monaco, Andale Mono, Ubuntu Mono, monospace; 
    background: black; 
    padding: 2px 4px; 
    border-radius: 3px; 
  }
  pre {
    background: black;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; }
  li { margin-bottom: 0.5rem; }
`;

const InputArea = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(53,53,65,0), #343541 50%);
  padding: 2rem 1rem 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem 1rem;
    background: #343541;
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  max-width: 768px;
  background: #40414f;
  border: 1px solid rgba(32,33,35,0.5);
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  
  &:focus-within {
    border-color: rgba(255,255,255,0.2);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  max-height: 200px;
  line-height: 1.5;
  padding: 0;
  margin-bottom: 2px; // Align with button

  &:focus { outline: none; }
  &::placeholder { color: #8e8ea0; }
`;

const SendButton = styled.button`
  background: ${props => props.disabled ? 'transparent' : '#19c37d'};
  color: ${props => props.disabled ? '#8e8ea0' : 'white'};
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: #1a7f5a;
  }
`;

const Disclaimer = styled.div`
  margin-top: 10px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  text-align: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ToggleBtn = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover { background: rgba(255,255,255,0.2); }

  @media (max-width: 768px) {
    display: none; /* Hide on mobile since we have MobileHeader */
  }
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  color: #ececf1;
  padding: 1rem;
  
  h1 { font-size: 2rem; margin-bottom: 2rem; font-weight: 600; }

  @media (max-width: 768px) {
    justify-content: flex-start; /* Allow scrolling from top */
    padding-top: 2rem;
    height: auto; /* Let it grow */
  }
`;

// Reuse History components but style slightly darker
const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #565869; }
`;

// Re-defining other components to avoid errors
const SidebarHeader = styled.div`
  padding: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;
const CloseSidebarBtn = styled.button` background: none; border: none; color: white; `;
const NewChatBtn = styled.button`
  width: 90%;
  margin: 0 auto 1rem auto;
  padding: 0.6rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: rgba(255,255,255,0.1); }
`;
const HistoryItem = styled.div`
  padding: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ececf1;
  background: ${props => props.$active ? '#343541' : 'transparent'};
  &:hover { background: #2a2b32; }
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const DeleteBtn = styled.button` background: none; border: none; color: #aaa; &:hover { color: #fff; } cursor: pointer; `;
const SuggestionCard = styled.div`
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  margin: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { background: rgba(255,255,255,0.1); }
  h4 { margin: 0 0 0.5rem 0; font-weight: 600; }
  span { opacity: 0.8; }
`;
const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const TypingDot = styled.div` width: 8px; height: 8px; background: #ccc; border-radius: 50%; opacity: 0.6; `;
// ...

const ChatPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Initialize sidebar based on window width
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
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
          <button style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }} onClick={handleNewChat}>
            <div style={{ padding: '5px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '5px' }}>
              <FaPlus size={12} />
            </div>
            New chat
          </button>
          <CloseSidebarBtn onClick={() => setIsSidebarOpen(false)}>
            <FaXmark size={20} />
          </CloseSidebarBtn>
        </SidebarHeader>

        <HistoryList>
          {sessions.map(s => (
            <HistoryItem key={s._id} $active={currentSessionId === s._id} onClick={() => loadSession(s._id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <FaFileContract size={14} color={currentSessionId === s._id ? 'white' : '#aaa'} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
              <DeleteBtn className="delete-btn" onClick={(e) => onDeleteClick(e, s)}><FaTrash size={12} /></DeleteBtn>
            </HistoryItem>
          ))}
          {sessions.length === 0 && (
            <div style={{ padding: '1rem', color: '#8e8ea0', fontSize: '0.85rem', textAlign: 'center' }}>No chat history.</div>
          )}
        </HistoryList>
      </Sidebar>

      <MainChatArea>
        {/* Mobile Sticky Header */}
        <MobileHeader>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <FaBars size={20} />
          </button>
          <span>Lawyer.AI</span>
          <button onClick={handleNewChat} style={{ background: 'none', border: 'none', color: 'white' }}>
            <FaPlus size={20} />
          </button>
        </MobileHeader>

        {!isSidebarOpen && (
          <ToggleBtn onClick={() => setIsSidebarOpen(true)}>
            <FaBars size={18} />
          </ToggleBtn>
        )}

        <MessagesContainer>
          {messages.length === 0 && !loading && (
            <WelcomeScreen>
              <div style={{
                width: '60px', height: '60px', borderRadius: '8px',
                background: '#573cff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', boxShadow: '0 4px 15px rgba(87, 60, 255, 0.3)'
              }}>
                <FaScaleUnbalanced size={30} color="white" />
              </div>
              <h1>Lawyer.AI</h1>
              <SuggestionsGrid>
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} onClick={() => handleSend(s.text)}>
                    <h4>{s.title}</h4>
                    <span>"{s.text}"</span>
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </WelcomeScreen>
          )}

          {messages.map((msg, i) => (
            <MessageRow key={i} $isBot={msg.role === 'bot'}>
              <MessageContent>
                <Avatar $isBot={msg.role === 'bot'}>
                  {msg.role === 'bot' ? <FaRobot size={16} /> : (user?.name?.[0] || <FaUser size={14} />)}
                </Avatar>
                <TextBlock>
                  {msg.role === 'bot' ? (
                    <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                  ) : (
                    msg.content || ''
                  )}
                </TextBlock>
              </MessageContent>
            </MessageRow>
          ))}

          {loading && (
            <MessageRow $isBot={true}>
              <MessageContent>
                <Avatar $isBot={true}><FaRobot size={16} /></Avatar>
                <TextBlock>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '100%' }}>
                    <TypingDot /> <TypingDot /> <TypingDot />
                  </div>
                </TextBlock>
              </MessageContent>
            </MessageRow>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputArea>
          <InputWrapper>
            <TextArea
              ref={inputRef}
              rows={1}
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <SendButton onClick={() => handleSend()} disabled={!input.trim() || loading}>
              <FaPaperPlane size={16} />
            </SendButton>
          </InputWrapper>
          <Disclaimer>
            Free Research Preview. Lawyer.AI may produce inaccurate information about people, places, or facts.
          </Disclaimer>
        </InputArea>

      </MainChatArea>
    </ChatPageLayout>
  );
};

export default ChatPage;
