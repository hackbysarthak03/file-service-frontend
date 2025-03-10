import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Login submitted:', formData);
      // Make sure the URL is correct and the backend server is running
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
      
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          // Adding CORS headers if needed
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies if using session-based auth
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      const {success, message, jwtToken, username} = result;
      
      if(success){
        console.log('Login successful');
        setFormData({
          username: '',
          password: ''
        });
        
        localStorage.setItem('auth-token', jwtToken)
        localStorage.setItem('loggedInUser', username)
        // Redirect or update state as needed for successful login
        navigate('/admin/dashboard')
      } else {
        setError(message || 'Invalid credentials');
        console.log('Login failed:', message);
      }    
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection failed. Please check if the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Jost' }} className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">DRDO::Admin</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******************"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex justify-center items-center"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;