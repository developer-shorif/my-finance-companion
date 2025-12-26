import React, { useState } from 'react';
import { Plus, Trash2, Tag, Wallet, Info } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const { 
    data, 
    addCustomExpenseCategory, 
    removeCustomExpenseCategory,
    addCustomIncomeSource,
    removeCustomIncomeSource,
    getAllExpenseCategories,
    getAllIncomeSources,
  } = useFinance();

  const [newCategory, setNewCategory] = useState('');
  const [newSource, setNewSource] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (getAllExpenseCategories().includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }
    addCustomExpenseCategory(newCategory.trim());
    setNewCategory('');
    toast.success('Category added');
  };

  const handleAddSource = () => {
    if (!newSource.trim()) return;
    if (getAllIncomeSources().includes(newSource.trim())) {
      toast.error('Source already exists');
      return;
    }
    addCustomIncomeSource(newSource.trim());
    setNewSource('');
    toast.success('Income source added');
  };

  const defaultCategories = ['Food', 'Rent', 'Transport', 'Utility', 'EMI', 'Medical', 'Entertainment', 'Shopping', 'Other'];
  const defaultSources = ['Client', 'Salary', 'Business', 'Other'];

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your finance tracker</p>
        </div>

        {/* Custom Expense Categories */}
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Expense Categories</h2>
              <p className="text-sm text-muted-foreground">Add custom categories for expenses</p>
            </div>
          </div>

          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1"
            />
            <Button onClick={handleAddCategory} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom categories */}
          {data.customSettings.customExpenseCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Custom Categories</p>
              <div className="flex flex-wrap gap-2">
                {data.customSettings.customExpenseCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {category}
                    <button
                      onClick={() => removeCustomExpenseCategory(category)}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Default categories */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Default Categories</p>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Income Sources */}
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Income Sources</h2>
              <p className="text-sm text-muted-foreground">Add custom sources for income</p>
            </div>
          </div>

          {/* Add new source */}
          <div className="flex gap-2">
            <Input
              placeholder="New income source"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
              className="flex-1"
            />
            <Button onClick={handleAddSource} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom sources */}
          {data.customSettings.customIncomeSources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Custom Sources</p>
              <div className="flex flex-wrap gap-2">
                {data.customSettings.customIncomeSources.map((source) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm"
                  >
                    {source}
                    <button
                      onClick={() => removeCustomIncomeSource(source)}
                      className="ml-1 hover:bg-success/20 rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Default sources */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Default Sources</p>
            <div className="flex flex-wrap gap-2">
              {defaultSources.map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Custom categories and income sources will appear in the dropdown menus when adding new entries.</p>
            <p className="mt-2">Default items cannot be removed but can be hidden in future updates.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
