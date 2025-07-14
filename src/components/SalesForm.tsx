import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, Sale } from "@/types";
import { Plus, ShoppingCart } from "lucide-react";

interface SalesFormProps {
  products: Product[];
  onSaleRecord: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
}

export const SalesForm = ({ products, onSaleRecord }: SalesFormProps) => {
  const { t } = useLanguage();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile-money' | 'bank-transfer'>('cash');
  const [customerPhone, setCustomerPhone] = useState<string>("");

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalAmount = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;
  const profit = selectedProduct ? (selectedProduct.sellingPrice - selectedProduct.costPrice) * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || quantity <= 0) return;
    
    if (quantity > selectedProduct.stock) {
      alert(`Not enough stock! Only ${selectedProduct.stock} items available.`);
      return;
    }

    const sale: Omit<Sale, 'id' | 'createdAt'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      totalAmount,
      profit,
      paymentMethod,
      customerPhone: customerPhone || undefined
    };

    onSaleRecord(sale);
    
    // Reset form
    setSelectedProductId("");
    setQuantity(1);
    setCustomerPhone("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('recordSale')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">{t('product')}</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder={`${t('product')}...`} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {t('ugx')} {product.sellingPrice} ({product.stock} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t('quantity')}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('price')} ({t('ugx')})</Label>
                    <Input
                      value={selectedProduct.sellingPrice.toLocaleString()}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Customer Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+256..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{t('total')}:</span>
                    <span>{t('ugx')} {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Profit:</span>
                    <span>{t('ugx')} {profit.toLocaleString()}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Sale
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};