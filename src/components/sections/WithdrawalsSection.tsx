import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Download } from 'lucide-react';
import { useApp, Transaction } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Pagination from '../ui/Pagination';
import ExportButton from '../ui/ExportButton';
import ImportButton from '../ui/ImportButton';
import { exportToCSV, formatTransactionForExport, getMonthName } from '../../utils/exportUtils';
import { importTransactions, getTransactionTemplateHeaders, getTransactionSampleData } from '../../utils/importUtils';

const WithdrawalsSection: React.FC = () => {
  const { transactions, setTransactions, shops, agents, activeTeam } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    shopId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const teamWithdrawals = useMemo(() => 
    transactions.filter(transaction => 
      transaction.team === activeTeam && 
      transaction.type === 'withdrawal'
    )
  , [transactions, activeTeam]);

  const teamShops = useMemo(() => 
    shops.filter(shop => shop.team === activeTeam)
  , [shops, activeTeam]);

  const teamAgents = useMemo(() => 
    agents.filter(agent => agent.team === activeTeam)
  , [agents, activeTeam]);

  const filteredWithdrawals = useMemo(() => {
    let filtered = teamWithdrawals.filter(withdrawal =>
      withdrawal.shopId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.agent.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedAgent) {
      filtered = filtered.filter(withdrawal => withdrawal.agent === selectedAgent);
    }

    if (selectedApp) {
      filtered = filtered.filter(withdrawal => withdrawal.app === selectedApp);
    }

    if (selectedMonth) {
      filtered = filtered.filter(withdrawal => {
        const withdrawalMonth = new Date(withdrawal.date).toISOString().slice(0, 7);
        return withdrawalMonth === selectedMonth;
      });
    }

    return filtered;
  }, [teamWithdrawals, searchTerm, selectedAgent, selectedApp, selectedMonth]);

  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWithdrawals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

  const totalAmount = useMemo(() => 
    filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
  , [filteredWithdrawals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedShop = teamShops.find(shop => shop.shopId === formData.shopId);
    if (!selectedShop) return;

    if (editingTransaction) {
      setTransactions(prev => prev.map(transaction => 
        transaction.id === editingTransaction.id 
          ? { 
              ...transaction, 
              shopId: formData.shopId,
              amount: parseFloat(formData.amount),
              date: formData.date,
              app: selectedShop.app,
              agent: selectedShop.agentName,
            }
          : transaction
      ));
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        shopId: formData.shopId,
        app: selectedShop.app,
        agent: selectedShop.agentName,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: 'withdrawal',
        team: activeTeam,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      shopId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      shopId: transaction.shopId,
      amount: transaction.amount.toString(),
      date: transaction.date,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('withdrawals.deleteConfirm'))) {
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedWithdrawals.map(withdrawal => withdrawal.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (window.confirm(t('withdrawals.deleteConfirm'))) {
      setTransactions(prev => prev.filter(transaction => !selectedItems.includes(transaction.id)));
      setSelectedItems([]);
    }
  };

  const handleExportWithdrawals = (month: string) => {
    let dataToExport = teamWithdrawals;
    
    if (month) {
      dataToExport = teamWithdrawals.filter(withdrawal => {
        const withdrawalMonth = new Date(withdrawal.date).toISOString().slice(0, 7);
        return withdrawalMonth === month;
      });
    }

    const formattedData = dataToExport.map(formatTransactionForExport);
    const monthName = getMonthName(month);
    const filename = `${activeTeam}_Withdrawals_${monthName.replace(/\s+/g, '_')}.csv`;
    
    exportToCSV(formattedData, filename);
  };

  const handleImportWithdrawals = async (data: any[]) => {
    return await importTransactions(data, activeTeam, 'withdrawal', shops, setTransactions);
  };

  const getAppBadge = (app: 'TikTok' | 'Search') => (
    <div className="flex items-center space-x-2">
      <img 
        src={app === 'TikTok' ? '/Tiktok logo.png' : '/Search logo HD.png'} 
        alt={`${app} Logo`}
        className="w-5 h-5 object-contain"
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">{t('withdrawals.totalWithdrawals')}</p>
              <p className="text-2xl font-bold">{filteredWithdrawals.length}</p>
            </div>
            <DollarSign size={32} className="text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">{t('withdrawals.totalAmount')}</p>
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">{t('withdrawals.averageWithdrawal')}</p>
              <p className="text-2xl font-bold">
                ${filteredWithdrawals.length > 0 ? (totalAmount / filteredWithdrawals.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <DollarSign size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('withdrawals.searchWithdrawals')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-80"
            />
          </div>
          <Select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            options={[
              { value: '', label: t('transactions.allAgents') },
              ...teamAgents.map(agent => ({ value: agent.name, label: agent.name }))
            ]}
            className="w-full sm:w-48"
          />
          <Select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            options={[
              { value: '', label: t('transactions.allApps') },
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
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleDeleteSelected} className="flex items-center space-x-2">
              <Trash2 size={16} />
              <span>{t('withdrawals.deleteSelected')} ({selectedItems.length})</span>
            </Button>
          )}
          <ExportButton 
            onExport={handleExportWithdrawals}
            label={t('withdrawals.exportWithdrawals')}
            disabled={teamWithdrawals.length === 0}
          />
          <ImportButton 
            onImport={handleImportWithdrawals}
            label={t('import.importData')}
            templateHeaders={getTransactionTemplateHeaders()}
            sampleData={getTransactionSampleData()}
            disabled={teamShops.length === 0}
          />
          <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
            <Plus size={20} />
            <span>{t('withdrawals.addWithdrawal')}</span>
          </Button>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className={`bg-white rounded-xl shadow-sm border ${activeTeam === 'Team Hotel' ? 'border-blue-200' : 'border-orange-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${activeTeam === 'Team Hotel' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedWithdrawals.length > 0 && selectedItems.length === paginatedWithdrawals.length}
                    className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                  />
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.shopId')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.app')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.agent')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.amount')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.date')}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {t('withdrawals.noWithdrawals')}
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(withdrawal.id)}
                        onChange={() => handleSelectItem(withdrawal.id)}
                        className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{withdrawal.shopId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAppBadge(withdrawal.app)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{withdrawal.agent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-red-600 font-semibold">-${withdrawal.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(withdrawal.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(withdrawal)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(withdrawal.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
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
      </div>

      {/* Add/Edit Withdrawal Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingTransaction ? t('withdrawals.editWithdrawal') : t('withdrawals.addNewWithdrawal')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.headers.shopId')}</label>
            <Select
              value={formData.shopId}
              onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
              showAppIcons={true}
              options={[
                { value: '', label: `${t('transactions.selectShop')} ${activeTeam}` },
                ...teamShops.map(shop => ({ 
                  value: shop.shopId, 
                  label: `${shop.shopId} - ${shop.agentName}`,
                  app: shop.app
                }))
              ]}
              required
            />
            {teamShops.length === 0 && (
              <p className="mt-1 text-xs text-red-600">
                {t('transactions.noShopsAvailable', { team: activeTeam })}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.headers.amount')}</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              placeholder={t('transactions.withdrawalAmount')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.headers.date')}</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingTransaction ? t('transactions.updateWithdrawal') : t('withdrawals.addWithdrawal')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WithdrawalsSection;