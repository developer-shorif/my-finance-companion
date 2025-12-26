import React, { useState, useRef } from 'react';
import { Plus, Trash2, Tag, Wallet, Info, Palette, PiggyBank, Building2, Upload, Image } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/financeUtils';

const SettingsPage: React.FC = () => {
  const { 
    data, 
    addCustomExpenseCategory, 
    removeCustomExpenseCategory,
    addCustomIncomeSource,
    removeCustomIncomeSource,
    getAllExpenseCategories,
    getAllIncomeSources,
    updateAppBranding,
    setAutoSavingsAccount,
    getAutoSavingsAccount,
  } = useFinance();

  const [newCategory, setNewCategory] = useState('');
  const [newSource, setNewSource] = useState('');
  const [appName, setAppName] = useState(data.customSettings.appBranding.appName);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleAppNameChange = () => {
    if (appName.trim()) {
      updateAppBranding({ appName: appName.trim() });
      toast.success('App name updated');
    }
  };

  const handleFileUpload = (type: 'icon' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'icon') {
        updateAppBranding({ appIcon: base64 });
        toast.success('App icon updated');
      } else {
        updateAppBranding({ appLogo: base64 });
        toast.success('App logo updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAutoSavingsAccountChange = (accountId: string) => {
    setAutoSavingsAccount(accountId === 'none' ? undefined : accountId);
    toast.success(accountId === 'none' ? 'Auto savings account removed' : 'Auto savings account set');
  };

  const defaultCategories = ['Food', 'Rent', 'Transport', 'Utility', 'EMI', 'Medical', 'Entertainment', 'Shopping', 'Other'];
  const defaultSources = ['Client', 'Salary', 'Business', 'Other'];
  const autoSavingsAccount = getAutoSavingsAccount();

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your finance tracker</p>
        </div>

        {/* App Branding */}
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">App Branding</h2>
              <p className="text-sm text-muted-foreground">Customize app name and appearance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>App Name</Label>
              <div className="flex gap-2">
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter app name"
                  className="flex-1"
                />
                <Button onClick={handleAppNameChange} size="sm">Save</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>App Icon</Label>
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('icon', e)}
                />
                <div 
                  onClick={() => iconInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {data.customSettings.appBranding.appIcon ? (
                    <img src={data.customSettings.appBranding.appIcon} alt="App Icon" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload Icon</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>App Logo</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('logo', e)}
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {data.customSettings.appBranding.appLogo ? (
                    <img src={data.customSettings.appBranding.appLogo} alt="App Logo" className="h-12 max-w-full object-contain" />
                  ) : (
                    <>
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload Logo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Savings Account */}
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <PiggyBank className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Auto Savings Account</h2>
              <p className="text-sm text-muted-foreground">Choose where 20% auto savings goes</p>
            </div>
          </div>

          <div className="space-y-3">
            <Select 
              value={data.customSettings.autoSavingsAccountId || 'none'} 
              onValueChange={handleAutoSavingsAccountChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No auto deposit</SelectItem>
                {data.bankAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.bankName} ({acc.walletType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {autoSavingsAccount && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                <Building2 className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{autoSavingsAccount.bankName}</p>
                  <p className="text-xs text-muted-foreground">Balance: ৳{formatCurrency(autoSavingsAccount.currentBalance)}</p>
                </div>
              </div>
            )}

            {data.bankAccounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add accounts in the Accounts section to enable auto savings deposit.
              </p>
            )}
          </div>
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
            <p className="mt-2">Auto savings will automatically deposit to your selected account when you add income.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
