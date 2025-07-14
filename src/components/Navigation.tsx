import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, TrendingUp, Package } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Tab = 'dashboard' | 'sales' | 'inventory';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'dashboard' as Tab,
      label: t('dashboard'),
      icon: LayoutDashboard
    },
    {
      id: 'sales' as Tab,
      label: t('sales'),
      icon: TrendingUp
    },
    {
      id: 'inventory' as Tab,
      label: t('inventory'),
      icon: Package
    }
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};