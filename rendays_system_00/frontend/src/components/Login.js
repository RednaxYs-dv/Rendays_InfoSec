import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      if (data.success) {
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#222'
    }}>
      <div style={{ 
        background: '#333', 
        padding: '2rem', 
        borderRadius: '8px',
        width: '300px'
      }}>
        <h2 style={{ color: '#948979', marginBottom: '1rem' }}>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '1rem',
              background: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white'
            }}
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '1rem',
              background: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white'
            }}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button style={{
            width: '100%',
            padding: '10px',
            background: '#948979',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;