import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  mobileFullScreen?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, mobileFullScreen = false }) => {
  const { activeTeam } = useApp();
  const [isClosing, setIsClosing] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  
  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      handleClose();
    } else {
      setCurrentY(0);
    }
    setIsDragging(false);
  };

  const modalContent = (
    <>
      {/* Desktop Modal */}
      <div className="hidden lg:block fixed inset-0 z-50 overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />
          
          <div className={`relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isClosing ? 'animate-scale-out' : 'animate-scale-in'} border border-neutral-200`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200' : 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${activeTeam === 'Team Hotel' ? 'text-primary-900' : 'text-secondary-900'}`}>
                    {title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500 animate-pulse-subtle' : 'bg-secondary-500 animate-pulse-subtle'}`}></div>
                    <span className={`text-sm font-semibold ${activeTeam === 'Team Hotel' ? 'text-primary-700' : 'text-secondary-700'}`}>
                      Adding to {activeTeam}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-all duration-200 p-2 rounded-lg hover:bg-white/50 transform hover:scale-110 touch-target haptic-light"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="bg-white px-6 py-6">
              {/* Team Context Reminder */}
              <div className={`mb-6 p-4 rounded-xl ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200' : 'bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200'}`}>
                <div className={`flex items-center space-x-3 text-sm ${activeTeam === 'Team Hotel' ? 'text-primary-800' : 'text-secondary-800'}`}>
                  <div className={`w-4 h-4 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500' : 'bg-secondary-500'} flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-semibold">This entry will be added to {activeTeam}</span>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      <div className="lg:hidden fixed inset-0 z-50 mobile-modal">
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={handleClose}
        />
        
        <div 
          className={`mobile-modal-content ${isClosing ? '' : 'open'}`}
          style={{ 
            transform: `translateY(${currentY}px)`,
            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Handle */}
          <div className="mobile-modal-handle" />
          
          {/* Header */}
          <div className={`px-4 py-4 border-b ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200' : 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${activeTeam === 'Team Hotel' ? 'text-primary-900' : 'text-secondary-900'}`}>
                  {title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500 animate-pulse-subtle' : 'bg-secondary-500 animate-pulse-subtle'}`}></div>
                  <span className={`text-xs font-semibold ${activeTeam === 'Team Hotel' ? 'text-primary-700' : 'text-secondary-700'}`}>
                    Adding to {activeTeam}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 transition-all duration-200 p-2 rounded-lg hover:bg-white/50 transform hover:scale-110 touch-target haptic-light"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-4 py-4 overflow-y-auto max-h-[70vh] scroll-smooth">
            {/* Team Context Reminder */}
            <div className={`mb-4 p-3 rounded-xl ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200' : 'bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200'}`}>
              <div className={`flex items-center space-x-3 text-xs ${activeTeam === 'Team Hotel' ? 'text-primary-800' : 'text-secondary-800'}`}>
                <div className={`w-4 h-4 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500' : 'bg-secondary-500'} flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="font-semibold">This entry will be added to {activeTeam}</span>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;