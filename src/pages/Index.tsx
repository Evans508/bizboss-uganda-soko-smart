import { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { SalesForm } from '@/components/SalesForm';
import { InventoryManager } from '@/components/InventoryManager';
import { Product, Sale } from '@/types';

type Tab = 'dashboard' | 'sales' | 'inventory';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useLocalStorage<Product[]>('bizboss-products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('bizboss-sales', []);

  const handleProductAdd = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts([...products, newProduct]);
  };

  const handleProductUpdate = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...updates, updatedAt: new Date() } : product
    ));
  };

  const handleProductDelete = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    // Also remove related sales
    setSales(sales.filter(sale => sale.productId !== id));
  };

  const handleSaleRecord = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    // Update product stock
    const updatedProducts = products.map(product => 
      product.id === saleData.productId 
        ? { ...product, stock: product.stock - saleData.quantity, updatedAt: new Date() }
        : product
    );
    
    setProducts(updatedProducts);
    setSales([...sales, newSale]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} sales={sales} />;
      case 'sales':
        return <SalesForm products={products} onSaleRecord={handleSaleRecord} />;
      case 'inventory':
        return (
          <InventoryManager
            products={products}
            onProductAdd={handleProductAdd}
            onProductUpdate={handleProductUpdate}
            onProductDelete={handleProductDelete}
          />
        );
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">BizBoss Uganda</h1>
            <p className="text-primary-foreground/80">Business Management Made Simple</p>
          </div>
        </header>
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="container mx-auto px-4 py-6">
          {renderActiveTab()}
        </main>
      </div>
    </LanguageProvider>
  );
};

export default Index;
