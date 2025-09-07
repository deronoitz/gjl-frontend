'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { useSettings, AppSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, DollarSign, Save, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { settings, isLoading, error, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<AppSettings['monthly_fee']>({ amount: 150000, currency: 'IDR' });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when remote settings change
  useEffect(() => {
    if (settings && !hasChanges) {
      setLocalSettings(settings.monthly_fee);
    }
  }, [settings, hasChanges]);

  if (!user || user.role !== 'admin') return null;

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  const handleCurrencyChange = (value: string) => {
    const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
    setLocalSettings({ 
      amount: numericValue, 
      currency: 'IDR' 
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const result = await updateSettings({
        monthly_fee: localSettings
      });

      if (result.success) {
        setMessage('Pengaturan berhasil disimpan!');
        setHasChanges(false);
      } else {
        setMessage(`Gagal menyimpan: ${result.message}`);
      }
    } catch {
      setMessage('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setIsSaving(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan ke pengaturan awal?')) {
      setLocalSettings({ amount: 150000, currency: 'IDR' });
      setHasChanges(true);
      setMessage('Pengaturan dikembalikan ke nilai awal. Jangan lupa simpan!');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
            <p className="text-muted-foreground">Memuat pengaturan...</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Kelola pengaturan umum aplikasi perumahan
          </p>
        </div>
        
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving} className="w-full md:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reset Default</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full md:w-auto">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            <span className="sm:hidden">{isSaving ? 'Simpan...' : 'Simpan'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat pengaturan: {error}
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert variant={message.includes('berhasil') ? 'default' : 'destructive'}>
          <Settings className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {hasChanges && (
        <Alert>
          <AlertDescription>
            Ada perubahan yang belum disimpan. Jangan lupa klik &quot;Simpan Perubahan&quot;.
          </AlertDescription>
        </Alert>
      )}

      {/* Fee Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2" />
            Pengaturan Biaya
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="monthlyFee" className="text-sm font-medium">Iuran Bulanan (Rp)</Label>
                <Input
                  id="monthlyFee"
                  value={formatCurrency(localSettings.amount.toString())}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  placeholder="150000"
                  disabled={isSaving}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Biaya iuran wajib per bulan untuk semua warga
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-foreground">
                  <strong>Nilai saat ini:</strong> Rp {formatCurrency(settings.monthly_fee.amount.toString())}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Terakhir diperbarui dari database
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
