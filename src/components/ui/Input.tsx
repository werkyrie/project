import React from 'react';
import { useApp } from '../../context/AppContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
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
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full ${icon ? 'pl-10 pr-4' : 'px-4'} py-3 text-sm font-medium
            border-2 border-neutral-200 rounded-xl bg-white text-neutral-900
            focus:ring-2 focus:ring-offset-0 ${activeTeam === 'Team Hotel' ? 'focus:ring-primary-500 focus:border-primary-500' : 'focus:ring-secondary-500 focus:border-secondary-500'}
            transition-all duration-200
            placeholder:text-neutral-400 placeholder:font-normal
            hover:border-neutral-300 hover:shadow-soft
            ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;