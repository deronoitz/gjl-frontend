'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { useFinancialRecords, useHouseBlocks, FinancialRecord } from '@/hooks/use-financial-records';
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
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Upload, 
  Eye,
  FileText,
  X,
  Loader2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { exportFinancialReportToPDF } from '@/lib/pdf-export';

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
  
  // Custom hooks for API data
  const {
    records,
    summary,
    loading,
    error,
    fetchRecords,
    createRecord,
    uploadProof,
  } = useFinancialRecords();

  const { users } = useHouseBlocks();

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<FinancialRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    type: '' as 'income' | 'expense' | '',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    houseBlock: '',
    user_uuid: ''
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  // Fetch records when filters change
  useEffect(() => {
    if (isAdmin) {
      const filters: Record<string, string> = {};
      if (selectedMonth !== 'all') filters.month = selectedMonth;
      if (selectedYear !== 'all') filters.year = selectedYear;
      if (selectedType !== 'all') filters.type = selectedType;
      
      fetchRecords(filters);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [selectedMonth, selectedYear, selectedType, isAdmin, fetchRecords]);

  // Calculate pagination data
  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle functions for manual input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    } else {
      setProofFile(null);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('File harus berupa gambar (JPG, PNG, GIF) atau PDF');
      return false;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ukuran file tidak boleh lebih dari 5MB');
      return false;
    }
    
    setProofFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    setMessage('');
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.type || !formData.category || !formData.amount || !formData.description || !formData.date) {
      setMessage('Semua field wajib diisi kecuali blok rumah dan bukti pembayaran');
      setIsSubmitting(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Jumlah harus berupa angka positif');
      setIsSubmitting(false);
      return;
    }

    try {
      let proofUrl: string | undefined = undefined;
      
      // Upload file if selected
      if (proofFile) {
        const uploadResult = await uploadProof(proofFile);
        if (uploadResult) {
          proofUrl = uploadResult.url;
        } else {
          setMessage('Gagal mengupload file bukti pembayaran');
          setIsSubmitting(false);
          return;
        }
      }

      // Create record
      const recordData = {
        type: formData.type as 'income' | 'expense',
        category: formData.category,
        amount,
        description: formData.description,
        date: formData.date,
        house_block: formData.houseBlock || undefined,
        user_uuid: formData.user_uuid || undefined,
        proof_url: proofUrl,
      };

      const result = await createRecord(recordData);
      
      if (result) {
        setMessage('Catatan keuangan berhasil ditambahkan');
        resetForm();
        setIsDialogOpen(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal menambahkan catatan keuangan');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan saat menyimpan data');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      category: '',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      houseBlock: '',
      user_uuid: ''
    });
    setProofFile(null);
    setPreviewUrl(null);
    setMessage('');
  };

  const handleExportPDF = async () => {
    if (records.length === 0) {
      setMessage('Tidak ada data untuk di export');
      return;
    }

    setIsExporting(true);
    try {
      const filters = {
        month: selectedMonth !== 'all' ? selectedMonth : undefined,
        year: selectedYear !== 'all' ? selectedYear : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
      };

      const success = await exportFinancialReportToPDF({
        records,
        summary,
        filters
      });

      if (success) {
        setMessage('Laporan PDF berhasil diunduh');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal membuat file PDF');
      }
    } catch (error) {
      console.error('Export PDF error:', error);
      setMessage('Terjadi kesalahan saat membuat PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Laporan pembayaran iuran bulanan dan transaksi keuangan perumahan
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Export PDF Button */}
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleExportPDF}
            disabled={isExporting || records.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? 'Mengunduh...' : 'Export PDF'}
            </span>
            <span className="sm:hidden">
              {isExporting ? 'Mengunduh...' : 'PDF'}
            </span>
          </Button>

          {/* Input Manual Button for Admin */}
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Input Manual</span>
                  <span className="sm:hidden">Input</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">Input Manual Laporan Keuangan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium">Tipe Transaksi *</Label>
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
                    <Label htmlFor="date" className="text-sm font-medium">Tanggal *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Kategori *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={!formData.type}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="amount" className="text-sm font-medium">Jumlah (Rp) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1000"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="houseBlock" className="text-sm font-medium">Warga/Blok Rumah (Opsional)</Label>
                  <Select 
                    value={formData.user_uuid || 'none'} 
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData({ ...formData, user_uuid: '', houseBlock: '' });
                      } else {
                        const selectedUser = users.find(u => u.id === value);
                        setFormData({ 
                          ...formData, 
                          user_uuid: value, 
                          houseBlock: selectedUser?.house_block || '' 
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih warga (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak dipilih</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pilih warga jika transaksi terkait dengan rumah tertentu
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail transaksi..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="proofFile" className="text-sm font-medium">Bukti Pembayaran (Opsional)</Label>
                  <div 
                    className="mt-1 relative"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {!proofFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <label htmlFor="proofFile" className="cursor-pointer text-blue-600 hover:text-blue-500">
                              Klik untuk upload file
                            </label>
                            {' '}atau drag & drop di sini
                          </div>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, GIF atau PDF (maks. 5MB)
                          </p>
                        </div>
                        <Input
                          id="proofFile"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {proofFile.type.startsWith('image/') && previewUrl ? (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                                <Image 
                                  src={previewUrl} 
                                  alt="Preview" 
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-10 w-10 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {proofFile.name}
                                </p>
                                <p className="text-xs text-green-600">
                                  {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {proofFile.type.startsWith('image/') ? 'Gambar' : 'Dokumen PDF'}
                                </p>
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Change file
                                    const fileInput = document.getElementById('proofFile') as HTMLInputElement;
                                    if (fileInput) fileInput.click();
                                  }}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Ubah
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Clean up preview URL
                                    if (previewUrl) {
                                      URL.revokeObjectURL(previewUrl);
                                    }
                                    setProofFile(null);
                                    setPreviewUrl(null);
                                    // Reset file input
                                    const fileInput = document.getElementById('proofFile') as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Input
                          id="proofFile"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {message && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              Rp {summary.total_income.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {records.filter(r => r.type === 'income').length} transaksi
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">
              Rp {summary.total_expense.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foregreen">
              Dari {records.filter(r => r.type === 'expense').length} transaksi
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg md:text-2xl font-bold ${summary.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {summary.net_balance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Pemasukan - Pengeluaran
            </p>
          </CardContent>
        </Card>
        
      </div>

      {/* Show loading or error */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data...</span>
        </div>
      )}

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show success message */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4 md:pb-0">
          <CardTitle className="text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Data Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada data yang sesuai dengan filter</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Layout */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blok Rumah</TableHead>
                      <TableHead>Tipe Transaksi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.house_block || record.user?.house_number || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.type === 'income' ? 'default' : 'destructive'}
                            className={record.type === 'income' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {record.type === 'income' ? (
                              <><TrendingUp className="h-3 w-3 mr-1" />Masuk</>
                            ) : (
                              <><TrendingDown className="h-3 w-3 mr-1" />Keluar</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.category}</TableCell>
                        <TableCell>
                          {format(new Date(record.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                        </TableCell>
                        <TableCell className={`font-semibold ${
                          record.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.type === 'income' ? '+' : '-'}Rp {record.amount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.created_by_user?.name || 'System'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingTransaction(record)}
                              title="Lihat detail transaksi"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {record.proof_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (record.proof_url!.toLowerCase().includes('.pdf')) {
                                    // For PDFs, open in new tab
                                    window.open(record.proof_url!, '_blank');
                                  } else {
                                    // For images, show in modal
                                    setViewingProof(record.proof_url!);
                                  }
                                }}
                                title="Lihat bukti pembayaran"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {generatePageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page as number);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  {/* Pagination info */}
                  <div className="text-sm text-muted-foreground mt-2 text-center">
                    Menampilkan {Math.min(startIndex + 1, totalRecords)} - {Math.min(endIndex, totalRecords)} dari {totalRecords} transaksi
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Viewer Modal */}
      {viewingProof && (
        <Dialog open={!!viewingProof} onOpenChange={() => setViewingProof(null)}>
          <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bukti Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="mt-4 pb-4">
              {viewingProof.toLowerCase().includes('.pdf') ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">File PDF tidak dapat ditampilkan di sini</p>
                  <Button onClick={() => window.open(viewingProof, '_blank')}>
                    Buka dalam Tab Baru
                  </Button>
                </div>
              ) : (
                <div className="relative max-h-96 overflow-hidden rounded-lg">
                  <Image
                    src={viewingProof}
                    alt="Bukti Pembayaran"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Transaction Detail Modal */}
      {viewingTransaction && (
        <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Detail Transaksi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Blok Rumah</Label>
                  <p className="mt-1 font-medium">
                    {viewingTransaction.house_block || viewingTransaction.user?.house_number || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipe Transaksi</Label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Kategori</Label>
                  <p className="mt-1 font-medium">{viewingTransaction.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800">Selesai</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tanggal</Label>
                  <p className="mt-1 font-medium">
                    {format(new Date(viewingTransaction.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Jumlah</Label>
                  <p className={`mt-1 font-bold text-lg ${
                    viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {viewingTransaction.type === 'income' ? '+' : '-'}Rp {viewingTransaction.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Keterangan</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">{viewingTransaction.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Dibuat Oleh</Label>
                <p className="mt-1 text-sm">
                  {viewingTransaction.created_by_user?.name || 'System'} pada{' '}
                  {format(new Date(viewingTransaction.created_at), 'dd MMM yyyy HH:mm:ss', { locale: id })}
                </p>
              </div>
              
              {viewingTransaction.proof_url && (
                <div>
                  <Label className="text-sm font-medium">Bukti Pembayaran</Label>
                  <div className="mt-2 space-y-2">
                    {viewingTransaction.proof_url.toLowerCase().includes('.pdf') ? (
                      <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-600 mb-2">File bukti pembayaran</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(viewingTransaction.proof_url!, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat File
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-video relative bg-gray-100 rounded overflow-hidden max-h-64">
                        <Image
                          src={viewingTransaction.proof_url}
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
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setViewingTransaction(null)} className="w-full md:w-auto">
                  Tutup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
