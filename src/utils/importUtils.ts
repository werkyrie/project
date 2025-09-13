import { Agent, Shop, Transaction } from '../context/AppContext';

export interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

export const validateAmount = (amountString: string): boolean => {
  const amount = parseFloat(amountString);
  return !isNaN(amount) && amount >= 0;
};

export const validatePosition = (position: string): boolean => {
  const validPositions = ['Team Leader', 'Elite Chatter', 'Regular Chatter', 'Spammer', 'Model'];
  return validPositions.includes(position);
};

export const validateApp = (app: string): boolean => {
  return app === 'TikTok' || app === 'Search';
};

export const validateTransactionType = (type: string): boolean => {
  return type === 'deposit' || type === 'withdrawal';
};

// Import functions
export const importAgents = async (
  data: any[], 
  activeTeam: 'Team Hotel' | 'Team Hustle',
  existingAgents: Agent[],
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    errors: [],
    warnings: []
  };

  const newAgents: Agent[] = [];
  const existingNames = new Set(existingAgents.map(agent => agent.name.toLowerCase()));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = row._rowIndex || i + 2;

    try {
      // Validate required fields
      if (!row.Name || !row.Name.trim()) {
        result.errors.push(`Row ${rowNum}: Name is required`);
        continue;
      }

      if (!row.Position || !row.Position.trim()) {
        result.errors.push(`Row ${rowNum}: Position is required`);
        continue;
      }

      // Validate position
      if (!validatePosition(row.Position)) {
        result.errors.push(`Row ${rowNum}: Invalid position "${row.Position}". Must be one of: Team Leader, Elite Chatter, Regular Chatter, Spammer, Model`);
        continue;
      }

      // Check for duplicates
      const nameLower = row.Name.trim().toLowerCase();
      if (existingNames.has(nameLower)) {
        result.warnings.push(`Row ${rowNum}: Agent "${row.Name}" already exists, skipping`);
        continue;
      }

      // Validate date if provided
      let createdAt = new Date().toISOString();
      if (row['Created Date'] && row['Created Date'].trim()) {
        if (!validateDate(row['Created Date'])) {
          result.warnings.push(`Row ${rowNum}: Invalid date format "${row['Created Date']}", using current date`);
        } else {
          createdAt = new Date(row['Created Date']).toISOString();
        }
      }

      const newAgent: Agent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: row.Name.trim(),
        position: row.Position as Agent['position'],
        team: activeTeam,
        createdAt
      };

      newAgents.push(newAgent);
      existingNames.add(nameLower);
      result.success++;
    } catch (error) {
      result.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (newAgents.length > 0) {
    setAgents(prev => [...prev, ...newAgents]);
  }

  return result;
};

export const importShops = async (
  data: any[], 
  activeTeam: 'Team Hotel' | 'Team Hustle',
  app: 'TikTok' | 'Search',
  existingShops: Shop[],
  existingAgents: Agent[],
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    errors: [],
    warnings: []
  };

  const newShops: Shop[] = [];
  const existingShopIds = new Set(existingShops.map(shop => shop.shopId.toLowerCase()));
  const teamAgentNames = new Set(existingAgents.filter(agent => agent.team === activeTeam).map(agent => agent.name));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = row._rowIndex || i + 2;

    try {
      // Validate required fields
      if (!row['Shop ID'] || !row['Shop ID'].trim()) {
        result.errors.push(`Row ${rowNum}: Shop ID is required`);
        continue;
      }

      if (!row.Agent || !row.Agent.trim()) {
        result.errors.push(`Row ${rowNum}: Agent is required`);
        continue;
      }

      if (!row['KYC Date'] || !row['KYC Date'].trim()) {
        result.errors.push(`Row ${rowNum}: KYC Date is required`);
        continue;
      }

      // Validate agent exists in team
      if (!teamAgentNames.has(row.Agent.trim())) {
        result.errors.push(`Row ${rowNum}: Agent "${row.Agent}" not found in ${activeTeam}`);
        continue;
      }

      // Validate date
      if (!validateDate(row['KYC Date'])) {
        result.errors.push(`Row ${rowNum}: Invalid KYC Date format "${row['KYC Date']}". Use YYYY-MM-DD format`);
        continue;
      }

      // Check for duplicates
      const shopIdLower = row['Shop ID'].trim().toLowerCase();
      if (existingShopIds.has(shopIdLower)) {
        result.warnings.push(`Row ${rowNum}: Shop ID "${row['Shop ID']}" already exists, skipping`);
        continue;
      }

      const newShop: Shop = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        shopId: row['Shop ID'].trim(),
        agentName: row.Agent.trim(),
        kycDate: row['KYC Date'],
        app,
        team: activeTeam
      };

      newShops.push(newShop);
      existingShopIds.add(shopIdLower);
      result.success++;
    } catch (error) {
      result.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (newShops.length > 0) {
    setShops(prev => [...prev, ...newShops]);
  }

  return result;
};

