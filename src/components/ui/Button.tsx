import React from 'react';
import { useApp } from '../../context/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const { activeTeam } = useApp();

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden group';
  
  const variantClasses = {
    primary: `bg-gradient-to-r ${activeTeam === 'Team Hotel' ? 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-glow' : 'from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-500 shadow-glow-orange'} text-white shadow-medium hover:shadow-strong transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700`,
    outline: 'border-2 border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-soft focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:shadow-soft transform hover:-translate-y-0.5 active:translate-y-0'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
    </button>
  );
};

export default Button;