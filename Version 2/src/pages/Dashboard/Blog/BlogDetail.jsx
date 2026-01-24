import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/axios';
import { FaArrowLeft, FaUser, FaCalendar, FaTag, FaTrash, FaPen } from 'react-icons/fa6';
import { useAuth } from '../../../context/AuthContext';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
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
  
  &:hover { color: var(--primary); }
`;

const ArticleHeader = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 2rem;
`;

const CategoryTag = styled.span`
  background: rgba(25, 195, 125, 0.15);
  color: var(--primary);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: white;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 2rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Content = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-main);
  white-space: pre-wrap;
  margin-bottom: 4rem;
`;

const CommentSection = styled.div`
  background: rgba(255,255,255,0.03);
  padding: 2rem;
  border-radius: 12px;
`;

const CommentInput = styled.div`
  margin-bottom: 2rem;
  
  textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 1rem;
    color: white;
    min-height: 100px;
    margin-bottom: 1rem;
    resize: vertical;
    
    &:focus { outline: none; border-color: var(--primary); }
  }

  button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    
    &:disabled { opacity: 0.6; cursor: default; }
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 1.5rem;

  &:last-child { border-bottom: none; }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const CommentContent = styled.div`
  flex: 1;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    strong { color: white; }
    span { font-size: 0.85rem; color: var(--text-secondary); }
  }

  p {
    color: var(--text-main);
    line-height: 1.5;
  }
`;

const DeleteBtn = styled.button`
    background: transparent;
    border: none;
    color: #ff4d4d;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    
    &:hover { opacity: 0.8; }
`;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/blogs/${id}`);
      if (res.data.status === 'success') {
        setPost(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load post", error);
      if (error.response?.status === 404) navigate('/dashboard/blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/blogs/${id}/comments`, { content: comment });
      setComment('');
      fetchPost(); // Refresh comments
    } catch (error) {
      console.error("Comment failed", error);
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/blogs/${id}`);
      navigate('/dashboard/blog');
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete post");
    }
  };

  const DeleteModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#282a37',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Delete Article?</h3>
        <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Are you sure you want to delete <b style={{ color: 'white' }}>{post.title}</b>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => setShowDeleteModal(false)}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}>
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#ff4d4d',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!post) return null;

  return (
    <PageContainer>
      {showDeleteModal && <DeleteModal />}
      <BackBtn onClick={() => navigate('/dashboard/blog')}>
        <FaArrowLeft /> Back to Articles
      </BackBtn>

      <ArticleHeader>
        {post.image && !post.image.includes('default-blog.jpg') && (
          <div style={{ marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
            <img
              src={post.image.startsWith('http') ? post.image : post.image}
              alt={post.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          </div>
        )}
        <CategoryTag>{post.category}</CategoryTag>
        <Title>{post.title}</Title>
        <MetaInfo>
          <div><FaUser /> {post.author?.name}</div>
          <div><FaCalendar /> {new Date(post.createdAt).toLocaleDateString()}</div>
          {/* Add Tags later if needed */}
        </MetaInfo>

        {(user?.role === 'admin' || (user?.role === 'lawyer' && user?.id === post.author?._id)) && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <DeleteBtn as="button" onClick={() => navigate(`/dashboard/blog/edit/${id}`)} style={{ color: 'var(--primary)' }}>
              <FaPen /> Edit Article
            </DeleteBtn>
            <DeleteBtn onClick={handleDelete}>
              <FaTrash /> Delete Article
            </DeleteBtn>
          </div>
        )}
      </ArticleHeader>

      <Content>
        {post.content}
      </Content>

      <CommentSection>
        <h3 style={{ marginBottom: '1.5rem' }}>Comments ({post.comments?.length || 0})</h3>

        {user ? (
          <CommentInput>
            <textarea
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button onClick={handleComment} disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </CommentInput>
        ) : (
          <div style={{ marginBottom: '2rem', color: 'gray' }}>Log in to leave a comment.</div>
        )}

        <CommentList>
          {post.comments?.map(cmt => (
            <CommentItem key={cmt._id}>
              <Avatar>{cmt.user?.name?.[0]}</Avatar>
              <CommentContent>
                <div className="header">
                  <strong>{cmt.user?.name}</strong>
                  <span>{new Date(cmt.createdAt).toLocaleDateString()}</span>
                </div>
                <p>{cmt.content}</p>
              </CommentContent>
            </CommentItem>
          ))}
        </CommentList>
      </CommentSection>
    </PageContainer>
  );
};

export default BlogDetail;
