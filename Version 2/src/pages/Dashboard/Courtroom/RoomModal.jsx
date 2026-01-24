import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useChatContext } from '../../../context/ChatContext';
import { useSocketContext } from '../../../context/SocketContext';
import { FaXmark } from 'react-icons/fa6';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: var(--bg-secondary);
  width: 400px;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  
  &:focus { outline: none; border-color: var(--primary); }
`;

const UserList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 0.5rem;
`;

const UserItem = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background: ${props => props.selected ? 'rgba(25, 195, 125, 0.2)' : 'transparent'};
  
  &:hover { background: rgba(255,255,255,0.05); }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
`;

const RoomModal = ({ onClose }) => {
    const { user } = useAuth();
    const { contacts, fetchContacts } = useChatContext();
    const { socket } = useSocketContext();

    const [roomName, setRoomName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const availableUsers = contacts.filter(c => c.chatType === 'user');

    const toggleUser = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!roomName.trim() || selectedUsers.length === 0) return alert("Name and at least 1 user required");

        try {
            const res = await axios.post(`/api/courtroom/${user.id}/room`, {
                name: roomName,
                users: selectedUsers,
                avatarImage: ''
            });

            socket.emit('ROOM_CREATED', {
                name: roomName,
                creator: user.name,
                invitedUser: selectedUsers
            });

            fetchContacts();
            onClose();
        } catch (err) {
            alert("Failed to create room");
        }
    };

    return (
        <Overlay>
            <Modal>
                <CloseBtn onClick={onClose}><FaXmark /></CloseBtn>
                <Title>Create Courtroom</Title>

                <Input
                    placeholder="Room Name"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                />

                <h4 style={{ marginBottom: '0.5rem' }}>Invite Users:</h4>
                <UserList>
                    {availableUsers.map(u => (
                        <UserItem
                            key={u._id}
                            selected={selectedUsers.includes(u._id)}
                            onClick={() => toggleUser(u._id)}
                        >
                            <input type="checkbox" checked={selectedUsers.includes(u._id)} readOnly />
                            {u.name}
                        </UserItem>
                    ))}
                </UserList>

                <SubmitBtn onClick={handleCreate}>Create Room</SubmitBtn>
            </Modal>
        </Overlay>
    );
};

export default RoomModal;
