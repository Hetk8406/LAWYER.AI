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
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#ef4444' : '#6c5dd3'};
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? '#dc2626' : '#5a4cb4'};
  }
`;

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            // Adjust API endpoint based on your routes. Assuming /api/blogs or similar
            // Based on blogRoutes.js read: router.get('/', blogController.getAllPosts); mounted likely at /api/blog
            const res = await api.get('/api/blogs');
            if (res.data.status === 'success') {
                setBlogs(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const [deleteId, setDeleteId] = useState(null);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/api/blogs/${deleteId}`);
            setBlogs(blogs.filter(b => b._id !== deleteId));
        } catch (error) {
            console.error("Failed to delete blog", error);
            alert("Failed to delete blog post");
        } finally {
            setDeleteId(null);
            setBlogToDelete(null);
        }
    };

    const handleDeleteClick = (blog) => {
        setDeleteId(blog._id);
        setBlogToDelete(blog);
    };

    return (
        <Container>
            <Header>
                <Title>Blog Management</Title>
            </Header>

            {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading blogs...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <Th>Title</Th>
                            <Th>Author</Th>
                            <Th>Date</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.length === 0 ? (
                            <tr><Td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No blog posts found.</Td></tr>
                        ) : (
                            blogs.map(blog => (
                                <tr key={blog._id}>
                                    <Td>{blog.title}</Td>
                                    <Td>{blog.author?.name || 'Unknown'}</Td>
                                    <Td>{new Date(blog.createdAt).toLocaleDateString()}</Td>
                                    <Td>
                                        <ActionButton danger onClick={() => handleDeleteClick(blog)}>Delete</ActionButton>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => { setDeleteId(null); setBlogToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete Blog Post?"
                message={`Are you sure you want to delete the blog post `}
                itemName={blogToDelete?.title}
            />
        </Container>
    );
};

export default BlogManagement;
