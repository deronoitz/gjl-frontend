'use client';

import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function MonthlyFeeCard() {
  const { settings, isLoading } = useSettings();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Iuran Bulanan</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-6 md:h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardTitle className="text-sm font-medium text-emerald-800">Iuran Bulanan</CardTitle>
        <DollarSign className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="text-xl md:text-2xl font-bold text-emerald-700 mb-1">
          {formatCurrency(settings.monthly_fee.amount)}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Biaya iuran wajib per bulan
        </p>
      </CardContent>
    </Card>
  );
}
