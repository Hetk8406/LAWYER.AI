import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import api from '../../../utils/axios';
import { useAuth } from '../../../context/AuthContext';
import { useChatContext } from '../../../context/ChatContext';
import { useSocketContext } from '../../../context/SocketContext';
import { FaPaperPlane } from 'react-icons/fa6';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.1);
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2);
  font-weight: 600;
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.8rem 1.2rem;
  border-radius: 18px;
  background: ${props => props.isOwn ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.isOwn ? 'white' : 'var(--text-main)'};
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
  
  .sender {
    font-size: 0.75rem;
    margin-bottom: 0.4rem;
    opacity: 0.8;
    display: block;
    color: ${props => props.isOwn ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)'};
  }
`;

const InputArea = styled.form`
  padding: 1rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  gap: 1rem;

  input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 25px;
    padding: 0.8rem 1.5rem;
    color: white;
    
    &:focus { outline: none; border-color: var(--primary); }
  }

  button {
    background: var(--primary);
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover { transform: scale(1.05); }
  }
`;

const DetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  width: 400px;
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 2rem;
  position: relative;
  
  h2 { margin-top: 0; color: var(--primary); }
  
  .row {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    
    label { font-size: 0.85rem; color: var(--text-secondary); }
    span { font-size: 1.1rem; font-weight: 500; }
  }

  button.close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const WarningText = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
  opacity: 0.8;
  background: rgba(255, 107, 107, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
`;

const ChatWindow = () => {
    const { user } = useAuth();
    const { chatId, chatInfo, updateMessageStatusToRead, fetchContacts } = useChatContext();
    const { socket, socketValue: { messageData } } = useSocketContext();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const messagesAreaRef = useRef(null);

    // Fetch messages when chat changes
    useEffect(() => {
        if (chatId) {
            const fetchMessages = async () => {
                try {
                    const res = await api.get(`/api/courtroom/${user.id}/messages?type=${chatInfo.chatType}&chatId=${chatId}`);
                    setMessages(res.data.data);
                    updateMessageStatusToRead(chatId, chatInfo.chatType);
                    fetchContacts(); // Update sidebar badges
                } catch (err) {
                    console.error(err);
                }
            };
            fetchMessages();
        }
    }, [chatId, user.id, chatInfo.chatType]);

    // Handle incoming socket messages
    useEffect(() => {
        if (messageData && chatId) {
            const { sender, receiver, type } = messageData;
            const isCurrentChat =
                (type === 'user' && (sender === chatId || receiver === chatId)) ||
                (type === 'room' && receiver === chatId);

            if (isCurrentChat) {
                setMessages(prev => [...prev, messageData]);

                if (sender !== user.id) {
                    updateMessageStatusToRead(chatId, chatInfo.chatType);
                }
            }
        }
    }, [messageData, chatId]);

    // Scroll to bottom
    useEffect(() => {
        if (messagesAreaRef.current) {
            messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        try {
            const res = await api.post(`/api/courtroom/${user.id}/message?chatId=${chatId}`, {
                message: inputText
            });

            const newMsg = {
                ...res.data.data,
                type: chatInfo.chatType,
                sender: user.id,
                receiver: chatId
            };

            setMessages(prev => [...prev, newMsg]);
            setInputText('');

            // Emit socket event
            socket.emit('SEND_MESSAGE', newMsg);

        } catch (err) {
            console.error(err);
        }
    };

    if (!chatId) return (
        <Wrapper style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaPaperPlane style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome to Your Courtroom</h2>
            <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                Select a contact from the sidebar to securely discuss case details.
            </p>
        </Wrapper>
    );

    return (
        <Wrapper>
            <ChatHeader onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }} title="Click for details">
                {chatInfo.name}
                <small style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.7 }}>
                    Click to view details
                </small>
            </ChatHeader>
            <MessagesArea ref={messagesAreaRef}>
                <WarningText>
                    Messages are stored for 15 days only. Older messages are automatically deleted.
                </WarningText>

                {messages.map((msg, i) => {
                    const isOwn = msg.sender === user.id;
                    return (
                        <MessageBubble key={msg._id || i} isOwn={isOwn}>
                            {!isOwn && chatInfo.chatType === 'room' && (
                                <span className="sender">User {msg.sender.toString().slice(-4)}</span>
                            )}
                            {msg.message}
                        </MessageBubble>
                    );
                })}
            </MessagesArea>
            <InputArea onSubmit={handleSend}>
                <input
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit"><FaPaperPlane /></button>
            </InputArea>

            {showModal && (
                <DetailModal onClick={() => setShowModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                        <h2>{chatInfo.name}</h2>
                        <div className="row">
                            <label>Role</label>
                            <span>{chatInfo.role}</span>
                        </div>
                        {chatInfo.email && (
                            <div className="row">
                                <label>Email</label>
                                <span>{chatInfo.email}</span>
                            </div>
                        )}
                        {chatInfo.phone && (
                            <div className="row">
                                <label>Phone</label>
                                <span>{chatInfo.phone}</span>
                            </div>
                        )}
                        {!chatInfo.email && !chatInfo.phone && (
                            <div className="row">
                                <span>No extra details available</span>
                            </div>
                        )}
                    </ModalContent>
                </DetailModal>
            )}
        </Wrapper>
    );
};

export default ChatWindow;
