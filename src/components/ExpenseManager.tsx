import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Download } from 'lucide-react';
import { Expense } from '@/types';

interface ExpenseManagerProps {
  onExpenseAdd?: (expense: Expense) => void;
}

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Inventory',
  'Transportation',
  'Marketing',
  'Equipment',
  'Staff Salaries',
  'Other'
];

type PaymentMethod = 'cash' | 'mobile-money' | 'bank-transfer';
type MobileProvider = 'MTN' | 'Airtel';

export const ExpenseManager = ({ onExpenseAdd }: ExpenseManagerProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('bizboss-expenses', []);
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    paymentMethod: 'cash' as PaymentMethod,
    description: '',
    mobileMoneyProvider: 'MTN' as MobileProvider,
    mobileMoneyReference: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      description: formData.description,
      ...(formData.paymentMethod === 'mobile-money' && {
        mobileMoneyProvider: formData.mobileMoneyProvider,
        mobileMoneyReference: formData.mobileMoneyReference
      }),
      createdAt: new Date()
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    onExpenseAdd?.(newExpense);

    // Reset form
    setFormData({
      category: '',
      amount: '',
      paymentMethod: 'cash',
      description: '',
      mobileMoneyProvider: 'MTN',
      mobileMoneyReference: ''
    });

    toast({
      title: "Success",
      description: "Expense recorded successfully"
    });
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: "Success",
      description: "Expense deleted successfully"
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Payment Method', 'Description'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.createdAt.toLocaleDateString(),
        expense.category,
        expense.amount,
        expense.paymentMethod,
        expense.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayExpenses = expenses.filter(expense => 
    new Date(expense.createdAt).toDateString() === new Date().toDateString()
  ).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {todayExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Record New Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (UGX) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value: PaymentMethod) => 
                  setFormData(prev => ({ ...prev, paymentMethod: value }))
                }>
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

              {formData.paymentMethod === 'mobile-money' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={formData.mobileMoneyProvider} onValueChange={(value: MobileProvider) => 
                      setFormData(prev => ({ ...prev, mobileMoneyProvider: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                        <SelectItem value="Airtel">Airtel Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference ID</Label>
                    <Input
                      id="reference"
                      value={formData.mobileMoneyReference}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileMoneyReference: e.target.value }))}
                      placeholder="Enter reference ID"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Record Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.slice().reverse().map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{expense.category}</Badge>
                      <Badge variant="outline">{expense.paymentMethod}</Badge>
                      {expense.mobileMoneyProvider && (
                        <Badge variant="outline">{expense.mobileMoneyProvider}</Badge>
                      )}
                    </div>
                    <div className="font-semibold">UGX {expense.amount.toLocaleString()}</div>
                    {expense.description && (
                      <div className="text-sm text-muted-foreground">{expense.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {expense.createdAt.toLocaleDateString()} {expense.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(expense.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};