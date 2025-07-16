export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  paymentMethod: 'cash' | 'mobile-money' | 'bank-transfer';
  customerPhone?: string;
  mobileMoneyProvider?: 'MTN' | 'Airtel';
  mobileMoneyReference?: string;
  receiptUrl?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  paymentMethod: 'cash' | 'mobile-money' | 'bank-transfer';
  description?: string;
  mobileMoneyProvider?: 'MTN' | 'Airtel';
  mobileMoneyReference?: string;
  createdAt: Date;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  logoUrl?: string;
  currency: string;
  language: 'en' | 'lg';
  printerConnected: boolean;
  printerName?: string;
}

export interface AnalyticsSummary {
  period: 'daily' | 'weekly' | 'monthly';
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topSellingProduct: string;
  insights: {
    english: string;
    luganda: string;
  };
  trends: {
    revenue: number[];
    expenses: number[];
    profit: number[];
    labels: string[];
  };
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalProfit: number;
  transactionCount: number;
  topProduct?: string;
}