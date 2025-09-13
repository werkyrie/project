import React from 'react';
import { Building2, Zap, ChevronLeft, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import DashboardSection from './sections/DashboardSection';
import AgentsSection from './sections/AgentsSection';
import TikTokSection from './sections/TikTokSection';
import SearchSection from './sections/SearchSection';
import DepositsSection from './sections/DepositsSection';
import WithdrawalsSection from './sections/WithdrawalsSection';
import MobileHeader from './ui/MobileHeader';

const MainContent: React.FC = () => {
  const { activeSection, activeTeam, sidebarCollapsed } = useApp();
  const { t } = useLanguage();
  const [showTeamSwitcher, setShowTeamSwitcher] = React.useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'agents':
        return <AgentsSection />;
      case 'tiktok':
        return <TikTokSection />;
      case 'search':
        return <SearchSection />;
      case 'deposits':
        return <DepositsSection />;
      case 'withdrawals':
        return <WithdrawalsSection />;
      default:
        return <AgentsSection />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return t('dashboard.title');
      case 'agents':
        return t('agents.title');
      case 'tiktok':
        return t('app.tiktok');
      case 'search':
        return t('app.search');
      case 'deposits':
        return t('nav.deposits');
      case 'withdrawals':
        return t('nav.withdrawals');
      default:
        return t('dashboard.title');
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'tiktok':
        return (
          <img 
            src="/tiktok-logo.png" 
            alt="TikTok Logo"
            className="w-6 h-6 object-contain"
          />
        );
      case 'search':
        return (
          <img 
            src="/search-logo.png" 
            alt="Search Logo"
            className="w-6 h-6 object-contain"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen full-height transition-all duration-300 ${
      sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
    }`}>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader 
          title={getSectionTitle()}
          activeTeam={activeTeam}
          showTeamSwitcher={showTeamSwitcher}
          onToggleTeamSwitcher={() => setShowTeamSwitcher(!showTeamSwitcher)}
        />
      </div>

      {/* Header */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500 shadow-glow' : 'bg-secondary-500 shadow-glow-orange'} animate-pulse-subtle`}></div>
            {getSectionIcon()}
            <div>
              <h1 className={`text-3xl font-bold ${activeTeam === 'Team Hotel' ? 'text-gradient-primary' : 'text-gradient-secondary'}`}>
                {getSectionTitle()}
              </h1>
              <p className={`mt-1 text-sm font-medium ${activeTeam === 'Team Hotel' ? 'text-primary-600' : 'text-secondary-600'}`}>
                {t('team.currentlyManaging')}: <span className="font-bold">{activeTeam === 'Team Hotel' ? t('team.hotel') : t('team.hustle')}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-r ${activeTeam === 'Team Hotel' ? 'from-primary-500 to-primary-600 shadow-glow' : 'from-secondary-500 to-secondary-600 shadow-glow-orange'} text-white px-6 py-3 rounded-xl text-sm font-bold shadow-medium border border-white/20 backdrop-blur-sm`}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse-subtle"></div>
                <span>{t('team.active')}: {(activeTeam === 'Team Hotel' ? t('team.hotel') : t('team.hustle')).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Context Warning Bar */}
        <div className={`mt-4 px-5 py-3 rounded-xl ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200' : 'bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200'} backdrop-blur-sm transition-all duration-300`}>
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center space-x-3 ${activeTeam === 'Team Hotel' ? 'text-primary-800' : 'text-secondary-800'}`}>
              <div className={`w-5 h-5 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-primary-500' : 'bg-secondary-500'} flex items-center justify-center shadow-soft`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-semibold">
                {t('team.allDataEntries')} <strong>{activeTeam === 'Team Hotel' ? t('team.hotel') : t('team.hustle')}</strong>
              </span>
            </div>
            <div className={`text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-primary-600' : 'text-secondary-600'}`}>
              {t('team.switchTeams')}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`
        flex-1 overflow-auto scroll-smooth
        ${activeTeam === 'Team Hotel' ? 'bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30' : 'bg-gradient-to-br from-secondary-50/50 via-white to-secondary-50/30'} 
        min-h-screen
        p-4 lg:p-6
        pb-20 lg:pb-6
        transition-all duration-300
      `}>
        {renderSection()}
      </div>
    </div>
  );
};

export default MainContent;