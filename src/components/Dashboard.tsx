import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, Sale } from "@/types";
import { TrendingUp, AlertTriangle, Plus, Printer, BarChart, Settings, User } from "lucide-react";

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses?: any[];
}

export const Dashboard = ({ products, sales }: DashboardProps) => {
  const { t } = useLanguage();

  // Calculate today's and yesterday's data
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  const todaysSales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === today
  );
  const yesterdaysSales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === yesterday
  );

  const todaysTotalSales = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const yesterdaysTotalSales = yesterdaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaysProfit = todaysSales.reduce((sum, sale) => sum + sale.profit, 0);
  const lowStockProducts = products.filter(product => product.stock <= 5);

  // Calculate percentage change
  const percentageChange = yesterdaysTotalSales > 0 
    ? ((todaysTotalSales - yesterdaysTotalSales) / yesterdaysTotalSales * 100).toFixed(0)
    : 0;

  // Get recent transactions (last 5 sales)
  const recentTransactions = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hello, User!</h1>
        </div>
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      {/* Today's Revenue Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-primary-foreground/80">Today's Revenue</p>
            <p className="text-3xl font-bold">{t('ugx')} {todaysTotalSales.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-green-300">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{Math.abs(Number(percentageChange))}% vs yesterday</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-muted-foreground text-sm">Sales</p>
          <p className="text-2xl font-bold">{todaysSales.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Expenses</p>
          <p className="text-2xl font-bold">{t('ugx')} 0</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Profits</p>
          <p className="text-2xl font-bold">{t('ugx')} {todaysProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Low-Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Low-Stock Alerts</h3>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground ml-auto">{product.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="flex items-center gap-2 h-12" variant="outline">
          <Plus className="h-4 w-4" />
          New Sale
        </Button>
        <Button className="flex items-center gap-2 h-12" variant="outline">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="flex items-center gap-2 h-12" variant="outline">
          <BarChart className="h-4 w-4" />
          Reports
        </Button>
        <Button className="flex items-center gap-2 h-12" variant="outline">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction.productName}</p>
                  <p className="text-sm text-muted-foreground">×{transaction.quantity}</p>
                </div>
                <p className="font-semibold">{t('ugx')} {transaction.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};