export const importTransactions = async (
  data: any[], 
  activeTeam: 'Team Hotel' | 'Team Hustle',
  type: 'deposit' | 'withdrawal',
  existingShops: Shop[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    errors: [],
    warnings: []
  };

  const newTransactions: Transaction[] = [];
  const teamShops = existingShops.filter(shop => shop.team === activeTeam);
  const shopMap = new Map(teamShops.map(shop => [shop.shopId.toLowerCase(), shop]));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = row._rowIndex || i + 2;

    try {
      // Validate required fields
      if (!row['Shop ID'] || !row['Shop ID'].trim()) {
        result.errors.push(`Row ${rowNum}: Shop ID is required`);
        continue;
      }

      if (!row.Amount || !row.Amount.toString().trim()) {
        result.errors.push(`Row ${rowNum}: Amount is required`);
        continue;
      }

      if (!row.Date || !row.Date.trim()) {
        result.errors.push(`Row ${rowNum}: Date is required`);
        continue;
      }

      // Validate shop exists
      const shopIdLower = row['Shop ID'].trim().toLowerCase();
      const shop = shopMap.get(shopIdLower);
      if (!shop) {
        result.errors.push(`Row ${rowNum}: Shop ID "${row['Shop ID']}" not found in ${activeTeam}`);
        continue;
      }

      // Validate amount
      if (!validateAmount(row.Amount.toString())) {
        result.errors.push(`Row ${rowNum}: Invalid amount "${row.Amount}". Must be a positive number`);
        continue;
      }

      // Validate date
      if (!validateDate(row.Date)) {
        result.errors.push(`Row ${rowNum}: Invalid date format "${row.Date}". Use YYYY-MM-DD format`);
        continue;
      }

      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        shopId: shop.shopId,
        app: shop.app,
        agent: shop.agentName,
        amount: parseFloat(row.Amount.toString()),
        date: row.Date,
        type,
        team: activeTeam
      };

      newTransactions.push(newTransaction);
      result.success++;
    } catch (error) {
      result.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (newTransactions.length > 0) {
    setTransactions(prev => [...prev, ...newTransactions]);
  }

  return result;
};

// Template data generators
export const getAgentTemplateHeaders = (): string[] => [
  'Name', 'Position', 'Created Date'
];

export const getAgentSampleData = (): string[][] => [
  ['John Doe', 'Team Leader', '2024-01-15'],
  ['Jane Smith', 'Elite Chatter', '2024-01-16'],
  ['Mike Johnson', 'Regular Chatter', '2024-01-17']
];

export const getShopTemplateHeaders = (): string[] => [
  'Shop ID', 'Agent', 'KYC Date'
];

export const getShopSampleData = (): string[][] => [
  ['SHOP001', 'John Doe', '2024-01-20'],
  ['SHOP002', 'Jane Smith', '2024-01-21'],
  ['SHOP003', 'Mike Johnson', '2024-01-22']
];

export const getTransactionTemplateHeaders = (): string[] => [
  'Shop ID', 'Amount', 'Date'
];

export const getTransactionSampleData = (): string[][] => [
  ['SHOP001', '1000.00', '2024-01-25'],
  ['SHOP002', '1500.50', '2024-01-26'],
  ['SHOP003', '750.25', '2024-01-27']
];