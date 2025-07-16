import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Trophy, Lightbulb, RefreshCw } from 'lucide-react';
import { Product, Sale, Expense } from '@/types';

interface AnalyticsProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export const Analytics = ({ products, sales, expenses }: AnalyticsProps) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');
  const [refreshing, setRefreshing] = useState(false);

  const analyticsData = useMemo(() => {
    const now = new Date();
    let dateRange: Date[] = [];
    let format: (date: Date) => string;

    switch (selectedPeriod) {
      case 'daily':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          dateRange.push(date);
        }
        format = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'weekly':
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          dateRange.push(date);
        }
        format = (date) => `Week ${Math.ceil(date.getDate() / 7)}`;
        break;
      case 'monthly':
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          dateRange.push(date);
        }
        format = (date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
    }

    const chartData = dateRange.map(date => {
      const dateStr = date.toDateString();
      const daySales = sales.filter(sale => 
        new Date(sale.createdAt).toDateString() === dateStr
      );
      const dayExpenses = expenses.filter(expense => 
        new Date(expense.createdAt).toDateString() === dateStr
      );

      const revenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const expenseTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const profit = revenue - expenseTotal;

      return {
        date: format(date),
        revenue,
        expenses: expenseTotal,
        profit
      };
    });

    return chartData;
  }, [sales, expenses, selectedPeriod]);

  const topSellingProducts = useMemo(() => {
    const productSales = sales.reduce((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productSales)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.name || 'Unknown Product',
          quantity,
          revenue: sales
            .filter(s => s.productId === productId)
            .reduce((sum, s) => sum + s.totalAmount, 0)
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [products, sales]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // AI-generated insights (simulated)
  const insights = {
    english: `Your business is performing well with a ${profitMargin.toFixed(1)}% profit margin. ${topSellingProducts[0]?.productName || 'Focus on inventory'} is your top seller. Consider restocking popular items and optimizing expenses.`,
    luganda: `Bizinensi yo ekola bulungi nga profit margin ya ${profitMargin.toFixed(1)}%. ${topSellingProducts[0]?.productName || 'Weekendeeze ku bintu'} y'ekintu ekitundibwa ennyo. Weekendeeze ku kuzingiza ebintu ebitundibwa n'okukendeeza ku nsaasaanya.`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights for your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-green-600">+12.5% from last period</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-red-600">+5.2% from last period</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {netProfit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`UGX ${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`UGX ${value.toLocaleString()}`, '']} />
                <Bar dataKey="expenses" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">English</Badge>
            <p className="text-sm">{insights.english}</p>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">Luganda</Badge>
            <p className="text-sm">{insights.luganda}</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topSellingProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <div className="space-y-3">
              {topSellingProducts.map((item, index) => (
                <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} units sold
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">UGX {item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};