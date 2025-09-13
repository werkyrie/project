import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  app?: 'TikTok' | 'Search';
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  showAppIcons?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  options, 
  label, 
  error, 
  showAppIcons = false,
  className = '', 
  ...props 
}) => {
  const { activeTeam } = useApp();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 text-sm font-medium
            border-2 border-neutral-200 rounded-xl bg-white text-neutral-900
            focus:ring-2 focus:ring-offset-0 ${activeTeam === 'Team Hotel' ? 'focus:ring-primary-500 focus:border-primary-500' : 'focus:ring-secondary-500 focus:border-secondary-500'}
            transition-all duration-200
            hover:border-neutral-300 hover:shadow-soft
            ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
            ${showAppIcons ? 'pl-12' : 'pl-4'}
            pr-10 appearance-none cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-neutral-900 bg-white">
              {showAppIcons && option.app ? `${option.app} - ${option.label}` : option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown size={18} className="text-neutral-400" />
        </div>
        
        {/* Show app icon for selected option */}
        {showAppIcons && props.value && (
          (() => {
            const selectedOption = options.find(opt => opt.value === props.value);
            if (selectedOption?.app) {
              const iconSrc = selectedOption.app === 'TikTok' 
                ? '/Tiktok logo.png' 
                : '/Search logo HD.png';
              return (
                <img 
                  src={iconSrc} 
                  alt={`${selectedOption.app} Logo`}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 object-contain pointer-events-none"
                />
              );
            }
            return null;
          })()
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;