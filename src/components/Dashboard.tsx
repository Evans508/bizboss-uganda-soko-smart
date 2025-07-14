import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, Sale } from "@/types";
import { TrendingUp, Package, AlertTriangle, DollarSign } from "lucide-react";

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

export const Dashboard = ({ products, sales }: DashboardProps) => {
  const { t } = useLanguage();

  // Calculate today's data
  const today = new Date().toDateString();
  const todaysSales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === today
  );

  const todaysTotalSales = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaysProfit = todaysSales.reduce((sum, sale) => sum + sale.profit, 0);
  const lowStockProducts = products.filter(product => product.stock <= 5);

  const dashboardCards = [
    {
      title: t('todaysSales'),
      value: `${t('ugx')} ${todaysTotalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: t('totalProducts'),
      value: products.length.toString(),
      icon: Package,
      color: "text-info"
    },
    {
      title: t('lowStock'),
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: t('todaysProfit'),
      value: `${t('ugx')} ${todaysProfit.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              {t('lowStock')} ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} {product.stock === 1 ? 'item' : 'items'} left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};