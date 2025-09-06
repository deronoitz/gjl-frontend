'use client';

import { useState, useMemo } from 'react';
import { mockPayments } from '@/lib/mock-data';
import { Payment, FinancialRecord } from '@/types';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Upload, 
  Eye,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';

const MONTHS = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const YEARS = [
  { value: 'all', label: 'Semua Tahun' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'paid', label: 'Lunas' },
  { value: 'pending', label: 'Tertunda' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
];

const incomeCategories = [
  'Iuran Bulanan',
  'Iuran Keamanan', 
  'Denda Keterlambatan',
  'Sumbangan',
  'Lain-lain'
];

const expenseCategories = [
  'Pemeliharaan',
  'Kebersihan',
  'Keamanan',
  'Listrik',
  'Air',
  'Internet',
  'Administrasi',
  'Lain-lain'
];

export default function FinancePage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortColumn, setSortColumn] = useState<keyof Payment | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Manual input states
  const [manualRecords, setManualRecords] = useState<FinancialRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<FinancialRecord | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<(Payment & { isManual: boolean; proofUrl?: string; createdBy: string; createdAt: Date }) | null>(null);
  const [formData, setFormData] = useState({
    type: '' as 'income' | 'expense' | '',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    proofUrl: ''
  });
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  // Combine payments and manual records for display
  const allTransactions = useMemo(() => {
    const paymentTransactions = mockPayments.map(payment => ({
      ...payment,
      isManual: false,
      proofUrl: undefined,
      createdBy: payment.userId,
      createdAt: payment.paymentDate
    }));

    const manualTransactions = manualRecords.map(record => ({
      id: record.id,
      houseBlock: 'Manual',
      paymentDate: record.date,
      amount: record.amount,
      description: `[Manual] ${record.description}`,
      status: 'paid' as const,
      userId: record.createdBy,
      type: record.type,
      category: record.category,
      isManual: true,
      proofUrl: record.proofUrl,
      createdBy: record.createdBy,
      createdAt: record.createdAt
    }));

    return [...paymentTransactions, ...manualTransactions];
  }, [manualRecords]);

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = [...allTransactions];

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(payment => 
        payment.paymentDate.getMonth() + 1 === parseInt(selectedMonth)
      );
    }

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(payment => 
        payment.paymentDate.getFullYear() === parseInt(selectedYear)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(payment => payment.type === selectedType);
    }

    // Sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn] || 0;
        const bValue = b[sortColumn] || 0;
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allTransactions, selectedMonth, selectedYear, selectedStatus, selectedType, sortColumn, sortDirection]);

  // Handle functions for manual input
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.category || !formData.amount || !formData.description || !formData.date) {
      setMessage('Semua field wajib diisi kecuali bukti pembayaran');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Jumlah harus berupa angka positif');
      return;
    }

    // Validate proof URL if provided
    if (formData.proofUrl) {
      try {
        new URL(formData.proofUrl);
      } catch {
        setMessage('URL bukti pembayaran tidak valid');
        return;
      }
    }

    // Add new manual record
    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      amount,
      description: formData.description,
      date: new Date(formData.date),
      proofUrl: formData.proofUrl || undefined,
      createdBy: user?.id || '',
      createdAt: new Date()
    };
    setManualRecords([newRecord, ...manualRecords]);
    setMessage('Catatan keuangan berhasil ditambahkan');

    // Reset form
    resetForm();
    setIsDialogOpen(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      category: '',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      proofUrl: ''
    });
    setMessage('');
  };

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleSort = (column: keyof Payment) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Calculate summary
  const totalIncome = filteredAndSortedPayments
    .filter(p => p.type === 'income' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalExpense = filteredAndSortedPayments
    .filter(p => p.type === 'expense' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPaid = filteredAndSortedPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = filteredAndSortedPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = filteredAndSortedPayments.filter(p => p.status === 'paid').length;
  const pendingCount = filteredAndSortedPayments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
          <p className="text-muted-foreground">
            Laporan pembayaran iuran bulanan dan transaksi keuangan perumahan
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Input Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Input Manual Laporan Keuangan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipe Transaksi *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'income' | 'expense') => 
                        setFormData({ ...formData, type: value, category: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Pemasukan</SelectItem>
                        <SelectItem value="expense">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Tanggal *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={!formData.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Jumlah (Rp) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1000"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail transaksi..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="proofUrl">URL Bukti Pembayaran (Opsional)</Label>
                  <Input
                    id="proofUrl"
                    type="url"
                    value={formData.proofUrl}
                    onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                    placeholder="https://example.com/bukti.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link gambar bukti transaksi (nota, transfer, dll)
                  </p>
                </div>

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">
                    <Upload className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {message && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalIncome.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {filteredAndSortedPayments.filter(p => p.type === 'income' && p.status === 'paid').length} transaksi
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {totalExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {filteredAndSortedPayments.filter(p => p.type === 'expense' && p.status === 'paid').length} transaksi
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Pemasukan - Pengeluaran
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidCount}</div>
            <p className="text-xs text-muted-foreground">
              Rp {totalPaid.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tertunda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Rp {totalPending.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Bulan</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tahun</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipe</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('houseBlock')}
                >
                  Blok Rumah
                  {sortColumn === 'houseBlock' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('type')}
                >
                  Tipe Transaksi
                  {sortColumn === 'type' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('category')}
                >
                  Kategori
                  {sortColumn === 'category' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('paymentDate')}
                >
                  Tanggal
                  {sortColumn === 'paymentDate' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('amount')}
                >
                  Nominal
                  {sortColumn === 'amount' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortColumn === 'status' && (
                    <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Tidak ada data yang sesuai dengan filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.houseBlock}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.type === 'income' ? 'default' : 'destructive'}
                        className={payment.type === 'income' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {payment.type === 'income' ? (
                          <><TrendingUp className="h-3 w-3 mr-1" />Masuk</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" />Keluar</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>
                      {format(payment.paymentDate, 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {payment.type === 'income' ? '+' : '-'}Rp {payment.amount.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                        {payment.status === 'paid' ? 'Lunas' : 'Tertunda'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingTransaction(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.isManual && payment.proofUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingProof(payment.proofUrl!)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!viewingDetail} onOpenChange={() => setViewingDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Input Manual</DialogTitle>
          </DialogHeader>
          {viewingDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipe Transaksi</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={viewingDetail.type === 'income' ? 'default' : 'destructive'}
                      className={viewingDetail.type === 'income' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {viewingDetail.type === 'income' ? (
                        <><TrendingUp className="h-3 w-3 mr-1" />Pemasukan</>
                      ) : (
                        <><TrendingDown className="h-3 w-3 mr-1" />Pengeluaran</>
                      )}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Kategori</Label>
                  <p className="mt-1 font-medium">{viewingDetail.category}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal</Label>
                  <p className="mt-1 font-medium">
                    {format(viewingDetail.date, 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <Label>Jumlah</Label>
                  <p className={`mt-1 font-bold text-lg ${
                    viewingDetail.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {viewingDetail.type === 'income' ? '+' : '-'}Rp {viewingDetail.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Deskripsi</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">{viewingDetail.description}</p>
              </div>
              
              <div>
                <Label>Dibuat Oleh</Label>
                <p className="mt-1 text-sm">{viewingDetail.createdBy} pada {format(viewingDetail.createdAt, 'dd MMM yyyy HH:mm', { locale: id })}</p>
              </div>
              
              {viewingDetail.proofUrl && (
                <div>
                  <Label>Bukti Pembayaran</Label>
                  <div className="mt-2 aspect-video relative bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={viewingDetail.proofUrl}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setViewingDetail(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Modal */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blok Rumah</Label>
                  <p className="mt-1 font-medium">{viewingTransaction.houseBlock}</p>
                </div>
                <div>
                  <Label>Tipe Transaksi</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={viewingTransaction.type === 'income' ? 'default' : 'destructive'}
                      className={viewingTransaction.type === 'income' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {viewingTransaction.type === 'income' ? (
                        <><TrendingUp className="h-3 w-3 mr-1" />Pemasukan</>
                      ) : (
                        <><TrendingDown className="h-3 w-3 mr-1" />Pengeluaran</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <p className="mt-1 font-medium">{viewingTransaction.category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={viewingTransaction.status === 'paid' ? 'default' : 'destructive'}>
                      {viewingTransaction.status === 'paid' ? 'Lunas' : 'Tertunda'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal</Label>
                  <p className="mt-1 font-medium">
                    {format(viewingTransaction.paymentDate, 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <Label>Jumlah</Label>
                  <p className={`mt-1 font-bold text-lg ${
                    viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {viewingTransaction.type === 'income' ? '+' : '-'}Rp {viewingTransaction.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Keterangan</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">{viewingTransaction.description}</p>
              </div>
              
              {viewingTransaction.isManual && (
                <div>
                  <Label>Dibuat Oleh</Label>
                  <p className="mt-1 text-sm">{viewingTransaction.createdBy} pada {format(viewingTransaction.createdAt, 'dd MMM yyyy HH:mm', { locale: id })}</p>
                </div>
              )}
              
              {viewingTransaction.proofUrl && (
                <div>
                  <Label>Bukti Pembayaran</Label>
                  <div className="mt-2 space-y-2">
                    <div className="aspect-video relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                      <Image
                        src={viewingTransaction.proofUrl}
                        alt="Bukti Pembayaran"
                        fill
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>📸 Bukti pembayaran tersedia</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewingProof(viewingTransaction.proofUrl!)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Lihat Penuh
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!viewingTransaction.proofUrl && viewingTransaction.status === 'paid' && (
                <div>
                  <Label>Bukti Pembayaran</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm text-muted-foreground">
                    📄 Tidak ada bukti pembayaran yang tersedia
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setViewingTransaction(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof Viewer Dialog */}
      <Dialog open={!!viewingProof} onOpenChange={() => setViewingProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingProof && (
              <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                <Image
                  src={viewingProof}
                  alt="Bukti Pembayaran"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setViewingProof(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
