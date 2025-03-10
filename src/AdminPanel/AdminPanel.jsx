import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Add state to track which section is active
  const [activeSection, setActiveSection] = useState('upload');
  const navigate = useNavigate();
  
  // Admin user details
  const admin = {
    name: "Jane Doe",
    role: "System Administrator",
    avatar: "/api/placeholder/40/40"
  };

  

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if(!token) {
      navigate('/admin/login');
    }
  }, []);

  

  // Track window resize to handle sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch files when view section is active
  useEffect(() => {
    if (activeSection === 'view') {
      fetchFiles();
    }
  }, [activeSection]);

  // Sample function to fetch files
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files`);
      const data = await response.json();
      
      // For now, we'll use sample data
      
      
      setTimeout(() => {
        setUploadedFiles(data);
        setIsLoading(false);
      }, 500); // Simulate network delay
    } catch (error) {
      console.error('Error fetching files:', error);
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTitleChange = (event) => {
    setFileTitle(event.target.value);
  };

  const handleExpiryDateChange = (event) => {
    setExpiryDate(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
      
    if (!selectedFile || !fileTitle || !expiryDate) {
      alert("Please select a file, provide a title, and set an expiry date");
      return;
    }
      
    setIsUploading(true);
      
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', fileTitle);
    formData.append('expiresAt', expiryDate); // Add the expiry date to form data
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        // Sometimes adding these headers helps
        // credentials: 'include',
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }

      // Clear form on successful upload
      setSelectedFile(null);
      setFileTitle('');
      setExpiryDate('');
      
      // Refresh the file list if we're viewing files
      if (activeSection === 'view') {
        fetchFiles();
      } else {
        // Switch to view section to show the uploaded file
        setActiveSection('view');
      }

      alert('File uploaded successfully!');

    } catch (error) {
      console.error('Error in upload:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {

        setIsLoading(true)
        // This would be replaced with your actual delete API endpoint
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/delete/${id}`, {
          method: 'DELETE',
        });
        
        fetchFiles()
        
        if (!response.ok) {
          throw new Error(`Delete failed with status ${response.status}`);
        }
        
        // For demo purposes, just filter out the deleted file
        setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== id));
        alert('File deleted successfully!');
      } catch (error) {
        setIsLoading(false)
        console.error('Error deleting file:', error);
        alert(`Delete failed: ${error.message}`);
      }
    }
  };

  const handleViewFile = (filePath) => {
    // This would typically open the file in a new tab or download it
    window.open(`${filePath}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('loggedInUser');
    navigate('/admin/login');
  };

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Conditional classes for sidebar based on open/collapsed state
  const sidebarClasses = `fixed md:fixed inset-y-0 left-0 z-30 bg-gray-800 text-white transform transition-all duration-300 ease-in-out ${
    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  } ${
    sidebarCollapsed && windowWidth >= 768 ? 'w-16' : 'w-64'
  }`;

  // Conditional classes for main content based on sidebar state and screen size
  const mainContentClasses = `flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
    sidebarOpen && windowWidth >= 768 
      ? sidebarCollapsed ? 'md:ml-16' : 'md:ml-64' 
      : 'ml-0'
  }`;

  return (
    <div style={{ fontFamily: 'Jost' }} className="flex h-screen bg-gray-100">
      {/* Sidebar with conditional positioning and width */}
      <div className={sidebarClasses}>
        {/* Collapse Button on Top */}
        <div className="p-2 flex justify-end">
          <button 
            onClick={toggleSidebarCollapse}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarCollapsed 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /> 
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
            </svg>
          </button>
        </div>
        
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center'}`}>
            <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 text-xl font-bold">DRDO :: Admin</span>}
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4">
          <button 
            onClick={() => setActiveSection('upload')} 
            className={`w-full text-left flex items-center px-4 py-2 mt-2 text-white ${activeSection === 'upload' ? 'bg-gray-700' : 'hover:bg-gray-700'} rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!sidebarCollapsed && "File Management"}
          </button>
          
          {/* New "View All Files" Button */}
          <button 
            onClick={() => setActiveSection('view')} 
            className={`w-full text-left flex items-center px-4 py-2 mt-2 text-white ${activeSection === 'view' ? 'bg-gray-700' : 'hover:bg-gray-700'} rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            {!sidebarCollapsed && "View All Files"}
          </button>
        </nav>
        
        {/* Admin Info Section - Only show when not collapsed */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <img src={admin.avatar} alt="Admin Avatar" className="h-10 w-10 rounded-full" />
              <div className="ml-3">
                <p className="text-sm font-medium">{admin.name}</p>
                <p className="text-xs text-gray-400">{admin.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="mt-4 w-full px-4 py-2 text-sm text-white bg-gray-700 rounded hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        )}
        
        {/* Minimized Admin Avatar - Only show when collapsed */}
        {sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700 flex justify-center">
            <img 
              src={admin.avatar} 
              alt="Admin Avatar" 
              className="h-10 w-10 rounded-full cursor-pointer" 
              onClick={() => setSidebarCollapsed(false)}
              title={admin.name}
            />
          </div>
        )}
      </div>
      
      {/* Main Content with proper spacing */}
      <div className={mainContentClasses}>
        {/* Header with toggle button */}
        <header className="bg-white shadow w-full">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Mobile toggle button */}
            <button 
              onClick={toggleSidebar} 
              className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Defence Research and Development Organisation (Admin)</h1>
            <div className="md:block hidden">
              {/* Placeholder for right-side header elements */}
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Conditional rendering based on active section */}
          {activeSection === 'upload' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Upload PDF File</h2>
              <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={fileTitle}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter file title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select PDF File
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </form>
            </div>
          )}
          
          {/* View All Files Section */}
          {activeSection === 'view' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">All Files</h2>
                <button 
                  onClick={fetchFiles}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Refresh
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : uploadedFiles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Uploaded
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadedFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="text-sm font-medium text-gray-900">{file.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.posted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.expiresAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleViewFile(file.path)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleDeleteFile(file._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading a new file.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveSection('upload')}
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Upload New File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Overlay for mobile - only show when sidebar is open */}
      {sidebarOpen && windowWidth < 768 && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default AdminPanel;