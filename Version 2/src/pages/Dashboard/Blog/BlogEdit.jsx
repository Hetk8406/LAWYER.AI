import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1rem;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;
  
  &:hover { color: var(--primary); }
`;

const FormTitle = styled.h1`
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }

  input, textarea, select {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  textarea {
    resize: vertical;
    min-height: 300px;
  }
`;

const SubmitBtn = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const BlogEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        content: '',
        image: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Fetch existing post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/api/blogs/${id}`);
                if (res.data.status === 'success') {
                    const post = res.data.data;
                    setFormData({
                        title: post.title,
                        category: post.category,
                        content: post.content,
                        image: post.image
                    });
                    if (post.image && !post.image.includes('default-blog.jpg')) {
                        setPreview(post.image.startsWith('http') ? post.image : post.image);
                    }
                }
            } catch (error) {
                console.error("Failed to load post", error);
                alert("Failed to load post for editing");
                navigate('/dashboard/blog');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imagePath = formData.image;

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);

                const uploadRes = await api.post('/api/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imagePath = uploadRes.data.filePath;
            }

            const res = await api.patch(`/api/blogs/${id}`, {
                title: formData.title,
                category: formData.category,
                content: formData.content,
                image: imagePath
            });

            if (res.data.status === 'success') {
                navigate(`/dashboard/blog/${id}`);
            }
        } catch (error) {
            console.error("Failed to update blog", error);
            alert(error.response?.data?.message || "Failed to update post");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = () => {
        setImageFile(null);
        setFormData({ ...formData, image: '' });
        setPreview(null);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    return (
        <Container>
            <BackBtn onClick={() => navigate(`/dashboard/blog/${id}`)}>
                <FaArrowLeft /> Cancel Editing
            </BackBtn>

            <FormTitle>Edit Article</FormTitle>

            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Enter a descriptive title..."
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="General">General Law</option>
                        <option value="Criminal">Criminal Law</option>
                        <option value="Civil">Civil Law</option>
                        <option value="Constitution">Constitutional Law</option>
                        <option value="Corporate">Corporate Law</option>
                        <option value="Family">Family Law</option>
                    </select>
                </FormGroup>

                <FormGroup>
                    <label>Cover Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {preview ? (
                        <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#ff4d4d',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                title="Delete current cover image"
                            >
                                <FaArrowLeft style={{ transform: 'rotate(45deg)', opacity: 0 }} /> {/* Dummy icon, replacing with trash text or icon */}
                                🗑️
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            marginTop: '1rem',
                            width: '100%',
                            height: '200px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            border: '2px dashed rgba(255,255,255,0.1)'
                        }}>
                            ⚖️
                        </div>
                    )}
                </FormGroup>

                <FormGroup>
                    <label>Content</label>
                    <textarea
                        name="content"
                        placeholder="Write your article content here..."
                        value={formData.content}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <SubmitBtn type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Article'}
                </SubmitBtn>
            </form>
        </Container>
    );
};

export default BlogEdit;
