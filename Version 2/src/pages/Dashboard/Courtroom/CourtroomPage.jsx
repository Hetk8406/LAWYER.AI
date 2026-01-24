import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useChatContext } from '../../../context/ChatContext';
import { useSocketContext } from '../../../context/SocketContext';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  background: var(--bg-secondary);
  overflow: hidden;
`;

const CourtroomPage = () => {
    const { fetchContacts } = useChatContext();
    const { socket } = useSocketContext();

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Listen for socket events that should trigger contact refresh
    useEffect(() => {
        if (socket) {
            socket.on('CHAT_ROOM_NOTIFY', () => fetchContacts());
            // INVITED_TO_ROOM is no longer needed but keeping it harmlessly or removing it is fine
            return () => {
                socket.off('CHAT_ROOM_NOTIFY');
            }
        }
    }, [socket, fetchContacts]);

    return (
        <Container>
            <ContactList />
            <ChatWindow />
        </Container>
    );
};

export default CourtroomPage;
