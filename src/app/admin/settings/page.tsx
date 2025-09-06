'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, DollarSign, Save, RotateCcw } from 'lucide-react';

interface AppSettings {
  monthlyFee: number;
  appName: string;
  adminContact: string;
}

const defaultSettings: AppSettings = {
  monthlyFee: 150000,
  appName: 'Perumahan App',
  adminContact: '081234567890'
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Try to load from localStorage, fallback to default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  if (!user || user.role !== 'admin') return null;

  const handleInputChange = (field: keyof AppSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  const handleCurrencyChange = (field: keyof AppSettings, value: string) => {
    const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
    handleInputChange(field, numericValue);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setMessage('Pengaturan berhasil disimpan!');
      setHasChanges(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Gagal menyimpan pengaturan. Silakan coba lagi.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan ke pengaturan default?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
      setMessage('Pengaturan dikembalikan ke default. Jangan lupa simpan!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan umum aplikasi perumahan
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Default
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {message && (
        <Alert>
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
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Pengaturan Biaya
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="monthlyFee">Iuran Bulanan (Rp)</Label>
              <Input
                id="monthlyFee"
                value={formatCurrency(settings.monthlyFee.toString())}
                onChange={(e) => handleCurrencyChange('monthlyFee', e.target.value)}
                placeholder="150000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Biaya iuran wajib per bulan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appName">Nama Aplikasi</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              placeholder="Perumahan App"
            />
          </div>
          
          <div>
            <Label htmlFor="adminContact">Kontak Admin</Label>
            <Input
              id="adminContact"
              value={settings.adminContact}
              onChange={(e) => handleInputChange('adminContact', e.target.value)}
              placeholder="081234567890"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nomor WhatsApp atau telepon admin yang bisa dihubungi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      {/* Current Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Pengaturan Saat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Biaya yang Berlaku:</h4>
              <ul className="text-sm space-y-1">
                <li>Iuran Bulanan: Rp {settings.monthlyFee.toLocaleString('id-ID')}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Kontak Admin:</h4>
              <ul className="text-sm space-y-1">
                <li>Admin: {settings.adminContact}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Iuran Bulanan:</strong> Nominal ini akan muncul sebagai pilihan default saat warga membuat pembayaran</p>
            <p>• <strong>Kontak Admin:</strong> Ditampilkan di halaman pembayaran untuk pertanyaan warga</p>
            <p>• <strong>Payment Gateway:</strong> Pembayaran akan diproses melalui payment gateway yang terintegrasi</p>
            <p>• Semua perubahan akan langsung berlaku setelah disimpan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
