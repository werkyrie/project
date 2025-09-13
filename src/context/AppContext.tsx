import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    }}>
      {children}
    </AppContext.Provider>
  );
};