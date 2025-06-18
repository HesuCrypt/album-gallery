import React, { useState } from 'react';
import { Camera, Video, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from './types';
import { Gallery } from './components/Gallery';
import ZoomModal from './components/ZoomModal';
import MusicPlayer from './components/MusicPlayer';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import './index.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MusicPlayer />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Camera size={32} className="text-black" />
              <h1 className="text-2xl font-bold text-black">Our Photo Album</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'photos'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <ImageIcon size={18} />
                Photos
              </button>
              
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Video size={18} />
                Videos
              </button>

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Login to Upload
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            {activeTab === 'photos' ? 'Photo Gallery' : 'Video Gallery'}
          </h2>
          <p className="text-gray-600">
            {activeTab === 'photos' 
              ? 'Upload and organize your precious memories'
              : 'Store and view your video collection'
            }
          </p>
        </div>
        
        <Gallery
          type={activeTab === 'photos' ? 'photo' : 'video'}
          onItemClick={handleItemClick}
        />
      </main>

      {/* Zoom Modal */}
      <ZoomModal 
        item={selectedItem}
        onClose={handleCloseModal}
      />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Login onClose={handleLoginClose} />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;