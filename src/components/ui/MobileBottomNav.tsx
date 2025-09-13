import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon | (() => JSX.Element);
}

interface MobileBottomNavProps {
  menuItems: MenuItem[];
  activeSection: string;
  activeTeam: 'Team Hotel' | 'Team Hustle';
  onSectionClick: (section: string, team: 'Team Hotel' | 'Team Hustle') => void;
  show: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  menuItems,
  activeSection,
  activeTeam,
  onSectionClick,
  show
}) => {
  const { sidebarCollapsed } = useApp();

  return (
    <div className={`
      mobile-nav ${show ? '' : 'hidden'}
      transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? 'translate-y-0' : 'translate-y-0'}
    `}>
      <div className="flex items-center justify-around px-2">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => onSectionClick(item.key, activeTeam)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-xl
                transition-all duration-300 touch-target haptic-light
                ${isActive
                  ? `${activeTeam === 'Team Hotel' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-secondary-100 text-secondary-600'
                    } scale-110 shadow-soft`
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95'
                }
              `}
            >
              <div className={`
                transition-all duration-300
                ${isActive ? 'scale-110' : 'scale-100'}
              `}>
                <Icon size={20} />
              </div>
              <span className={`
                text-xs font-medium mt-1 transition-all duration-300
                ${isActive ? 'opacity-100' : 'opacity-70'}
              `}>
                {item.label}
              </span>
              {isActive && (
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1
                  w-1 h-1 rounded-full
                  ${activeTeam === 'Team Hotel' ? 'bg-primary-500' : 'bg-secondary-500'}
                  animate-pulse-subtle
                `} />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Team indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`
          px-3 py-1 rounded-full text-xs font-semibold text-white
          ${activeTeam === 'Team Hotel' 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
            : 'bg-gradient-to-r from-secondary-500 to-secondary-600'
          }
          shadow-soft animate-pulse-subtle
        `}>
          {activeTeam === 'Team Hotel' ? 'Hotel' : 'Hustle'}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;