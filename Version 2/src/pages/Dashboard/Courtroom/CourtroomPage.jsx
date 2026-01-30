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

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  
  /* Desktop Logic: */
  /* First pane (ContactList) is handled by its own width: 300px */
  /* Second pane (ChatWindow) is flex: 1 */
  
  &.contact-pane {
    /* No flex-grow here, width is controlled by ContactList internally */
  }

  &.chat-pane {
    flex: 1;
    overflow: hidden; /* Fix for double scrollbars or overflow issues */
  }

  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
    display: ${props => props.$showOnMobile ? 'flex' : 'none'};
  }
`;

const CourtroomPage = () => {
    const { fetchContacts, chatId } = useChatContext();
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
            <Pane className="contact-pane" $showOnMobile={!chatId}>
                <ContactList />
            </Pane>
            <Pane className="chat-pane" $showOnMobile={!!chatId}>
                <ChatWindow />
            </Pane>
        </Container>
    );
};

export default CourtroomPage;
