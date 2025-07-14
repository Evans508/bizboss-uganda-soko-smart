import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

interface InventoryManagerProps {
  products: Product[];
  onProductAdd: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onProductUpdate: (id: string, updates: Partial<Product>) => void;
  onProductDelete: (id: string) => void;
}

export const InventoryManager = ({ 
  products, 
  onProductAdd, 
  onProductUpdate, 
  onProductDelete 
}: InventoryManagerProps) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    category: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      category: ""
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.sellingPrice <= 0) return;

    if (editingProduct) {
      onProductUpdate(editingProduct.id, {
        ...formData,
        updatedAt: new Date()
      });
    } else {
      onProductAdd(formData);
    }
    
    resetForm();
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      category: product.category || ""
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          {t('inventory')}
        </h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addProduct')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? t('edit') : t('addProduct')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('productName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">{t('costPrice')} ({t('ugx')})</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">{t('sellingPrice')} ({t('ugx')})</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">{t('stock')}</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? t('save') : t('addProduct')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost:</span>
                  <span>{t('ugx')} {product.costPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{t('ugx')} {product.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={product.stock <= 5 ? "text-warning font-medium" : ""}>
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit/Unit:</span>
                  <span className="text-success font-medium">
                    {t('ugx')} {(product.sellingPrice - product.costPrice).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => startEdit(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {t('edit')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onProductDelete(product.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No products yet. Add your first product to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};