import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'luganda' | 'english';

interface Translations {
  [key: string]: {
    luganda: string;
    english: string;
  };
}

const translations: Translations = {
  // Dashboard
  dashboard: {
    luganda: 'Ekikujjuko',
    english: 'Dashboard'
  },
  todaysSales: {
    luganda: 'Okutunda kwa Leero',
    english: "Today's Sales"
  },
  totalProducts: {
    luganda: 'Ebintu Byonna',
    english: 'Total Products'
  },
  lowStock: {
    luganda: 'Ebintu ebitono',
    english: 'Low Stock'
  },
  todaysProfit: {
    luganda: 'Amagoba ga Leero',
    english: "Today's Profit"
  },
  
  // Sales
  sales: {
    luganda: 'Okutunda',
    english: 'Sales'
  },
  recordSale: {
    luganda: 'Wandiika Okutunda',
    english: 'Record Sale'
  },
  product: {
    luganda: 'Ekintu',
    english: 'Product'
  },
  quantity: {
    luganda: 'Omuwendo',
    english: 'Quantity'
  },
  price: {
    luganda: 'Ebbeeyi',
    english: 'Price'
  },
  total: {
    luganda: 'Awamu',
    english: 'Total'
  },
  
  // Inventory
  inventory: {
    luganda: 'Ebintu',
    english: 'Inventory'
  },
  addProduct: {
    luganda: 'Yongera Ekintu',
    english: 'Add Product'
  },
  productName: {
    luganda: 'Erinnya ly\'ekintu',
    english: 'Product Name'
  },
  costPrice: {
    luganda: 'Ebbeeyi y\'okugula',
    english: 'Cost Price'
  },
  sellingPrice: {
    luganda: 'Ebbeeyi y\'okutunda',
    english: 'Selling Price'
  },
  stock: {
    luganda: 'Omuwendo gwe tulina',
    english: 'Stock'
  },
  
  // Common
  save: {
    luganda: 'Kuuma',
    english: 'Save'
  },
  cancel: {
    luganda: 'Sazamu',
    english: 'Cancel'
  },
  edit: {
    luganda: 'Kyuusa',
    english: 'Edit'
  },
  delete: {
    luganda: 'Gyawo',
    english: 'Delete'
  },
  ugx: {
    luganda: 'UGX',
    english: 'UGX'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('luganda');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};