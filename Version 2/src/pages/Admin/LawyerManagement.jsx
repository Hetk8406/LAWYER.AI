import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/axios';

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
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => props.verified ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'};
  color: ${props => props.verified ? '#34d399' : '#f87171'};
`;

const ActionButton = styled.button`
  background: ${props => props.verify ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'};
  color: ${props => props.verify ? '#34d399' : '#f87171'};
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  margin-right: 0.5rem;

  &:hover {
    filter: brightness(1.2);
  }
`;

const LawyerManagement = () => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/users');
            if (res.data.status === 'success') {
                const allUsers = res.data.data.users;
                // Filter only lawyers
                setLawyers(allUsers.filter(u => u.role === 'lawyer'));
            }
        } catch (error) {
            console.error("Failed to fetch lawyers", error);
            alert("Failed to load lawyers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLawyers();
    }, []);

    const handleVerifyToggle = async (lawyer) => {
        const action = lawyer.verified ? 'revoke verification for' : 'verify';
        if (!window.confirm(`Are you sure you want to ${action} ${lawyer.name}?`)) return;

        try {
            const res = await api.patch(`/api/admin/users/${lawyer._id}/verify`);
            if (res.data.status === 'success') {
                // Update local state
                setLawyers(lawyers.map(l =>
                    l._id === lawyer._id ? { ...l, verified: !l.verified } : l
                ));
            }
        } catch (error) {
            console.error("Verification failed", error);
            alert(error.response?.data?.message || "Failed to update verification status");
        }
    };

    return (
        <Container>
            <Header>
                <Title>Lawyer Verification</Title>
            </Header>

            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading lawyers...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Bar Council ID</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {lawyers.length === 0 ? (
                            <tr><Td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No lawyers found.</Td></tr>
                        ) : (
                            lawyers.map(l => (
                                <tr key={l._id}>
                                    <Td>
                                        <div style={{ fontWeight: 500 }}>{l.name}</div>
                                    </Td>
                                    <Td>{l.email}</Td>
                                    <Td>{l.barCouncilId || 'Not provided'}</Td>
                                    <Td>
                                        <StatusBadge verified={l.verified}>
                                            {l.verified ? 'Verified' : 'Pending'}
                                        </StatusBadge>
                                    </Td>
                                    <Td>
                                        <ActionButton
                                            verify={!l.verified}
                                            onClick={() => handleVerifyToggle(l)}
                                        >
                                            {l.verified ? 'Revoke' : 'Approve'}
                                        </ActionButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default LawyerManagement;
