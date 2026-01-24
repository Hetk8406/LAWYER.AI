import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../../utils/axios';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: var(--bg-panel);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid ${props => props.color || 'var(--primary)'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.3);
  }

  h4 {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-main);
  }

  .icon-wrapper {
    align-self: flex-end;
    font-size: 1.5rem;
    opacity: 0.5;
    color: var(--text-main);
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrapper = styled.div`
  background: var(--bg-panel);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  
  h3 {
    width: 100%;
    margin-top: 0;
    color: var(--text-main);
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    text-align: left;
  }
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    lawyers: 0,
    civilians: 0,
    lawStudents: 0,
    blogs: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        if (res.data.status === 'success') {
          const d = res.data.data;
          setStats({
            users: d.users.totalUsers,
            lawyers: d.users.lawyers,
            civilians: d.users.civilians,
            lawStudents: d.users.lawStudents,
            blogs: d.blogs.totalBlogs
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const pieData = [
    { name: 'Lawyers', value: stats.lawyers },
    { name: 'Civilians', value: stats.civilians },
    { name: 'Students', value: stats.lawStudents }
  ];

  const barData = [
    { name: 'Total Users', count: stats.users },
    { name: 'Lawyers', count: stats.lawyers },
    { name: 'Blogs', count: stats.blogs }
  ];

  const PIE_COLORS = ['#0694a2', '#1c64f2', '#7e3af2'];

  return (
    <DashboardContainer>
      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading stats...</p> : (
        <>
          <StatsGrid>
            <StatCard color="#7e3af2" onClick={() => navigate('/admin/users')}>
              <h4>Total Users</h4>
              <span className="value">{stats.users}</span>
              <div className="icon-wrapper">👥</div>
            </StatCard>
            <StatCard color="#0694a2" onClick={() => navigate('/admin/lawyers')}>
              <h4>Lawyers</h4>
              <span className="value">{stats.lawyers}</span>
              <div className="icon-wrapper">⚖️</div>
            </StatCard>
            <StatCard color="#1c64f2" onClick={() => navigate('/admin/users')}>
              <h4>Civilians</h4>
              <span className="value">{stats.civilians}</span>
              <div className="icon-wrapper">👤</div>
            </StatCard>
            <StatCard color="#e02424" onClick={() => navigate('/admin/blogs')}>
              <h4>Blogs Posted</h4>
              <span className="value">{stats.blogs}</span>
              <div className="icon-wrapper">📝</div>
            </StatCard>
          </StatsGrid>

          <ChartsRow>
            <ChartWrapper>
              <h3>User Role Distribution</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartWrapper>

            <ChartWrapper>
              <h3>Platform Activity</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                      cursor={{ fill: 'var(--hover)' }}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWrapper>
          </ChartsRow>
        </>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;
