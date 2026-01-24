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
  color: #333;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  min-width: 250px;
`;

const Button = styled.button`
  background: #7e3af2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #6c2bd9;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: #f4f7fa;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #333;
  vertical-align: top;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#fee2e2' : '#e0e7ff'};
  color: ${props => props.danger ? '#ef4444' : '#4f46e5'};
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    filter: brightness(0.95);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
  }
  
  textarea {
    min-height: 100px;
  }
`;

const IPCManagement = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({
        section: '',
        description: '',
        offence: '',
        punishment: ''
    });

    const fetchSections = async () => {
        setLoading(true);
        try {
            // Use search if provided, otherwise fetch all (default limit 20)
            const url = search ? `/api/ipc/search?query=${search}` : '/api/ipc?limit=50';
            const res = await api.get(url);
            if (res.data.status === 'success') {
                setSections(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch IPC", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSections();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleEdit = (section) => {
        setEditingSection(section);
        setFormData({
            section: section.section,
            description: section.description,
            offence: section.offence || '',
            punishment: section.punishment || ''
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingSection(null);
        setFormData({
            section: '',
            description: '',
            offence: '',
            punishment: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this IPC section?")) return;
        try {
            await api.delete(`/api/ipc/${id}`);
            // Optimistic update
            setSections(sections.filter(s => s._id !== id));
        } catch (error) {
            alert("Failed to delete section");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSection) {
                const res = await api.put(`/api/ipc/${editingSection._id}`, formData);
                if (res.data.status === 'success') {
                    // Update in place
                    setSections(sections.map(s => s._id === editingSection._id ? res.data.data : s));
                }
            } else {
                const res = await api.post('/api/ipc', formData);
                if (res.data.status === 'success') {
                    setSections([res.data.data, ...sections]);
                }
            }
            setShowModal(false);
        } catch (error) {
            alert("Failed to save IPC section");
        }
    };

    return (
        <Container>
            <Header>
                <Title>IPC Management</Title>
                <Controls>
                    <SearchInput
                        placeholder="Search Section, Description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleCreate}>+ New Section</Button>
                </Controls>
            </Header>

            {loading ? <p>Loading...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <Th width="15%">Section</Th>
                            <Th width="30%">Offence</Th>
                            <Th width="40%">Description</Th>
                            <Th width="15%">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map(s => (
                            <tr key={s._id}>
                                <Td>{s.section}</Td>
                                <Td>{s.offence}</Td>
                                <Td>{s.description.substring(0, 100)}...</Td>
                                <Td>
                                    <ActionGroup>
                                        <ActionButton onClick={() => handleEdit(s)}>Edit</ActionButton>
                                        <ActionButton danger onClick={() => handleDelete(s._id)}>Delete</ActionButton>
                                    </ActionGroup>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {showModal && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3>{editingSection ? 'Edit Section' : 'New Section'}</h3>
                        <form onSubmit={handleSubmit}>
                            <FormGroup>
                                <label>IPC Section</label>
                                <input
                                    value={formData.section}
                                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Offence</label>
                                <input
                                    value={formData.offence}
                                    onChange={e => setFormData({ ...formData, offence: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Punishment</label>
                                <input
                                    value={formData.punishment}
                                    onChange={e => setFormData({ ...formData, punishment: e.target.value })}
                                />
                            </FormGroup>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <Button type="button" onClick={() => setShowModal(false)} style={{ background: '#9ca3af' }}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default IPCManagement;
