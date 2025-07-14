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
  createdAt: Date;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalProfit: number;
  transactionCount: number;
  topProduct?: string;
}