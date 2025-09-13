import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from './Button';
import Modal from './Modal';

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

interface ImportButtonProps {
  onImport: (data: any[]) => Promise<ImportResult>;
  label: string;
  templateHeaders: string[];
  sampleData?: string[][];
  disabled?: boolean;
}

const ImportButton: React.FC<ImportButtonProps> = ({ 
  onImport, 
  label, 
  templateHeaders,
  sampleData = [],
  disabled = false 
}) => {
  const { activeTeam } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      templateHeaders.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${label.replace(/\s+/g, '_')}_Template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Remove header row
      const dataRows = rows.slice(1);
      
      if (dataRows.length === 0) {
        throw new Error('No data rows found in CSV file');
      }

      // Convert rows to objects based on headers
      const data = dataRows.map((row, index) => {
        const obj: any = {};
        templateHeaders.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        obj._rowIndex = index + 2; // +2 because we start from row 2 (after header)
        return obj;
      });

      const result = await onImport(data);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: []
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setImportResult(null);
  };

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        variant="outline" 
        disabled={disabled}
        className="flex items-center space-x-2"
      >
        <Upload size={16} />
        <span>{label}</span>
      </Button>

      <Modal 
        isOpen={showModal} 
        onClose={closeModal} 
        title={`Import ${label}`}
      >
        <div className="space-y-6">
          {/* Instructions */}
          <div className={`p-4 rounded-lg ${activeTeam === 'Team Hotel' ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className={`flex items-center space-x-2 text-sm ${activeTeam === 'Team Hotel' ? 'text-blue-800' : 'text-orange-800'}`}>
              <Upload size={16} />
              <span className="font-medium">{t('import.instructions')}</span>
            </div>
            <div className={`text-xs mt-2 space-y-1 ${activeTeam === 'Team Hotel' ? 'text-blue-600' : 'text-orange-600'}`}>
              <p>{t('import.step1')}</p>
              <p>{t('import.step2')}</p>
              <p>{t('import.step3')}</p>
              <p>{t('import.step4')} <strong>{activeTeam}</strong></p>
            </div>
          </div>

          {/* Template Download */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('import.downloadTemplateTitle')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('import.downloadTemplateDesc')}
            </p>
            <Button variant="outline" onClick={downloadTemplate}>
              {t('import.downloadTemplate')}
            </Button>
          </div>

          {/* File Upload */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('import.uploadDataTitle')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('import.uploadDataDesc')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={importing}
            />
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm text-gray-600">{t('import.importing')}</span>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              {importResult.success > 0 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 mr-3" />
                  <span className="text-sm text-green-800">
                    {t('import.successMessage', { count: importResult.success.toString() })}
                  </span>
                </div>
              )}

              {importResult.warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle size={20} className="text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">{t('import.warnings')}:</span>
                  </div>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <X size={20} className="text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">{t('import.errors')}:</span>
                  </div>
                  <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={closeModal}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportButton;