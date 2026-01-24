import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const { socket } = useSocketContext();

    const [contacts, setContacts] = useState([]);
    const [chatId, setChatId] = useState(null); // Current active chat ID (user ID or Room ID)
    const [chatInfo, setChatInfo] = useState({}); // Info about current chat
    const [loading, setLoading] = useState(false);

    const fetchContacts = useCallback(async () => {
        if (!user) {
            console.log('[ChatContext] No user found, skipping fetch.');
            return;
        }
        try {
            console.log(`[ChatContext] Fetching contacts for User: ${user.id} (${user.role})`);
            setLoading(true);
            const res = await api.get(`/api/courtroom/${user.id}/contacts`);
            console.log('[ChatContext] Contacts fetched:', res.data.data);
            setContacts(res.data.data);
        } catch (err) {
            console.error('[ChatContext] Error fetching contacts:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateMessageStatusToRead = useCallback(async (toId, type) => {
        if (!user || !socket) return;
        try {
            await api.put(`/api/courtroom/${user.id}/messages/status?type=${type}&chatId=${toId}`);
            socket.emit('UPDATE_MESSAGE_STATUS', {
                type,
                readerId: user.id,
                messageSender: toId // In room: roomId, In user: senderId
            });
        } catch (err) {
            console.error(err);
        }
    }, [user, socket]);

    return (
        <ChatContext.Provider value={{
            contacts,
            setContacts,
            fetchContacts,
            chatId,
            setChatId,
            chatInfo,
            setChatInfo,
            updateMessageStatusToRead,
            loading
        }}>
            {children}
        </ChatContext.Provider>
    );
};
