export interface ExportTransaction {
  shopId: string;
  app: 'TikTok' | 'Search';
  agent: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  team: 'Team Hotel' | 'Team Hustle';
}

export interface ExportAgent {
  name: string;
  position: string;
  team: string;
  createdAt: string;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netAmount: number;
}

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatTransactionForExport = (transaction: ExportTransaction) => ({
  'Shop ID': transaction.shopId,
  'App': transaction.app,
  'Agent': transaction.agent,
  'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
  'Amount': transaction.amount,
  'Date': new Date(transaction.date).toLocaleDateString(),
  'Team': transaction.team
});

export const formatAgentForExport = (agent: ExportAgent) => ({
  'Name': agent.name,
  'Position': agent.position,
  'Team': agent.team,
  'Created Date': new Date(agent.createdAt).toLocaleDateString(),
  'Total Transactions': agent.totalTransactions,
  'Total Deposits': agent.totalDeposits,
  'Total Withdrawals': agent.totalWithdrawals,
  'Net Amount': agent.netAmount
});

export const getMonthName = (monthString: string) => {
  if (!monthString) return 'All Time';
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};