import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, Share, Eye, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Sale, Product } from '@/types';

interface ReceiptManagerProps {
  products: Product[];
}

interface Receipt {
  id: string;
  saleId: string;
  customerPhone?: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  pdfUrl?: string;
}

export const ReceiptManager = ({ products }: ReceiptManagerProps) => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('bizboss-receipts', []);
  const [searchTerm, setSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const filteredReceipts = receipts.filter(receipt =>
    receipt.customerPhone?.includes(searchTerm) ||
    receipt.items.some(item => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const generateReceiptHTML = (receipt: Receipt) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 200px; margin: 0; padding: 10px; }
          .header { text-align: center; margin-bottom: 10px; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; }
          .total { font-weight: bold; margin-top: 5px; }
          .footer { text-align: center; margin-top: 10px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h3>BIZBOSS UGANDA</h3>
          <p>Thank you for your business!</p>
          <div class="line"></div>
        </div>
        
        <div>Date: ${receipt.createdAt.toLocaleDateString()}</div>
        <div>Time: ${receipt.createdAt.toLocaleTimeString()}</div>
        ${receipt.customerPhone ? `<div>Phone: ${receipt.customerPhone}</div>` : ''}
        <div class="line"></div>
        
        ${receipt.items.map(item => `
          <div class="item">
            <span>${item.productName}</span>
          </div>
          <div class="item">
            <span>${item.quantity} x ${item.unitPrice.toLocaleString()}</span>
            <span>${item.total.toLocaleString()}</span>
          </div>
        `).join('')}
        
        <div class="line"></div>
        <div class="item total">
          <span>TOTAL:</span>
          <span>UGX ${receipt.total.toLocaleString()}</span>
        </div>
        <div>Payment: ${receipt.paymentMethod}</div>
        
        <div class="footer">
          <div class="line"></div>
          <p>Powered by BizBoss Uganda</p>
          <p>Visit us again!</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = (receipt: Receipt) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML(receipt));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    
    toast({
      title: "Print Sent",
      description: "Receipt sent to printer"
    });
  };

  const handleDownloadPDF = async (receipt: Receipt) => {
    // In a real app, you'd use a library like jsPDF or call a backend service
    const html = generateReceiptHTML(receipt);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.id}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Receipt HTML file downloaded"
    });
  };

  const handleShareWhatsApp = (receipt: Receipt) => {
    const message = `*RECEIPT - BIZBOSS UGANDA*\n\n` +
      `Date: ${receipt.createdAt.toLocaleDateString()}\n` +
      `Time: ${receipt.createdAt.toLocaleTimeString()}\n\n` +
      `Items:\n` +
      receipt.items.map(item => 
        `${item.productName}\n${item.quantity} x UGX ${item.unitPrice.toLocaleString()} = UGX ${item.total.toLocaleString()}`
      ).join('\n\n') +
      `\n\n*TOTAL: UGX ${receipt.total.toLocaleString()}*\n` +
      `Payment: ${receipt.paymentMethod}\n\n` +
      `Thank you for your business!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Shared to WhatsApp",
      description: "Receipt shared via WhatsApp"
    });
  };

  const handlePreview = (receipt: Receipt) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(generateReceiptHTML(receipt));
      previewWindow.document.close();
    }
  };

  // Helper function to add a new receipt (to be called from SalesForm)
  const addReceipt = (sale: Sale, saleItems: any[]) => {
    const newReceipt: Receipt = {
      id: crypto.randomUUID(),
      saleId: sale.id,
      customerPhone: sale.customerPhone,
      items: saleItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      subtotal: sale.totalAmount,
      total: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt,
    };

    setReceipts(prev => [...prev, newReceipt]);
    return newReceipt;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Receipt History</h2>
          <p className="text-muted-foreground">View, print and share past receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No receipts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReceipts.slice().reverse().map((receipt) => (
            <Card key={receipt.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Receipt #{receipt.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {receipt.createdAt.toLocaleDateString()} at {receipt.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline">{receipt.paymentMethod}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receipt.customerPhone && (
                    <div className="text-sm">
                      <span className="font-medium">Customer:</span> {receipt.customerPhone}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {receipt.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.productName} ({item.quantity}x)</span>
                        <span>UGX {item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>UGX {receipt.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-3">
                    <Button 
                      onClick={() => handlePreview(receipt)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handlePrint(receipt)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button 
                      onClick={() => handleDownloadPDF(receipt)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => handleShareWhatsApp(receipt)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Export helper function for creating receipts
export const createReceipt = (sale: Sale, saleItems: any[], receipts: Receipt[], setReceipts: (receipts: Receipt[]) => void) => {
  const newReceipt: Receipt = {
    id: crypto.randomUUID(),
    saleId: sale.id,
    customerPhone: sale.customerPhone,
    items: saleItems.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    })),
    subtotal: sale.totalAmount,
    total: sale.totalAmount,
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt,
  };

  setReceipts([...receipts, newReceipt]);
  return newReceipt;
};