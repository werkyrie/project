import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useEffect } from 'react';
import { agentService, shopService, transactionService, batchService } from '../services/firebaseService';

export interface Agent {
  id: string;
  name: string;
  position: 'Team Leader' | 'Regular Chatter' | 'Elite Chatter' | 'Spammer' | 'Model';
  team: 'Team Hotel' | 'Team Hustle';
  createdAt: string;
}

export interface Shop {
  id: string;
  shopId: string;
  agentName: string;
  kycDate: string;
  app: 'TikTok' | 'Search';
  team: 'Team Hotel' | 'Team Hustle';
}

export interface Transaction {
  id: string;
  shopId: string;
  app: 'TikTok' | 'Search';
  agent: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  team: 'Team Hotel' | 'Team Hustle';
}

interface AppContextType {
  activeTeam: 'Team Hotel' | 'Team Hustle';
  setActiveTeam: (team: 'Team Hotel' | 'Team Hustle') => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  loading: boolean;
  // Firebase operations
  addAgent: (agent: Omit<Agent, 'id'>) => Promise<void>;
  updateAgent: (id: string, agent: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  deleteAgents: (ids: string[]) => Promise<void>;
  addShop: (shop: Omit<Shop, 'id'>) => Promise<void>;
  updateShop: (id: string, shop: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  deleteShops: (ids: string[]) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;
  importAgents: (agents: Omit<Agent, 'id'>[]) => Promise<void>;
  importShops: (shops: Omit<Shop, 'id'>[]) => Promise<void>;
  importTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTeam, setActiveTeam] = useState<'Team Hotel' | 'Team Hustle'>('Team Hotel');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Subscribe to real-time updates
        const unsubscribeAgents = agentService.subscribe(setAgents);
        const unsubscribeShops = shopService.subscribe(setShops);
        const unsubscribeTransactions = transactionService.subscribe(setTransactions);
        
        setLoading(false);
        
        // Return cleanup function
        return () => {
          unsubscribeAgents();
          unsubscribeShops();
          unsubscribeTransactions();
        };
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    const cleanup = loadData();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, []);

  // Firebase operations
  const addAgent = async (agent: Omit<Agent, 'id'>) => {
    try {
      await agentService.add(agent);
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  };

  const updateAgent = async (id: string, agent: Partial<Agent>) => {
    try {
      await agentService.update(id, agent);
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await agentService.delete(id);
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  const deleteAgents = async (ids: string[]) => {
    try {
      await batchService.deleteAgents(ids);
    } catch (error) {
      console.error('Error deleting agents:', error);
      throw error;
    }
  };

  const addShop = async (shop: Omit<Shop, 'id'>) => {
    try {
      await shopService.add(shop);
    } catch (error) {
      console.error('Error adding shop:', error);
      throw error;
    }
  };

  const updateShop = async (id: string, shop: Partial<Shop>) => {
    try {
      await shopService.update(id, shop);
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  };

  const deleteShop = async (id: string) => {
    try {
      await shopService.delete(id);
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    }
  };

  const deleteShops = async (ids: string[]) => {
    try {
      await batchService.deleteShops(ids);
    } catch (error) {
      console.error('Error deleting shops:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      await transactionService.add(transaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      await transactionService.update(id, transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const deleteTransactions = async (ids: string[]) => {
    try {
      await batchService.deleteTransactions(ids);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      throw error;
    }
  };

  const importAgents = async (agents: Omit<Agent, 'id'>[]) => {
    try {
      await batchService.addAgents(agents);
    } catch (error) {
      console.error('Error importing agents:', error);
      throw error;
    }
  };

  const importShops = async (shops: Omit<Shop, 'id'>[]) => {
    try {
      await batchService.addShops(shops);
    } catch (error) {
      console.error('Error importing shops:', error);
      throw error;
    }
  };

  const importTransactions = async (transactions: Omit<Transaction, 'id'>[]) => {
    try {
      await batchService.addTransactions(transactions);
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      activeTeam,
      setActiveTeam,
      activeSection,
      setActiveSection,
      agents,
      setAgents,
      shops,
      setShops,
      transactions,
      setTransactions,
      sidebarCollapsed,
      setSidebarCollapsed,
      loading,
      addAgent,
      updateAgent,
      deleteAgent,
      deleteAgents,
      addShop,
      updateShop,
      deleteShop,
      deleteShops,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteTransactions,
      importAgents,
      importShops,
      importTransactions,
    }}>
      {children}
    </AppContext.Provider>
  );
};