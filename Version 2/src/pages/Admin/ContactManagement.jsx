import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/axios';
import DeleteModal from '../../components/Common/DeleteModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: var(--text-main);
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-panel);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: var(--bg-dark);
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-main);
  vertical-align: top;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${props => {
        switch (props.status) {
            case 'resolved': return '#0e9f6e'; // Green
            case 'responded': return '#3f83f8'; // Blue
            default: return '#e02424'; // Red (Pending)
        }
    }};
  color: white;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#ef4444' : '#6c5dd3'};
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: ${props => props.danger ? '#dc2626' : '#5a4cb4'};
  }
`;

const ContactManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [contactToDelete, setContactToDelete] = useState(null);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/contact/submissions');
            if (res.data.success) {
                setContacts(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/api/contact/${id}/status`, { status: newStatus });
            setContacts(contacts.map(c => c._id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/api/contact/${deleteId}`);
            setContacts(contacts.filter(c => c._id !== deleteId));
        } catch (error) {
            console.error("Failed to delete contact", error);
        } finally {
            setDeleteId(null);
            setContactToDelete(null);
        }
    };

    const handleDeleteClick = (contact) => {
        setDeleteId(contact._id);
        setContactToDelete(contact);
    };

    return (
        <Container>
            <Header>
                <Title>Contact Submissions</Title>
            </Header>

            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading messages...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <Th width="15%">Name</Th>
                            <Th width="15%">Email</Th>
                            <Th width="10%">Role</Th>
                            <Th width="30%">Message</Th>
                            <Th width="10%">Status</Th>
                            <Th width="20%">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 ? (
                            <tr><Td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No messages found.</Td></tr>
                        ) : (
                            contacts.map(contact => (
                                <tr key={contact._id}>
                                    <Td>{contact.name}</Td>
                                    <Td>{contact.email}</Td>
                                    <Td><span style={{ textTransform: 'capitalize' }}>{contact.role}</span></Td>
                                    <Td>{contact.message}</Td>
                                    <Td>
                                        <StatusBadge status={contact.status}>
                                            {contact.status}
                                        </StatusBadge>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <ActionButton
                                                onClick={() => handleStatusUpdate(contact._id, contact.status === 'resolved' ? 'pending' : 'resolved')}
                                            >
                                                {contact.status === 'resolved' ? 'Mark Pending' : 'Mark Resolved'}
                                            </ActionButton>
                                            <ActionButton danger onClick={() => handleDeleteClick(contact)}>
                                                Delete
                                            </ActionButton>
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => { setDeleteId(null); setContactToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete Message?"
                message={`Are you sure you want to delete the message from `}
                itemName={contactToDelete?.name}
            />
        </Container>
    );
};

export default ContactManagement;
