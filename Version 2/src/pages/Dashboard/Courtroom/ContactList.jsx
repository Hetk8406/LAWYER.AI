import React from 'react';
import styled from 'styled-components';
import { useChatContext } from '../../../context/ChatContext';
import { useSocketContext } from '../../../context/SocketContext';
import { FaPlus, FaUser, FaUsers } from 'react-icons/fa6';

const Sidebar = styled.div`
  width: 300px;
  background: rgba(0,0,0,0.2);
  border-right: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 { margin: 0; font-size: 1.1rem; }
`;

const CreateBtn = styled.button`
  background: var(--primary);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover { opacity: 0.8; }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Item = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${props => props.active ? 'rgba(25, 195, 125, 0.1)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.05);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  position: relative;
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #2ecc71;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
`;

const Info = styled.div`
  flex: 1;
  
  div { font-weight: 500; font-size: 0.95rem; }
  span { font-size: 0.8rem; color: var(--text-secondary); }
`;

const Badge = styled.div`
  background: #ff4d4d;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
`;

const ContactList = () => {
  const { contacts, chatId, setChatId, setChatInfo } = useChatContext();
  const { socketValue: { onlineUsers } } = useSocketContext();

  const handleSelect = (contact) => {
    setChatId(contact._id);
    setChatInfo(contact);
  };

  const isOnline = (userId) => {
    return onlineUsers?.some(u => u.userId === userId);
  };

  return (
    <Sidebar>
      <Header>
        <h3>Available Contacts</h3>
      </Header>
      <List>
        {contacts.map(contact => (
          <Item
            key={contact._id}
            active={chatId === contact._id}
            onClick={() => handleSelect(contact)}
          >
            <Avatar>
              <FaUser />
              {isOnline(contact._id) && <OnlineDot />}
            </Avatar>
            <Info>
              <div>{contact.name || 'Unknown'}</div>
              <span>{contact.role}</span>
            </Info>
            {contact.unreadCount > 0 && <Badge>{contact.unreadCount}</Badge>}
          </Item>
        ))}
        {contacts.length === 0 && <div style={{ padding: '1rem', color: 'gray', textAlign: 'center' }}>No contacts found.</div>}
      </List>
    </Sidebar>
  );
};

export default ContactList;
