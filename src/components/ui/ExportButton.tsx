import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface ExportButtonProps {
  onExport: (month: string) => void;
  label: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, label, disabled = false }) => {
  const { activeTeam } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  const handleExport = () => {
    onExport(selectedMonth);
    setShowModal(false);
    setSelectedMonth('');
  };

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        variant="outline" 
        disabled={disabled}
        className="flex items-center space-x-2"
      >
        <Download size={16} />
        <span>{label}</span>
      </Button>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={`Export ${label}`}
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${activeTeam === 'Team Hotel' ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className={`flex items-center space-x-2 text-sm ${activeTeam === 'Team Hotel' ? 'text-blue-800' : 'text-orange-800'}`}>
              <Calendar size={16} />
              <span className="font-medium">Select export period</span>
            </div>
            <p className={`text-xs mt-1 ${activeTeam === 'Team Hotel' ? 'text-blue-600' : 'text-orange-600'}`}>
              Leave empty to export all data, or select a specific month
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Month (Optional)
            </label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder="Select month to filter export"
            />
            {selectedMonth && (
              <p className="mt-1 text-xs text-gray-600">
                Will export data for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportButton;