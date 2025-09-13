import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { activeTeam } = useApp();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in border border-neutral-200">
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
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-all duration-200 p-2 rounded-lg hover:bg-white/50 transform hover:scale-110"
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
  );
};

export default Modal;