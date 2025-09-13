import React, { useMemo, useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { useApp, Transaction } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Pagination from '../ui/Pagination';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import { exportToCSV, formatTransactionForExport, getMonthName } from '../../utils/exportUtils';

interface AgentTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

const AgentTransactionsModal: React.FC<AgentTransactionsModalProps> = ({ 
  isOpen, 
  onClose, 
  agentName 
}) => {
  const { transactions, activeTeam } = useApp();
  const [selectedType, setSelectedType] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const agentTransactions = useMemo(() => 
    transactions.filter(transaction => 
      transaction.agent === agentName && 
      transaction.team === activeTeam
    )
  , [transactions, agentName, activeTeam]);

  const filteredTransactions = useMemo(() => {
    let filtered = agentTransactions;

    if (selectedType) {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    if (selectedApp) {
      filtered = filtered.filter(transaction => transaction.app === selectedApp);
    }

    if (selectedMonth) {
      filtered = filtered.filter(transaction => {
        const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7);
        return transactionMonth === selectedMonth;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [agentTransactions, selectedType, selectedApp, selectedMonth]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const stats = useMemo(() => {
    const deposits = agentTransactions.filter(t => t.type === 'deposit');
    const withdrawals = agentTransactions.filter(t => t.type === 'withdrawal');
    
    return {
      totalTransactions: agentTransactions.length,
      totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
      depositsCount: deposits.length,
      withdrawalsCount: withdrawals.length,
    };
  }, [agentTransactions]);

  const getAppBadge = (app: 'TikTok' | 'Search') => (
    <div className="flex items-center space-x-2">
      <img 
        src={app === 'TikTok' ? '/Tiktok logo.png' : '/Search logo HD.png'} 
        alt={`${app} Logo`}
        className="w-4 h-4 object-contain"
      />
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        app === 'TikTok' 
          ? 'bg-pink-100 text-pink-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {app}
      </span>
    </div>
  );

  const getTypeBadge = (type: 'deposit' | 'withdrawal', amount: number) => (
    <div className={`flex items-center space-x-1 ${
      type === 'deposit' ? 'text-green-600' : 'text-red-600'
    }`}>
      {type === 'deposit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span className="font-semibold">
        {type === 'deposit' ? '+' : '-'}${amount.toLocaleString()}
      </span>
    </div>
  );
  const handleExportAgentTransactions = (month: string) => {
    let dataToExport = agentTransactions;
    
    if (month) {
      dataToExport = agentTransactions.filter(transaction => {
        const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7);
        return transactionMonth === month;
      });
    }

    const formattedData = dataToExport.map(formatTransactionForExport);
    const monthName = getMonthName(month);
    const filename = `${agentName}_${activeTeam}_Transactions_${monthName.replace(/\s+/g, '_')}.csv`;
    
    exportToCSV(formattedData, filename);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${activeTeam === 'Team Hotel' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${activeTeam === 'Team Hotel' ? 'text-blue-900' : 'text-orange-900'}`}>
                  {agentName} - Transaction History
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${activeTeam === 'Team Hotel' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                  <span className={`text-sm font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'}`}>
                    {activeTeam}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Transactions</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalTransactions}</p>
                  </div>
                  <DollarSign size={24} className="text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm">Total Deposits</p>
                    <p className="text-xl font-bold text-green-600">+${stats.totalDeposits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{stats.depositsCount} transactions</p>
                  </div>
                  <TrendingUp size={24} className="text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm">Total Withdrawals</p>
                    <p className="text-xl font-bold text-red-600">-${stats.totalWithdrawals.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{stats.withdrawalsCount} transactions</p>
                  </div>
                  <TrendingDown size={24} className="text-red-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Net Amount</p>
                    <p className={`text-xl font-bold ${
                      (stats.totalDeposits - stats.totalWithdrawals) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(stats.totalDeposits - stats.totalWithdrawals) >= 0 ? '+' : ''}${(stats.totalDeposits - stats.totalWithdrawals).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign size={24} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-white border-b">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-start sm:items-end">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'deposit', label: 'Deposits' },
                  { value: 'withdrawal', label: 'Withdrawals' }
                ]}
                className="w-full sm:w-48"
              />
              <Select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                options={[
                  { value: '', label: 'All Apps' },
                  { value: 'TikTok', label: 'TikTok' },
                  { value: 'Search', label: 'Search' }
                ]}
                className="w-full sm:w-48"
              />
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-48"
              />
              <ExportButton 
                onExport={handleExportAgentTransactions}
                label="Export"
                disabled={agentTransactions.length === 0}
              />
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="bg-white max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className={`sticky top-0 ${activeTeam === 'Team Hotel' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                    Shop ID
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                    App
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                    Type & Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No transactions found for {agentName}.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{transaction.shopId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAppBadge(transaction.app)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(transaction.type, transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} />
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
              </div>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTeam === 'Team Hotel' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTransactionsModal;