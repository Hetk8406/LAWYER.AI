import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/axios'; // Ensure this utility exists and is configured
import { useAuth } from '../../context/AuthContext';
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

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-dark);
  color: var(--text-main);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
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

const Badge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
        switch (props.role) {
            case 'admin': return '#e02424';
            case 'lawyer': return '#0694a2';
            case 'law_student': return '#7e3af2';
            default: return '#1c64f2';
        }
    }};
  color: white;
  text-transform: capitalize;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(79, 70, 229, 0.2)'};
  color: ${props => props.danger ? '#fca5a5' : '#818cf8'};
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
      background: ${props => props.danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(79, 70, 229, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const { user: currentUser } = useAuth(); // To avoid deleting self

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/users');
            if (res.data.status === 'success') {
                setUsers(res.data.data.users);
                setFilteredUsers(res.data.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            alert("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (roleFilter === 'all') {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(u => u.role === roleFilter));
        }
    }, [roleFilter, users]);

    const [deleteId, setDeleteId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/api/admin/users/${deleteId}`);
            setUsers(users.filter(u => u._id !== deleteId));
            // alert("User deleted successfully"); // Optional, modal closing is enough feedback usually
        } catch (error) {
            console.error("Delete failed", error);
            alert(error.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleteId(null);
            setUserToDelete(null);
        }
    };

    const handleDeleteClick = (user) => {
        setDeleteId(user._id);
        setUserToDelete(user);
    };

    // Modal styles
    const ModalOverlay = styled.div`
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
        z-index: 1001; backdrop-filter: blur(5px);
    `;
    const ModalContent = styled.div`
        background: var(--bg-secondary); padding: 2rem; border-radius: 12px;
        width: 90%; max-width: 500px; border: 1px solid var(--border);
        position: relative; color: var(--text-main);
    `;
    const DetailRow = styled.div`
        margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;
        display: flex; justify-content: space-between;
        &:last-child { border-bottom: none; }
    `;
    const Label = styled.span`color: var(--text-secondary); font-size: 0.9rem;`;
    const Value = styled.span`font-weight: 500; text-align: right;`;
    const CloseBtn = styled.button`
        position: absolute; top: 1rem; right: 1rem; background: none; border: none;
        color: white; font-size: 1.5rem; cursor: pointer;
    `;
    const Avatar = styled.div`
        width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1.5rem;
        background: var(--primary); display: flex; align-items: center; justify-content: center;
        font-size: 2rem; font-weight: bold; overflow: hidden;
        img { width: 100%; height: 100%; object-fit: cover; }
    `;

    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <Container>
            <Header>
                <Title>User Management</Title>
                <Controls>
                    <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="civilian">Civilian</option>
                        <option value="lawyer">Lawyer</option>
                        <option value="law_student">Law Student</option>
                        <option value="admin">Admin</option>
                    </Select>
                </Controls>
            </Header>

            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><Td colSpan="4" style={{ textAlign: 'center' }}>No users found.</Td></tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u._id} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <Td>
                                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                {u.profileImage ? <img src={u.profileImage.startsWith('http') ? u.profileImage : `http://localhost:5000${u.profileImage}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : u.name?.[0]}
                                            </div>
                                            {u.name}
                                        </div>
                                    </Td>
                                    <Td>{u.email}</Td>
                                    <Td><Badge role={u.role}>{u.role}</Badge></Td>
                                    <Td onClick={(e) => e.stopPropagation()}>
                                        <ActionButton
                                            danger
                                            onClick={() => handleDeleteClick(u)}
                                            disabled={u.role === 'admin' || u._id === currentUser?._id}
                                        >
                                            Delete
                                        </ActionButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => { setDeleteId(null); setUserToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete User?"
                message={`Are you sure you want to delete user `}
                itemName={userToDelete?.name}
            />

            {selectedUser && (
                <ModalOverlay onClick={() => setSelectedUser(null)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseBtn onClick={() => setSelectedUser(null)}>&times;</CloseBtn>
                        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>User Details</h3>

                        <Avatar>
                            {selectedUser.profileImage ? <img src={selectedUser.profileImage.startsWith('http') ? selectedUser.profileImage : `http://localhost:5000${selectedUser.profileImage}`} alt="" /> : selectedUser.name?.[0]}
                        </Avatar>

                        <DetailRow>
                            <Label>Full Name</Label>
                            <Value>{selectedUser.name}</Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>Email</Label>
                            <Value>{selectedUser.email}</Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>Phone</Label>
                            <Value>{selectedUser.phone || 'N/A'}</Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>Role</Label>
                            <Value><Badge role={selectedUser.role}>{selectedUser.role}</Badge></Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>Status</Label>
                            <Value style={{ color: selectedUser.verified ? '#48bb78' : '#fca5a5' }}>
                                {selectedUser.verified ? 'Verified' : 'Unverified'}
                            </Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>User ID</Label>
                            <Value style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{selectedUser._id}</Value>
                        </DetailRow>
                        <DetailRow>
                            <Label>Joined On</Label>
                            <Value>{new Date(selectedUser.createdAt).toLocaleDateString()}</Value>
                        </DetailRow>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default UserManagement;
