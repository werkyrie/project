import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Calendar } from 'lucide-react';
import { useApp, Shop } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Pagination from '../ui/Pagination';
import ImportButton from '../ui/ImportButton';
import { importShops, getShopTemplateHeaders, getShopSampleData } from '../../utils/importUtils';

const TikTokSection: React.FC = () => {
  const { shops, setShops, agents, activeTeam } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    shopId: '',
    agentName: '',
    kycDate: '',
  });

  const teamShops = useMemo(() => 
    shops.filter(shop => shop.team === activeTeam && shop.app === 'TikTok')
  , [shops, activeTeam]);

  const teamAgents = useMemo(() => 
    agents.filter(agent => agent.team === activeTeam)
  , [agents, activeTeam]);

  const filteredShops = useMemo(() => {
    let filtered = teamShops.filter(shop =>
      shop.shopId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.agentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedAgent) {
      filtered = filtered.filter(shop => shop.agentName === selectedAgent);
    }

    if (selectedMonth) {
      filtered = filtered.filter(shop => {
        const shopMonth = new Date(shop.kycDate).toISOString().slice(0, 7);
        return shopMonth === selectedMonth;
      });
    }

    return filtered;
  }, [teamShops, searchTerm, selectedAgent, selectedMonth]);

  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredShops.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredShops, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingShop) {
      setShops(prev => prev.map(shop => 
        shop.id === editingShop.id 
          ? { ...shop, ...formData }
          : shop
      ));
    } else {
      const newShop: Shop = {
        id: Date.now().toString(),
        ...formData,
        app: 'TikTok',
        team: activeTeam,
      };
      setShops(prev => [...prev, newShop]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShop(null);
    setFormData({ shopId: '', agentName: '', kycDate: '' });
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      shopId: shop.shopId,
      agentName: shop.agentName,
      kycDate: shop.kycDate,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      setShops(prev => prev.filter(shop => shop.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedShops.map(shop => shop.id));
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
    if (window.confirm(t('shops.deleteConfirm'))) {
      setShops(prev => prev.filter(shop => !selectedItems.includes(shop.id)));
      setSelectedItems([]);
    }
  };

  const handleImportShops = async (data: any[]) => {
    return await importShops(data, activeTeam, 'TikTok', shops, agents, setShops);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('shops.searchShops')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-80"
            />
          </div>
          <Select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            options={[
              { value: '', label: t('shops.allAgents') },
              ...teamAgents.map(agent => ({ value: agent.name, label: agent.name }))
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
        <div className="flex space-x-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleDeleteSelected} className="flex items-center space-x-2">
              <Trash2 size={16} />
              <span>{t('shops.deleteSelected')} ({selectedItems.length})</span>
            </Button>
          )}
          <ImportButton 
            onImport={handleImportShops}
            label={t('import.importData')}
            templateHeaders={getShopTemplateHeaders()}
            sampleData={getShopSampleData()}
            disabled={teamAgents.length === 0}
          />
          <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
            <Plus size={20} />
            <span>{t('shops.addShop')}</span>
          </Button>
        </div>
      </div>

      {/* Shops Table */}
      <div className={`bg-white rounded-xl shadow-sm border ${activeTeam === 'Team Hotel' ? 'border-blue-200' : 'border-orange-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${activeTeam === 'Team Hotel' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedShops.length > 0 && selectedItems.length === paginatedShops.length}
                    className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                  />
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.shopId')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.agent')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.kycDate')}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${activeTeam === 'Team Hotel' ? 'text-blue-700' : 'text-orange-700'} uppercase tracking-wider`}>
                  {t('table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t('shops.noTiktokShops')}
                  </td>
                </tr>
              ) : (
                paginatedShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(shop.id)}
                        onChange={() => handleSelectItem(shop.id)}
                        className={`rounded border-gray-300 ${activeTeam === 'Team Hotel' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{shop.shopId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{shop.agentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(shop.kycDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(shop)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
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

      {/* Add/Edit Shop Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingShop ? t('shops.editTiktok') : t('shops.addNewTiktok')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.headers.shopId')}</label>
            <Input
              type="text"
              value={formData.shopId}
              onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
              required
              placeholder={`${t('shops.enterShopId')} ${activeTeam}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('table.headers.agent')}</label>
            <Select
              value={formData.agentName}
              onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
              options={[
                { value: '', label: `${t('shops.selectAgent')} ${activeTeam}` },
                ...teamAgents.map(agent => ({ value: agent.name, label: agent.name }))
              ]}
              required
            />
            {teamAgents.length === 0 && (
              <p className="mt-1 text-xs text-red-600">
                {t('shops.noAgentsAvailable', { team: activeTeam })}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('shops.kycDate')}</label>
            <Input
              type="date"
              value={formData.kycDate}
              onChange={(e) => setFormData(prev => ({ ...prev, kycDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingShop ? t('common.update') + ' ' + t('shops.addShop') : t('shops.addShop')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TikTokSection;