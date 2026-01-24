import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPen, FaMagnifyingGlass, FaUser, FaClock, FaComment, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useAuth } from '../../../context/AuthContext';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
`;

const PageBtn = styled.button`
  background: ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
    color: white;
    border-color: rgba(255,255,255,0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BlogContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const BlogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(to right, #ffffff 0%, #a0e6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(160, 230, 255, 0.3);
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  
  input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px; // Pill shape
    padding: 0.8rem 1.2rem 0.8rem 2.5rem;
    color: white;
    width: 250px;
    font-size: 0.95rem;

    &:focus {
      border-color: var(--primary);
      outline: none;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
`;

const CreateBtn = styled(Link)`
  background: var(--primary);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(25, 195, 125, 0.3);
  }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const BlogCard = styled(Link)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    
    h3 { color: var(--primary); }
  }
`;

// Placeholder for image - can be dynamic later
const CardImage = styled.div`
  height: 200px;
  background: linear-gradient(45deg, #1a1d2d, #2a2d3d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.1);
  font-size: 3rem;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  line-height: 1.4;
  color: var(--text-main);
  transition: color 0.2s;
`;

const CardExcerpt = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const Tag = styled.span`
  background: rgba(25, 195, 125, 0.1);
  color: var(--primary);
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
  align-self: flex-start;
`;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: 6,
          search
        }).toString();

        const res = await axios.get(`/api/blogs?${query}`);
        if (res.data.status === 'success') {
          setPosts(res.data.data);
          setTotalPages(res.data.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <BlogContainer>
      <BlogHeader>
        <Title>Legal Insights</Title>
        <Controls>
          <SearchBox>
            <FaMagnifyingGlass />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={handleSearch}
            />
          </SearchBox>

          {user?.role === 'lawyer' && (
            <CreateBtn to="/dashboard/blog/create">
              <FaPen size={14} /> Write Article
            </CreateBtn>
          )}
        </Controls>
      </BlogHeader>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'gray', marginTop: '2rem' }}>Loading articles...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'gray', marginTop: '4rem' }}>
          <h2>No articles found</h2>
          <p>Try adjusting your search or write a new one!</p>
        </div>
      ) : (
        <>
          <BlogGrid>
            {posts.map(post => (
              <BlogCard key={post._id} to={`/dashboard/blog/${post._id}`}>
                {post.image && !post.image.includes('default-blog.jpg') ? (
                  <img
                    src={post.image.startsWith('http') ? post.image : post.image}
                    alt={post.title}
                    style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <CardImage>
                    ⚖️
                  </CardImage>
                )}
                <CardContent>
                  <Tag>{post.category || 'General'}</Tag>
                  <CardTitle>{post.title}</CardTitle>
                  <CardExcerpt>
                    {post.content.substring(0, 120)}...
                  </CardExcerpt>
                  <CardMeta>
                    <div><FaUser /> {post.author?.name || 'Unknown'}</div>
                    <div><FaClock /> {new Date(post.createdAt).toLocaleDateString()}</div>
                  </CardMeta>
                </CardContent>
              </BlogCard>
            ))}
          </BlogGrid>

          {totalPages > 1 && (
            <PaginationContainer>
              <PageBtn
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <FaChevronLeft />
              </PageBtn>

              {[...Array(totalPages)].map((_, i) => (
                <PageBtn
                  key={i + 1}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PageBtn>
              ))}

              <PageBtn
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <FaChevronRight />
              </PageBtn>
            </PaginationContainer>
          )}
        </>
      )}
    </BlogContainer>
  );
};

export default BlogPage;
