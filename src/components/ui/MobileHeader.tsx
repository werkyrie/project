import React from 'react';
import { ChevronDown, Menu, Bell, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileHeaderProps {
  title: string;
  activeTeam: 'Team Hotel' | 'Team Hustle';
  showTeamSwitcher: boolean;
  onToggleTeamSwitcher: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  activeTeam,
  showTeamSwitcher,
  onToggleTeamSwitcher
}) => {
  const { setActiveTeam } = useApp();
  const { t } = useLanguage();

  const handleTeamSwitch = (team: 'Team Hotel' | 'Team Hustle') => {
    setActiveTeam(team);
    onToggleTeamSwitcher();
  };

  return (
    <>
      {/* Main Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200/50 px-4 py-3 shadow-soft sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activeTeam === 'Team Hotel' ? 'bg-primary-500' : 'bg-secondary-500'
            } shadow-soft`}>
              <span className="text-white font-bold text-sm">
                {activeTeam === 'Team Hotel' ? 'H' : 'S'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900 truncate max-w-[200px]">
                {title}
              </h1>
              <button
                onClick={onToggleTeamSwitcher}
                className={`
                  flex items-center space-x-1 text-xs font-medium
                  ${activeTeam === 'Team Hotel' ? 'text-primary-600' : 'text-secondary-600'}
                  hover:opacity-80 transition-all duration-200 touch-target haptic-light
                `}
              >
                <span>{activeTeam === 'Team Hotel' ? t('team.hotel') : t('team.hustle')}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 ${showTeamSwitcher ? 'rotate-180' : ''}`} 
                />
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors touch-target haptic-light">
              <Search size={20} className="text-neutral-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors touch-target haptic-light relative">
              <Bell size={20} className="text-neutral-600" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-subtle"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Team Switcher Dropdown */}
      {showTeamSwitcher && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-30 animate-fade-in"
            onClick={onToggleTeamSwitcher}
          />
          
          {/* Dropdown */}
          <div className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-strong border border-neutral-200 z-40 overflow-hidden animate-scale-in">
            <div className="p-2">
              <button
                onClick={() => handleTeamSwitch('Team Hotel')}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 touch-target haptic-medium
                  ${activeTeam === 'Team Hotel' 
                    ? 'bg-primary-50 border border-primary-200' 
                    : 'hover:bg-neutral-50'
                  }
                `}
              >
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold">H</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-neutral-900">{t('team.hotelFull')}</div>
                  <div className="text-xs text-neutral-500">Business operations team</div>
                </div>
                {activeTeam === 'Team Hotel' && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-subtle"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTeamSwitch('Team Hustle')}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 touch-target haptic-medium
                  ${activeTeam === 'Team Hustle' 
                    ? 'bg-secondary-50 border border-secondary-200' 
                    : 'hover:bg-neutral-50'
                  }
                `}
              >
                <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold">S</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-neutral-900">{t('team.hustleFull')}</div>
                  <div className="text-xs text-neutral-500">Growth and expansion team</div>
                </div>
                {activeTeam === 'Team Hustle' && (
                  <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse-subtle"></div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileHeader;