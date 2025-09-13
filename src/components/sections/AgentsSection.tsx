import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Users, Crown, Star, Zap, UserCheck, Eye, Download } from 'lucide-react';
import { useApp, Agent } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Pagination from '../ui/Pagination';
import AgentTransactionsModal from './AgentTransactionsModal';
import ExportButton from '../ui/ExportButton';
import ImportButton from '../ui/ImportButton';
import { exportToCSV, formatAgentForExport, getMonthName } from '../../utils/exportUtils';
import { importAgents, getAgentTemplateHeaders, getAgentSampleData } from '../../utils/importUtils';

const AgentsSection: React.FC = () => {
  const { agents, setAgents, activeTeam, transactions } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedAgentForTransactions, setSelectedAgentForTransactions] = useState<string>('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    position: 'Regular Chatter' as Agent['position'],
  });

  const teamAgents = useMemo(() => 
    agents.filter(agent => agent.team === activeTeam)
  , [agents, activeTeam]);

  const filteredAgents = useMemo(() => {
    let filtered = teamAgents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedPosition) {
      filtered = filtered.filter(agent => agent.position === selectedPosition);
    }

    return filtered;
  }, [teamAgents, searchTerm, selectedPosition]);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAgents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAgents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  const positionStats = useMemo(() => {
    const stats = teamAgents.reduce((acc, agent) => {
      acc[agent.position] = (acc[agent.position] || 0) + 1;
      return acc;
    }, {} as Record<Agent['position'], number>);
    
    return stats;
  }, [teamAgents]);

  const getAgentTransactionCount = (agentName: string) => {
    return transactions.filter(t => t.agent === agentName && t.team === activeTeam).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAgent) {
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent.id 
          ? { ...agent, ...formData }
          : agent
      ));
    } else {
      const newAgent: Agent = {
        id: Date.now().toString(),
        ...formData,
        team: activeTeam,
        createdAt: new Date().toISOString(),
      };
      setAgents(prev => [...prev, newAgent]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({ name: '', position: 'Regular Chatter' });
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      position: agent.position,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      setAgents(prev => prev.filter(agent => agent.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedAgents.map(agent => agent.id));
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
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected agents?`)) {
      setAgents(prev => prev.filter(agent => !selectedItems.includes(agent.id)));
      setSelectedItems([]);
    }
  };

  const handleExportAgents = (month: string) => {
    let agentsToExport = teamAgents;
    
    if (month) {
      agentsToExport = teamAgents.filter(agent => {
        const agentMonth = new Date(agent.createdAt).toISOString().slice(0, 7);
        return agentMonth === month;
      });
    }

    const agentsWithStats = agentsToExport.map(agent => {
      const agentTransactions = transactions.filter(t => t.agent === agent.name && t.team === activeTeam);
      const deposits = agentTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
      const withdrawals = agentTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: agent.name,
        position: agent.position,
        team: agent.team,
        createdAt: agent.createdAt,
        totalTransactions: agentTransactions.length,
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        netAmount: deposits - withdrawals
      };
    });

    const formattedData = agentsWithStats.map(formatAgentForExport);
    const monthName = getMonthName(month);
    const filename = `${activeTeam}_Agents_${monthName.replace(/\s+/g, '_')}.csv`;
    
    exportToCSV(formattedData, filename);
  };

  const handleImportAgents = async (data: any[]) => {
    return await importAgents(data, activeTeam, agents, setAgents);
  };

  const handleViewTransactions = (agentName: string) => {
    setSelectedAgentForTransactions(agentName);
    setShowTransactionsModal(true);
  };

  const getPositionIcon = (position: Agent['position']) => {
    switch (position) {
      case 'Team Leader':
        return <Crown size={16} className="text-yellow-600" />;
      case 'Elite Chatter':
        return <Star size={16} className="text-purple-600" />;
      case 'Regular Chatter':
        return <UserCheck size={16} className="text-blue-600" />;
      case 'Spammer':
        return <Zap size={16} className="text-red-600" />;
      case 'Model':
        return <Users size={16} className="text-pink-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getPositionBadge = (position: Agent['position']) => {
    const colors = {
      'Team Leader': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Elite Chatter': 'bg-purple-100 text-purple-800 border-purple-200',
      'Regular Chatter': 'bg-blue-100 text-blue-800 border-blue-200',
      'Spammer': 'bg-red-100 text-red-800 border-red-200',
      'Model': 'bg-pink-100 text-pink-800 border-pink-200',
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full border ${colors[position]}`}>
        {getPositionIcon(position)}
        <span>{position}</span>
      </span>
    );
  };

  const positionOptions = [
    { value: '', label: t('filters.allPositions') },
    { value: 'Team Leader', label: t('filters.teamLeader') },
    { value: 'Elite Chatter', label: t('filters.eliteChatter') },
    { value: 'Regular Chatter', label: t('filters.regularChatter') },
    { value: 'Spammer', label: t('filters.spammer') },
    { value: 'Model', label: t('filters.model') },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">{t('cards.teamLeaders')}</p>
              <p className="text-xl font-bold">{positionStats['Team Leader'] || 0}</p>
            </div>
            <Crown size={24} className="text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t('cards.eliteChatters')}</p>
              <p className="text-xl font-bold">{positionStats['Elite Chatter'] || 0}</p>
            </div>
            <Star size={24} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('cards.regularChatters')}</p>
              <p className="text-xl font-bold">{positionStats['Regular Chatter'] || 0}</p>
            </div>
            <UserCheck size={24} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">{t('cards.spammers')}</p>
              <p className="text-xl font-bold">{positionStats['Spammer'] || 0}</p>
            </div>
            <Zap size={24} className="text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">{t('cards.models')}</p>
              <p className="text-xl font-bold">{positionStats['Model'] || 0}</p>
            </div>
            <Users size={24} className="text-pink-200" />
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
              placeholder={t('agents.searchAgents')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-80"
            />
          </div>
          <Select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            options={positionOptions}
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex space-x-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleDeleteSelected} className="flex items-center space-x-2">
              <Trash2 size={16} />
              <span>{t('buttons.deleteSelected')} ({selectedItems.length})</span>
            </Button>
          )}
          <ExportButton 
            onExport={handleExportAgents}
            label={t('buttons.exportAgents')}
            disabled={teamAgents.length === 0}
          />
          <ImportButton 
            onImport={handleImportAgents}
            label={t('import.importData')}
            templateHeaders={getAgentTemplateHeaders()}
            sampleData={getAgentSampleData()}
          />
          <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
            <Plus size={20} />
            <span>{t('buttons.addAgent')}</span>
          </Button>
        </div>
      </div>

      {/* Agents Table */}
      <div className={`bg-white rounded-xl shadow-sm border ${activeTeam === 'Team Hotel' ? 'border-blue-200' : 'border-orange-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${activeTeam === 'Team Hotel' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedAgents.length > 0 && selectedItems.length === paginatedAgents.length}
                    className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                  />
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.name')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.position')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.createdAt')}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAgents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t('agents.noAgents')}
                  </td>
                </tr>
              ) : (
                paginatedAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(agent.id)}
                        onChange={() => handleSelectItem(agent.id)}
                        className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${activeTeam === 'Team Hotel' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500">
                            {getAgentTransactionCount(agent.name)} transactions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPositionBadge(agent.position)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewTransactions(agent.name)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="View Transactions"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(agent)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit Agent"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Agent"
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

      {/* Add/Edit Agent Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingAgent ? 'Edit Agent' : 'Add New Agent'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder={`Enter agent name for ${activeTeam}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <Select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as Agent['position'] }))}
              options={[
                { value: 'Team Leader', label: 'Team Leader' },
                { value: 'Elite Chatter', label: 'Elite Chatter' },
                { value: 'Regular Chatter', label: 'Regular Chatter' },
                { value: 'Spammer', label: 'Spammer' },
                { value: 'Model', label: 'Model' },
              ]}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAgent ? 'Update Agent' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Agent Transactions Modal */}
      <AgentTransactionsModal
        isOpen={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        agentName={selectedAgentForTransactions}
      />
    </div>
  );
};

export default AgentsSection;