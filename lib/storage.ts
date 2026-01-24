import { User, Fund, Transaction, Contribution, Loan, MemberProfile } from './types';

const STORAGE_KEYS = {
  USERS: 'fund-app-users',
  FUNDS: 'fund-app-funds',
  TRANSACTIONS: 'fund-app-transactions',
  CONTRIBUTIONS: 'fund-app-contributions',
  LOANS: 'fund-app-loans',
  CURRENT_USER: 'fund-app-current-user',
};

// Initialize default data
export function initializeData() {
  if (typeof window === 'undefined') return;

  // Check if data already exists
  if (localStorage.getItem(STORAGE_KEYS.USERS)) return;

  // Create demo fund
  const demoFund: Fund = {
    id: 'fund-1',
    name: 'Community Savings Fund',
    description: 'A collective fund for community members to save and support each other',
    createdAt: new Date().toISOString(),
    founderId: 'user-1',
    status: 'active',
    totalMembers: 5,
    totalBalance: 15000,
  };

  // Create demo users
  const demoUsers: User[] = [
    {
      id: 'user-1',
      email: 'owner@fund.com',
      name: 'Karim Ahmed',
      phone: '+880171234567',
      role: 'owner',
      joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      balance: 5000,
      totalContributed: 12000,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'user-2',
      email: 'manager@fund.com',
      name: 'Fatima Khan',
      phone: '+880172345678',
      role: 'manager',
      joinDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      balance: 3500,
      totalContributed: 9000,
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'user-3',
      email: 'member1@fund.com',
      name: 'Rashed Hassan',
      phone: '+880173345678',
      role: 'member',
      joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      balance: 2800,
      totalContributed: 5000,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Create demo transactions
  const demoTransactions: Transaction[] = [
    {
      id: 'txn-1',
      userId: 'user-1',
      fundId: 'fund-1',
      type: 'deposit',
      amount: 5000,
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Initial deposit',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'txn-2',
      userId: 'user-2',
      fundId: 'fund-1',
      type: 'contribution',
      amount: 500,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Monthly contribution',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  localStorage.setItem(STORAGE_KEYS.FUNDS, JSON.stringify([demoFund]));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demoTransactions));
  localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
}

// User operations
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Fund operations
export function getFunds(): Fund[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.FUNDS);
  return data ? JSON.parse(data) : [];
}

export function getFundById(id: string): Fund | null {
  const funds = getFunds();
  return funds.find((f) => f.id === id) || null;
}

// Transaction operations
export function getTransactions(userId?: string): Transaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const transactions = data ? JSON.parse(data) : [];
  return userId ? transactions.filter((t: Transaction) => t.userId === userId) : transactions;
}

export function saveTransaction(transaction: Transaction): void {
  if (typeof window === 'undefined') return;
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Contribution operations
export function getContributions(userId?: string): Contribution[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
  const contributions = data ? JSON.parse(data) : [];
  return userId ? contributions.filter((c: Contribution) => c.userId === userId) : contributions;
}

export function saveContribution(contribution: Contribution): void {
  if (typeof window === 'undefined') return;
  const contributions = getContributions();
  contributions.push(contribution);
  localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
}

// Loan operations
export function getLoans(userId?: string): Loan[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.LOANS);
  const loans = data ? JSON.parse(data) : [];
  return userId ? loans.filter((l: Loan) => l.userId === userId) : loans;
}

export function saveLoan(loan: Loan): void {
  if (typeof window === 'undefined') return;
  const loans = getLoans();
  const index = loans.findIndex((l: Loan) => l.id === loan.id);
  if (index >= 0) {
    loans[index] = loan;
  } else {
    loans.push(loan);
  }
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

// Current user session
export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

// Initialize data on first load
if (typeof window !== 'undefined') {
  initializeData();
}
