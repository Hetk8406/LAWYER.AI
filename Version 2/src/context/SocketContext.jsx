import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [socketValue, setSocketValue] = useState({
        messageData: null,
        messageReadStatus: null,
        typingNotify: null,
        chatRoomNotify: null,
        invitedToRoom: null,
        onlineUsers: []
    });

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000', {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                // console.log('Socket Connected:', newSocket.id);
                newSocket.emit('USER_ONLINE', user.id, newSocket.id);
            });

            newSocket.on('ONLINE_USER_CHANGED', (users) => {
                setSocketValue(prev => ({ ...prev, onlineUsers: users }));
            });

            newSocket.on('RECEIVE_MESSAGE', (data) => {
                setSocketValue(prev => ({ ...prev, messageData: data }));
            });

            newSocket.on('MESSAGE_READ', (data) => {
                setSocketValue(prev => ({ ...prev, messageReadStatus: data }));
            });

            newSocket.on('TYPING_NOTIFY', (data) => {
                setSocketValue(prev => ({ ...prev, typingNotify: data }));
            });

            newSocket.on('CHAT_ROOM_NOTIFY', (data) => {
                setSocketValue(prev => ({ ...prev, chatRoomNotify: data }));
            });

            newSocket.on('INVITED_TO_ROOM', (data) => {
                setSocketValue(prev => ({ ...prev, invitedToRoom: data }));
            });

            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
    }, [user]);

    const resetSocketValue = useCallback((key) => {
        setSocketValue(prev => ({ ...prev, [key]: null }));
    }, []);

    return (
        <SocketContext.Provider value={{ socket, socketValue, resetSocketValue }}>
            {children}
        </SocketContext.Provider>
    );
};
