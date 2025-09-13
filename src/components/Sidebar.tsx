import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Building2,
  Zap,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './ui/LanguageSwitcher';
import MobileBottomNav from './ui/MobileBottomNav';

const Sidebar: React.FC = () => {
  const { 
    activeTeam, 
    setActiveTeam, 
    activeSection, 
    setActiveSection,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useApp();
  
  const { t } = useLanguage();
  
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
    'Team Hotel': true,
    'Team Hustle': false,
  });
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(true);

  // Handle scroll to hide/show mobile navigation
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setShowMobileNav(!scrollingDown || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleTeam = (team: 'Team Hotel' | 'Team Hustle') => {
    setExpandedTeams(prev => {
      const isCurrentlyExpanded = prev[team];
      
      if (isCurrentlyExpanded) {
        // If clicking on already expanded team, just close it
        return {
          ...prev,
          [team]: false
        };
      } else {
        // If opening a team, close the other one
        return {
          'Team Hotel': team === 'Team Hotel',
          'Team Hustle': team === 'Team Hustle'
        };
      }
    });
  };

  const handleSectionClick = (section: string, team: 'Team Hotel' | 'Team Hustle') => {
    setActiveTeam(team);
    setActiveSection(section);
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };

  const menuItems = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { key: 'agents', label: t('nav.agents'), icon: Users },
    { 
      key: 'tiktok', 
      label: t('nav.tiktok'), 
      icon: () => (
        <img 
          src="/tiktok-logo.png" 
          alt="TikTok Logo"
          className="w-5 h-5 object-contain flex-shrink-0"
        />
      )
    },
    { 
      key: 'search', 
      label: t('nav.search'), 
      icon: () => (
        <img 
          src="/search-logo.png" 
          alt="Search Logo"
          className="w-5 h-5 object-contain flex-shrink-0"
        />
      )
    },
    { key: 'deposits', label: t('nav.deposits'), icon: TrendingUp },
    { key: 'withdrawals', label: t('nav.withdrawals'), icon: TrendingDown },
  ];

  const teams = ['Team Hotel', 'Team Hustle'] as const;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav 
          menuItems={menuItems}
          activeSection={activeSection}
          activeTeam={activeTeam}
          onSectionClick={handleSectionClick}
          show={showMobileNav}
        />
      </div>

      {/* Mobile overlay */}
      {!sidebarCollapsed && window.innerWidth >= 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        hidden lg:flex fixed lg:relative inset-y-0 left-0 z-30
        transform ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-80 lg:w-16' : 'w-80'} 
        bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 text-white 
        flex-col shadow-strong border-r border-neutral-700
      `}>
        {/* Header */}
        <div className={`${sidebarCollapsed ? 'p-3 lg:p-2' : 'p-6'} border-b border-neutral-700/50 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div className={`${sidebarCollapsed ? 'hidden lg:flex lg:justify-center lg:w-full' : 'flex'} items-center space-x-3`}>
              <div className={`${sidebarCollapsed ? 'w-8 h-8 lg:w-10 lg:h-10' : 'w-12 h-12'} bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow relative overflow-hidden transition-all duration-300 hover:scale-110`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="text-xl font-bold relative z-10">M</span>
              </div>
              <div className={`${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-transparent">{t('nav.management')}</h1>
                <p className="text-neutral-400 text-sm font-medium">{t('nav.dashboard')}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 hover:bg-neutral-700/50 rounded-lg transition-all duration-200 hover:scale-110 touch-target haptic-light ${sidebarCollapsed ? 'lg:absolute lg:top-2 lg:right-2' : ''}`}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto scroll-smooth ${sidebarCollapsed ? 'py-2' : 'py-6'} scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent`}>
          <nav className={`space-y-2 ${sidebarCollapsed ? 'px-1' : 'px-4'}`}>
            {teams.map((team) => (
              <div key={team} className="mb-4">
                <button
                  onClick={() => toggleTeam(team)}
                  className={`
                    w-full flex items-center ${sidebarCollapsed ? 'justify-center lg:p-2' : 'justify-between p-3'} rounded-lg
                    transition-all duration-300 font-semibold group relative overflow-hidden touch-target haptic-medium
                    ${activeTeam === team 
                      ? `bg-gradient-to-r ${team === 'Team Hotel' ? 'from-primary-500 to-primary-600 shadow-glow' : 'from-secondary-500 to-secondary-600 shadow-glow-orange'} text-white shadow-medium ${sidebarCollapsed ? '' : 'border border-white/20'}` 
                      : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white hover:shadow-soft hover:scale-105'
                    }
                  `}
                  title={sidebarCollapsed ? (team === 'Team Hotel' ? t('team.hotelFull') : t('team.hustleFull')) : ''}
                >
                  {activeTeam !== team && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  )}
                  <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-2'}`}>
                    <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-8 h-8'} rounded-lg flex items-center justify-center ${activeTeam === team ? 'bg-white/20 backdrop-blur-sm' : 'bg-neutral-600'} transition-all duration-300 group-hover:scale-110`}>
                      {team === 'Team Hotel' ? (
                        <Building2 size={sidebarCollapsed ? 20 : 18} className={activeTeam === team ? 'text-white' : 'text-neutral-400'} />
                      ) : (
                        <Zap size={sidebarCollapsed ? 20 : 18} className={activeTeam === team ? 'text-white' : 'text-neutral-400'} />
                      )}
                    </div>
                    <div className={`${sidebarCollapsed ? 'hidden' : 'flex flex-col items-start'}`}>
                      <span className="font-bold text-sm">{t(team === 'Team Hotel' ? 'team.hotelFull' : 'team.hustleFull')}</span>
                    </div>
                    {activeTeam === team && !sidebarCollapsed && (
                      <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-semibold animate-pulse-subtle elastic-in">{t('team.active')}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && !sidebarCollapsed && (
                    <div className="transition-transform duration-300">
                      {expandedTeams[team] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {expandedTeams[team] && !sidebarCollapsed && (
                  <div className="mt-3 space-y-1 animate-slide-up elastic-in">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.key && activeTeam === team;
                      
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleSectionClick(item.key, team)}
                          className={`
                            w-full flex items-center space-x-3 p-3 pl-8 rounded-lg touch-target
                            transition-all duration-300 text-left group relative overflow-hidden haptic-light
                            ${isActive
                              ? `${activeTeam === 'Team Hotel' ? 'bg-primary-600 shadow-glow' : 'bg-secondary-600 shadow-glow-orange'} text-white shadow-medium transform translate-x-1 scale-105`
                              : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white hover:transform hover:translate-x-1 hover:shadow-soft hover:scale-105'
                            }
                          `}
                        >
                          {!isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                          )}
                          <div className="flex-shrink-0">
                            <Icon size={16} />
                          </div>
                          <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-neutral-700/50 backdrop-blur-sm transition-all duration-300`}>
          {/* Language Switcher */}
          <div className={`${sidebarCollapsed ? 'flex justify-center mb-3' : 'mb-4'} transition-all duration-300`}>
            <LanguageSwitcher />
          </div>
          
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 hover:bg-neutral-700/50 transition-all duration-300 group hover:scale-105 cursor-pointer`}>
            <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-success-400 to-primary-500 rounded-full flex items-center justify-center shadow-soft relative status-online transition-all duration-300 group-hover:scale-110`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              <span className="text-sm font-bold relative z-10">A</span>
            </div>
            <div className={`${sidebarCollapsed ? 'hidden' : 'flex-1'}`}>
              <p className="text-sm font-semibold text-white">{t('common.admin')}</p>
              <p className="text-xs text-neutral-400 font-medium">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarCollapsed(false)}
        className={`
          hidden lg:block fixed top-4 left-4 z-40 p-3 bg-neutral-900 text-white rounded-xl
          shadow-strong ${sidebarCollapsed ? 'block' : 'hidden'}
          hover:bg-neutral-800 transition-all duration-300 hover:scale-110 hover:shadow-glow touch-target haptic-medium
        `}
      >
        <Menu size={20} />
      </button>
    </>
  );
};

export default Sidebar;