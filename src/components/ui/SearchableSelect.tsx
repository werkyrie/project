import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectOption {
  value: string;
  label: string;
  app?: 'TikTok' | 'Search';
  agent?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showAppIcons?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Type to search...",
  required = false,
  showAppIcons = false
}) => {
  const { activeTeam } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    if (selectedOption) {
      setDisplayValue(selectedOption.label);
      setSearchTerm(selectedOption.label);
    } else if (value) {
      // If value is set but not found in options (user typed a shop ID), show the value
      setDisplayValue(value);
      setSearchTerm(value);
    } else {
      setDisplayValue('');
      setSearchTerm('');
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.agent && option.agent.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something that's not in options, treat it as a direct shop ID input
        if (searchTerm && !options.find(opt => opt.value === searchTerm || opt.label === searchTerm)) {
          onChange(searchTerm);
          setDisplayValue(searchTerm);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchTerm, options, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setDisplayValue(newValue);
    setIsOpen(true);
    
    // If user is typing a shop ID directly, update the value immediately
    onChange(newValue);
  };

  const handleOptionSelect = (option: SearchableSelectOption) => {
    setSearchTerm(option.label);
    setDisplayValue(option.label);
    onChange(option.value);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const getAppIcon = (app?: 'TikTok' | 'Search') => {
    if (!app || !showAppIcons) return null;
    const iconSrc = app === 'TikTok' ? '/Tiktok logo.png' : '/Search logo HD.png';
    return (
      <img 
        src={iconSrc} 
        alt={`${app} Logo`}
        className="w-4 h-4 object-contain"
      />
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          className={`
            w-full pl-10 pr-10 py-3 text-sm font-medium text-neutral-900
            border-2 border-neutral-200 rounded-xl bg-white
            focus:ring-2 focus:ring-offset-0 ${activeTeam === 'Team Hotel' ? 'focus:ring-primary-500 focus:border-primary-500' : 'focus:ring-secondary-500 focus:border-secondary-500'}
            transition-all duration-200
            placeholder:text-neutral-400 placeholder:font-normal
            hover:border-neutral-300 hover:shadow-soft
          `}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-strong max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">
              {searchTerm ? `No shops found matching "${searchTerm}"` : 'No shops available'}
              {searchTerm && (
                <div className="mt-1 text-xs text-neutral-400">
                  Press Enter or click outside to use "{searchTerm}" as Shop ID
                </div>
              )}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none transition-colors duration-150 border-b border-neutral-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAppIcon(option.app)}
                    <div>
                      <div className="font-medium text-neutral-900">{option.value}</div>
                      {option.agent && (
                        <div className="text-xs text-neutral-500">{option.agent}</div>
                      )}
                    </div>
                  </div>
                  {option.app && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      option.app === 'TikTok' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {option.app}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;