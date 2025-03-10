import React, { useState, useEffect } from 'react';
import { File, Eye, FileText, RefreshCw } from 'lucide-react';

const FileManagementSystem = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Sample data - replace with your actual file data
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch files when component mounts
    fetchFiles();
    
    // Set up an interval to refresh files every minute (60000 milliseconds)
    const refreshInterval = setInterval(() => {
      fetchFiles();
      setLastRefreshed(new Date());
    }, 60000);
    
    // Clear the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files`);
      const result = await response.json();
      setFiles(result);
      
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Function to handle file download or view
  const viewFile = (filePath) => {
    window.open(filePath, '_blank');
  };

  return (
    <div style={{ fontFamily: 'Jost' }} className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="bg-zinc-600 text-white p-2 rounded-md">
              <FileText size={24} />
            </div>
            
            {/* Company Name */}
            <span className="text-xl font-semibold text-gray-800">Defence Research and Development Organisation (DRDO)</span>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto flex-grow p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PDF Documents</h1>
              <p className="text-sm text-gray-500">
                Last refreshed: {formatTime(lastRefreshed)} | Auto-refreshes every minute
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{formatTime(currentTime)}</span>
              <button 
                onClick={fetchFiles}
                className="flex items-center px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors duration-300"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh Now
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : files.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                            <File size={20} className="text-zinc-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.title}
                            </div>
                          </div>
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
                          onClick={() => viewFile(file.path)}
                          className="text-zinc-600 hover:text-zinc-800 inline-flex items-center"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <File size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no PDF documents available.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white p-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          Defence Research and Development Organisation © 2025
        </div>
      </footer>
    </div>
  );
};

export default FileManagementSystem;