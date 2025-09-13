import React, { useMemo } from 'react';
import { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Crown,
  Star,
  UserCheck,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import { exportToCSV, formatTransactionForExport, getMonthName } from '../../utils/exportUtils';

const DashboardSection: React.FC = () => {
  const { agents, shops, transactions, activeTeam } = useApp();
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('');

  // Filter data based on selected month and team
  const filteredData = useMemo(() => {
    let filteredTransactions = transactions;
    let filteredShops = shops;
    let filteredAgents = agents;

    // Filter by month
    if (selectedMonth) {
      filteredTransactions = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7);
        return transactionMonth === selectedMonth;
      });
      
      filteredShops = shops.filter(shop => {
        const shopMonth = new Date(shop.kycDate).toISOString().slice(0, 7);
        return shopMonth === selectedMonth;
      });
    }

    // Filter by team
    if (selectedTeamFilter) {
      filteredTransactions = filteredTransactions.filter(t => t.team === selectedTeamFilter);
      filteredShops = filteredShops.filter(s => s.team === selectedTeamFilter);
      filteredAgents = filteredAgents.filter(a => a.team === selectedTeamFilter);
    }

    return {
      transactions: filteredTransactions,
      shops: filteredShops,
      agents: filteredAgents
    };
  }, [transactions, shops, agents, selectedMonth, selectedTeamFilter]);
  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const hotelAgents = filteredData.agents.filter(a => a.team === 'Team Hotel');
    const hustleAgents = filteredData.agents.filter(a => a.team === 'Team Hustle');
    const hotelShops = filteredData.shops.filter(s => s.team === 'Team Hotel');
    const hustleShops = filteredData.shops.filter(s => s.team === 'Team Hustle');
    const hotelTransactions = filteredData.transactions.filter(t => t.team === 'Team Hotel');
    const hustleTransactions = filteredData.transactions.filter(t => t.team === 'Team Hustle');

    const hotelDeposits = hotelTransactions.filter(t => t.type === 'deposit');
    const hotelWithdrawals = hotelTransactions.filter(t => t.type === 'withdrawal');
    const hustleDeposits = hustleTransactions.filter(t => t.type === 'deposit');
    const hustleWithdrawals = hustleTransactions.filter(t => t.type === 'withdrawal');

    const hotelDepositAmount = hotelDeposits.reduce((sum, t) => sum + t.amount, 0);
    const hotelWithdrawalAmount = hotelWithdrawals.reduce((sum, t) => sum + t.amount, 0);
    const hustleDepositAmount = hustleDeposits.reduce((sum, t) => sum + t.amount, 0);
    const hustleWithdrawalAmount = hustleWithdrawals.reduce((sum, t) => sum + t.amount, 0);

    const tiktokShops = filteredData.shops.filter(s => s.app === 'TikTok');
    const searchShops = filteredData.shops.filter(s => s.app === 'Search');
    const tiktokTransactions = filteredData.transactions.filter(t => t.app === 'TikTok');
    const searchTransactions = filteredData.transactions.filter(t => t.app === 'Search');

    return {
      teams: {
        hotel: {
          agents: hotelAgents.length,
          shops: hotelShops.length,
          deposits: hotelDepositAmount,
          withdrawals: hotelWithdrawalAmount,
          net: hotelDepositAmount - hotelWithdrawalAmount,
          transactions: hotelTransactions.length
        },
        hustle: {
          agents: hustleAgents.length,
          shops: hustleShops.length,
          deposits: hustleDepositAmount,
          withdrawals: hustleWithdrawalAmount,
          net: hustleDepositAmount - hustleWithdrawalAmount,
          transactions: hustleTransactions.length
        }
      },
      apps: {
        tiktok: {
          shops: tiktokShops.length,
          transactions: tiktokTransactions.length,
          amount: tiktokTransactions.reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)
        },
        search: {
          shops: searchShops.length,
          transactions: searchTransactions.length,
          amount: searchTransactions.reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)
        }
      },
      overall: {
        totalAgents: filteredData.agents.length,
        totalShops: filteredData.shops.length,
        totalDeposits: hotelDepositAmount + hustleDepositAmount,
        totalWithdrawals: hotelWithdrawalAmount + hustleWithdrawalAmount,
        totalTransactions: filteredData.transactions.length,
        netAmount: (hotelDepositAmount + hustleDepositAmount) - (hotelWithdrawalAmount + hustleWithdrawalAmount)
      }
    };
  }, [filteredData]);

  // Position breakdown
  const positionStats = useMemo(() => {
    const positions = filteredData.agents.reduce((acc, agent) => {
      acc[agent.position] = (acc[agent.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return positions;
  }, [filteredData.agents]);

  // Recent activity (last 10 transactions)
  const recentActivity = useMemo(() => {
    return filteredData.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [filteredData.transactions]);

  // Top performing agents
  const topAgents = useMemo(() => {
    const agentStats = filteredData.agents.map(agent => {
      const agentTransactions = filteredData.transactions.filter(t => t.agent === agent.name);
      const deposits = agentTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
      const withdrawals = agentTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
      return {
        ...agent,
        totalTransactions: agentTransactions.length,
        netAmount: deposits - withdrawals,
        deposits,
        withdrawals
      };
    }).sort((a, b) => b.netAmount - a.netAmount).slice(0, 5);
    
    return agentStats;
  }, [filteredData.agents, filteredData.transactions]);

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Team Leader': return <Crown size={16} className="text-yellow-600" />;
      case 'Elite Chatter': return <Star size={16} className="text-purple-600" />;
      case 'Regular Chatter': return <UserCheck size={16} className="text-blue-600" />;
      case 'Spammer': return <Zap size={16} className="text-red-600" />;
      case 'Model': return <Users size={16} className="text-pink-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedTeamFilter('');
  };

  const handleExportAllTransactions = (month: string) => {
    let dataToExport = filteredData.transactions;
    
    if (month) {
      dataToExport = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7);
        return transactionMonth === month;
      });
    }

    const formattedData = dataToExport.map(formatTransactionForExport);
    const monthName = getMonthName(month);
    const teamFilter = selectedTeamFilter || 'All_Teams';
    const filename = `${teamFilter}_All_Transactions_${monthName.replace(/\s+/g, '_')}.csv`;
    
    exportToCSV(formattedData, filename);
  };

  const handleExportTeamTransactions = (team: 'Team Hotel' | 'Team Hustle', month: string) => {
    let dataToExport = transactions.filter(t => t.team === team);
    
    if (month) {
      dataToExport = dataToExport.filter(transaction => {
        const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7);
        return transactionMonth === month;
      });
    }

    const formattedData = dataToExport.map(formatTransactionForExport);
    const monthName = getMonthName(month);
    const filename = `${team}_All_Transactions_${monthName.replace(/\s+/g, '_')}.csv`;
    
    exportToCSV(formattedData, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-8 text-white shadow-strong border border-primary-500/20 relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">{t('dashboard.businessDashboard')}</h1>
            <p className="text-primary-100 font-medium">
              {t('dashboard.completeOverview')}
              {selectedMonth && (
                <span className="ml-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold">
                  {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {selectedTeamFilter && (
                <span className="ml-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold">
                  {selectedTeamFilter}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-6 relative z-10">
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">${stats.overall.netAmount.toLocaleString()}</div>
              <div className="text-primary-200 font-medium">{t('dashboard.netAmount')}</div>
            </div>
            <div className="flex flex-col space-y-2">
              <ExportButton 
                onExport={handleExportAllTransactions}
                label={t('dashboard.exportAll')}
                disabled={filteredData.transactions.length === 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-soft border border-neutral-200 p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center">
            <Filter size={20} className="mr-2" />
            {t('dashboard.filters')}
          </h3>
          {(selectedMonth || selectedTeamFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-neutral-600 hover:text-neutral-800 underline font-medium transition-colors duration-200"
            >
              {t('dashboard.clearFilters')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('dashboard.filterByMonth')}</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('dashboard.filterByTeam')}</label>
            <Select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              options={[
                { value: '', label: t('dashboard.allTeams') },
                { value: 'Team Hotel', label: t('team.hotelFull') },
                { value: 'Team Hustle', label: t('team.hustleFull') }
              ]}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-4 w-full border border-neutral-200">
              <div className="text-sm text-neutral-600">
                {selectedMonth || selectedTeamFilter ? (
                  <>
                    <div className="font-semibold text-neutral-900 mb-1">{t('dashboard.activeFilters')}</div>
                    {selectedMonth && (
                      <div className="font-medium">📅 {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    )}
                    {selectedTeamFilter && (
                      <div className="font-medium">👥 {selectedTeamFilter}</div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-neutral-500 font-medium">{t('dashboard.noFilters')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="mobile-grid mobile-grid-1 sm:mobile-grid-2 lg:mobile-grid-4 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-soft border border-neutral-200 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">{t('dashboard.totalAgents')}</p>
              <p className="text-3xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-300">{stats.overall.totalAgents}</p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                {selectedTeamFilter ? `${t('dashboard.inTeam')} ${selectedTeamFilter}` : t('dashboard.acrossBothTeams')}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <Users size={26} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">{t('dashboard.totalShops')}</p>
              <p className="text-3xl font-bold text-neutral-900 group-hover:text-success-600 transition-colors duration-300">{stats.overall.totalShops}</p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                {selectedMonth ? t('dashboard.createdInMonth') : t('dashboard.combined')}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <Target size={26} className="text-success-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">{t('dashboard.totalDeposits')}</p>
              <p className="text-3xl font-bold text-success-600 group-hover:text-success-700 transition-colors duration-300">+${stats.overall.totalDeposits.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                {selectedMonth ? t('dashboard.forSelectedMonth') : t('dashboard.allTimeDeposits')}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <TrendingUp size={26} className="text-success-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">{t('dashboard.totalWithdrawals')}</p>
              <p className="text-3xl font-bold text-error-600 group-hover:text-error-700 transition-colors duration-300">-${stats.overall.totalWithdrawals.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                {selectedMonth ? t('dashboard.forSelectedMonth') : t('dashboard.allTimeWithdrawals')}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-error-100 to-error-200 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <TrendingDown size={26} className="text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="mobile-grid mobile-grid-1 lg:mobile-grid-2 animate-slide-up">
        {/* Team Hotel */}
        <div className="mobile-card border-primary-200 overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-soft">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">{t('team.hotelFull')}</h3>
                </div>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse-subtle relative z-10"></div>
            </div>
          </div>
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            <div className="mobile-grid mobile-grid-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.teams.hotel.agents}</div>
                <div className="text-sm text-neutral-600 font-medium">{t('dashboard.agents')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.teams.hotel.shops}</div>
                <div className="text-sm text-neutral-600 font-medium">{t('dashboard.shops')}</div>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600 font-medium">{t('dashboard.deposits')}</span>
                <span className="font-bold text-success-600">+${stats.teams.hotel.deposits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600 font-medium">{t('dashboard.withdrawals')}</span>
                <span className="font-bold text-error-600">-${stats.teams.hotel.withdrawals.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-700">{t('dashboard.netAmount')}</span>
                <span className={`font-bold text-lg ${stats.teams.hotel.net >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {stats.teams.hotel.net >= 0 ? '+' : ''}${stats.teams.hotel.net.toLocaleString()}
                </span>
              </div>
              <div className="pt-4 border-t border-neutral-200 mt-4">
                <ExportButton 
                  onExport={(month) => handleExportTeamTransactions('Team Hotel', month)}
                  label={t('dashboard.exportTeamHotel')}
                  disabled={stats.teams.hotel.transactions === 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Hustle */}
        <div className="mobile-card border-secondary-200 overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-soft">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-secondary-100 bg-clip-text text-transparent">{t('team.hustleFull')}</h3>
                </div>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse-subtle relative z-10"></div>
            </div>
          </div>
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            <div className="mobile-grid mobile-grid-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">{stats.teams.hustle.agents}</div>
                <div className="text-sm text-neutral-600 font-medium">{t('dashboard.agents')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">{stats.teams.hustle.shops}</div>
                <div className="text-sm text-neutral-600 font-medium">{t('dashboard.shops')}</div>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600 font-medium">{t('dashboard.deposits')}</span>
                <span className="font-bold text-success-600">+${stats.teams.hustle.deposits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600 font-medium">{t('dashboard.withdrawals')}</span>
                <span className="font-bold text-error-600">-${stats.teams.hustle.withdrawals.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-700">{t('dashboard.netAmount')}</span>
                <span className={`font-bold text-lg ${stats.teams.hustle.net >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {stats.teams.hustle.net >= 0 ? '+' : ''}${stats.teams.hustle.net.toLocaleString()}
                </span>
              </div>
              <div className="pt-4 border-t border-neutral-200 mt-4">
                <ExportButton 
                  onExport={(month) => handleExportTeamTransactions('Team Hustle', month)}
                  label={t('dashboard.exportTeamHustle')}
                  disabled={stats.teams.hustle.transactions === 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Performance & Position Breakdown */}
      <div className="mobile-grid mobile-grid-1 lg:mobile-grid-2">
        {/* App Performance */}
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            {t('dashboard.appPerformance')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center space-x-3">
                <img src="/Tiktok logo.png" alt="TikTok" className="w-8 h-8 object-contain" />
                <div>
                  <div className="font-semibold text-gray-900">TikTok</div>
                  <div className="text-sm text-gray-600">{stats.apps.tiktok.shops} {t('dashboard.shops')} • {stats.apps.tiktok.transactions} {t('dashboard.transactions')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${stats.apps.tiktok.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.apps.tiktok.amount >= 0 ? '+' : ''}${stats.apps.tiktok.amount.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <img src="/Search logo HD.png" alt="Search" className="w-8 h-8 object-contain" />
                <div>
                  <div className="font-semibold text-gray-900">Search</div>
                  <div className="text-sm text-gray-600">{stats.apps.search.shops} {t('dashboard.shops')} • {stats.apps.search.transactions} {t('dashboard.transactions')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${stats.apps.search.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.apps.search.amount >= 0 ? '+' : ''}${stats.apps.search.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Position Breakdown */}
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart size={20} className="mr-2" />
            {t('dashboard.agentPositions')}
          </h3>
          <div className="space-y-3">
            {Object.entries(positionStats).map(([position, count]) => (
              <div key={position} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPositionIcon(position)}
                  <span className="text-sm font-medium text-gray-700">{position}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.overall.totalAgents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers & Recent Activity */}
      <div className="mobile-grid mobile-grid-1 lg:mobile-grid-2">
        {/* Top Performing Agents */}
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Award size={20} className="mr-2" />
            {t('dashboard.topPerformers')}
          </h3>
          <div className="space-y-3">
            {topAgents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('dashboard.noAgentsWithTransactions')}</p>
            ) : (
              topAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-600">{agent.team} • {agent.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${agent.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {agent.netAmount >= 0 ? '+' : ''}${agent.netAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{agent.totalTransactions} {t('dashboard.transactions')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity size={20} className="mr-2" />
            {t('dashboard.recentActivity')}
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto scroll-smooth">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('dashboard.noRecentTransactions')}</p>
            ) : (
              recentActivity.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-l-4 border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' ? 
                        <TrendingUp size={16} className="text-green-600" /> : 
                        <TrendingDown size={16} className="text-red-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.agent}</div>
                      <div className="text-xs text-gray-600 flex items-center space-x-2">
                        <img 
                          src={transaction.app === 'TikTok' ? '/Tiktok logo.png' : '/Search logo HD.png'} 
                          alt={transaction.app}
                          className="w-3 h-3 object-contain"
                        />
                        <span>{transaction.shopId}</span>
                        <span>•</span>
                        <span>{transaction.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;