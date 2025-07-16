import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Printer, 
  Bluetooth, 
  Download, 
  Upload,
  Globe,
  Building,
  Wifi,
  WifiOff
} from 'lucide-react';
import { BusinessSettings } from '@/types';

interface SettingsProps {
  sales: any[];
  expenses: any[];
  products: any[];
}

export const Settings = ({ sales, expenses, products }: SettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<BusinessSettings>('bizboss-settings', {
    id: '1',
    businessName: 'My Business',
    currency: 'UGX',
    language: 'en',
    printerConnected: false,
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mock printer scanning
  const scanForPrinters = async () => {
    setIsScanning(true);
    setDiscoveredPrinters([]);
    
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock discovered printers
      const mockPrinters = [
        'Thermal Printer XP-58',
        'ESC/POS Printer 001',
        'Mobile Printer Pro'
      ];
      
      setDiscoveredPrinters(mockPrinters);
      toast({
        title: "Scan Complete",
        description: `Found ${mockPrinters.length} printers`
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not scan for printers",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const connectToPrinter = (printerName: string) => {
    setSettings(prev => ({
      ...prev,
      printerConnected: true,
      printerName
    }));
    
    toast({
      title: "Printer Connected",
      description: `Connected to ${printerName}`
    });
  };

  const disconnectPrinter = () => {
    setSettings(prev => ({
      ...prev,
      printerConnected: false,
      printerName: undefined
    }));
    
    toast({
      title: "Printer Disconnected",
      description: "Printer has been disconnected"
    });
  };

  const testPrint = async () => {
    if (!settings.printerConnected) {
      toast({
        title: "No Printer Connected",
        description: "Please connect a printer first",
        variant: "destructive"
      });
      return;
    }

    // Simulate printing
    toast({
      title: "Test Print Sent",
      description: "Test receipt sent to printer"
    });
  };

  const exportData = (type: 'sales' | 'expenses' | 'products') => {
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'sales':
        data = sales;
        filename = 'sales-export.csv';
        headers = ['Date', 'Product', 'Quantity', 'Unit Price', 'Total', 'Payment Method'];
        break;
      case 'expenses':
        data = expenses;
        filename = 'expenses-export.csv';
        headers = ['Date', 'Category', 'Amount', 'Payment Method', 'Description'];
        break;
      case 'products':
        data = products;
        filename = 'products-export.csv';
        headers = ['Name', 'Cost Price', 'Selling Price', 'Stock', 'Category'];
        break;
    }

    if (data.length === 0) {
      toast({
        title: "No Data",
        description: `No ${type} data to export`,
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        switch (type) {
          case 'sales':
            return [
              new Date(item.createdAt).toLocaleDateString(),
              item.productName,
              item.quantity,
              item.unitPrice,
              item.totalAmount,
              item.paymentMethod
            ].join(',');
          case 'expenses':
            return [
              new Date(item.createdAt).toLocaleDateString(),
              item.category,
              item.amount,
              item.paymentMethod,
              item.description || ''
            ].join(',');
          case 'products':
            return [
              item.name,
              item.costPrice,
              item.sellingPrice,
              item.stock,
              item.category || ''
            ].join(',');
          default:
            return '';
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${type} data exported successfully`
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setSettings(prev => ({ ...prev, logoUrl }));
        toast({
          title: "Logo Uploaded",
          description: "Business logo updated successfully"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Enter business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Business Logo</Label>
            <div className="flex items-center gap-4">
              {settings.logoUrl && (
                <img 
                  src={settings.logoUrl} 
                  alt="Business Logo" 
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => 
                setSettings(prev => ({ ...prev, currency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value: any) => 
                setSettings(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="lg">Luganda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thermal Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Thermal Printer (58mm ESC/POS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Printer Status</p>
              <p className="text-sm text-muted-foreground">
                {settings.printerConnected 
                  ? `Connected to ${settings.printerName}` 
                  : 'No printer connected'
                }
              </p>
            </div>
            <Badge variant={settings.printerConnected ? "default" : "secondary"}>
              {settings.printerConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={scanForPrinters} 
                disabled={isScanning}
                variant="outline"
              >
                <Bluetooth className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan for Printers'}
              </Button>
              
              {settings.printerConnected && (
                <>
                  <Button onClick={testPrint} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Test Print
                  </Button>
                  <Button onClick={disconnectPrinter} variant="outline">
                    Disconnect
                  </Button>
                </>
              )}
            </div>

            {discoveredPrinters.length > 0 && (
              <div className="space-y-2">
                <Label>Discovered Printers:</Label>
                {discoveredPrinters.map((printer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{printer}</span>
                    <Button 
                      onClick={() => connectToPrinter(printer)}
                      size="sm"
                      disabled={settings.printerConnected && settings.printerName === printer}
                    >
                      {settings.printerConnected && settings.printerName === printer ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => exportData('sales')} 
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Sales</span>
              <span className="text-xs text-muted-foreground">{sales.length} records</span>
            </Button>
            
            <Button 
              onClick={() => exportData('expenses')} 
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Expenses</span>
              <span className="text-xs text-muted-foreground">{expenses.length} records</span>
            </Button>
            
            <Button 
              onClick={() => exportData('products')} 
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Products</span>
              <span className="text-xs text-muted-foreground">{products.length} records</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};