'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/CustomAuthContext';
import { User as UserType } from '@/hooks/use-users-admin';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { FileText, Download, Calendar, Users, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PaymentReportData {
  user: UserType;
  payments: { [month: number]: boolean };
  totalPaid: number;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function PaymentReportPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [users, setUsers] = useState<UserType[]>([]);
  const [reportData, setReportData] = useState<PaymentReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllMonths, setSelectAllMonths] = useState(false);
  const { paymentData, fetchPaymentStatus, createBulkPaymentStatus } = usePaymentStatus();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('house_number');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (!authLoading) {
      fetchUsers();
    }
  }, [currentUser, authLoading]);

  // Fetch payment data for the selected year
  useEffect(() => {
    if (users.length > 0) {
      fetchPaymentStatus({ tahun: selectedYear });
    }
  }, [selectedYear, users, fetchPaymentStatus]);

  // Generate report data
  useEffect(() => {
    if (users.length > 0) {
      const data = users.map(user => {
        const userPayments: { [month: number]: boolean } = {};
        let totalPaid = 0;

        // Check each month for payment records
        for (let month = 1; month <= 12; month++) {
          const hasPayment = paymentData.some(payment => 
            payment.user_uuid === user.id && 
            payment.bulan === month && 
            payment.tahun === selectedYear
          );
          userPayments[month] = hasPayment;
          if (hasPayment) totalPaid++;
        }

        return {
          user,
          payments: userPayments,
          totalPaid
        };
      });

      setReportData(data);
      setLoading(false);
    }
  }, [users, paymentData, selectedYear]);

  // Handle select all toggle
  const handleSelectAll = (checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle individual user selection
  const handleUserSelect = (userId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    const newSelected = new Set(selectedUsers);
    if (isChecked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };

  // Handle select all months toggle
  const handleSelectAllMonths = (checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectAllMonths(isChecked);
    if (isChecked) {
      setSelectedMonths(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
    } else {
      setSelectedMonths(new Set());
    }
  };

  // Handle individual month selection
  const handleMonthSelect = (month: number, checked: boolean | string) => {
    const isChecked = checked === true;
    const newSelected = new Set(selectedMonths);
    if (isChecked) {
      newSelected.add(month);
    } else {
      newSelected.delete(month);
    }
    setSelectedMonths(newSelected);
    setSelectAllMonths(newSelected.size === 12);
  };

  // Handle bulk payment addition for multiple months
  const handleBulkPaymentMultipleMonths = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Pilih minimal satu pengguna terlebih dahulu', {
        description: 'Gunakan checkbox pada kolom pertama tabel untuk memilih pengguna'
      });
      return;
    }

    if (selectedMonths.size === 0) {
      toast.error('Pilih minimal satu bulan terlebih dahulu', {
        description: 'Pilih bulan pada section "Pilih Bulan" di bawah ini'
      });
      return;
    }

    const monthNames = Array.from(selectedMonths).map(m => MONTHS[m - 1]).join(', ');
    const confirmMessage = `Apakah Anda yakin ingin menambahkan pembayaran untuk bulan: ${monthNames} (${selectedYear}) untuk ${selectedUsers.size} warga yang dipilih?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Memproses pembayaran...', {
      description: `Menambahkan status pembayaran untuk ${selectedUsers.size} warga di ${selectedMonths.size} bulan`
    });

    try {
      setLoading(true);
      
      let totalProcessed = 0;
      let totalCreated = 0;
      let totalAlreadyExists = 0;
      
      // Process each month separately
      for (const month of Array.from(selectedMonths)) {
        const result = await createBulkPaymentStatus({
          user_uuids: Array.from(selectedUsers),
          bulan: month,
          tahun: selectedYear
        });
        
        if (result.stats) {
          totalProcessed += result.stats.requested;
          totalCreated += result.stats.created;
          totalAlreadyExists += result.stats.alreadyExists;
        }
      }
      
      // Refresh data
      fetchPaymentStatus({ tahun: selectedYear });
      
      // Clear selections
      setSelectedUsers(new Set());
      setSelectedMonths(new Set());
      setSelectAll(false);
      setSelectAllMonths(false);
      
      // Show detailed success message
      let successMessage = `✅ Berhasil memproses ${totalProcessed} record pembayaran`;
      if (totalCreated > 0) {
        successMessage += ` (${totalCreated} record baru`;
        if (totalAlreadyExists > 0) {
          successMessage += `, ${totalAlreadyExists} sudah ada sebelumnya)`;
        } else {
          successMessage += `)`;
        }
      } else if (totalAlreadyExists > 0) {
        successMessage += ` (semua ${totalAlreadyExists} record sudah ada sebelumnya)`;
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      toast.success('Berhasil memproses pembayaran!', {
        description: successMessage,
        duration: 5000
      });
    } catch (error) {
      console.error('Error adding bulk payment:', error);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      toast.error('Gagal menambahkan pembayaran', {
        description: 'Terjadi kesalahan saat memproses data. Silakan coba lagi.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      const headers = ['Blok Rumah', 'Nama', ...MONTHS, 'Total Bayar', 'Status'];
      const csvData = reportData.map(data => [
        data.user.house_number,
        data.user.name,
        ...Array.from({ length: 12 }, (_, index) => {
          const monthNumber = index + 1;
          return data.payments[monthNumber] ? 'V' : 'X';
        }),
        `${data.totalPaid}/12`,
        data.totalPaid >= 10 ? 'Baik' : data.totalPaid >= 6 ? 'Cukup' : 'Kurang'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `laporan-pembayaran-${selectedYear}.csv`;
      link.click();
      
      toast.success('File CSV berhasil diunduh!', {
        description: `Laporan pembayaran tahun ${selectedYear} telah disimpan`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Gagal mengunduh file CSV', {
        description: 'Terjadi kesalahan saat membuat file. Silakan coba lagi.',
        duration: 4000
      });
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const totalPaymentsPossible = totalUsers * 12;
  const totalPaymentsMade = reportData.reduce((sum, data) => sum + data.totalPaid, 0);
  const paymentPercentage = totalPaymentsPossible > 0 ? (totalPaymentsMade / totalPaymentsPossible) * 100 : 0;

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Access control
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground">Halaman ini hanya dapat diakses oleh admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Laporan Pembayaran Iuran</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Kelola status pembayaran iuran bulanan seluruh warga
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <Label htmlFor="year" className="text-sm font-medium">Tahun:</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24 md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Warga</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Pembayaran</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalPaymentsMade}</div>
            <p className="text-xs text-muted-foreground">
              dari {totalPaymentsPossible} kemungkinan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Persentase Bayar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{paymentPercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Terpilih</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{selectedUsers.size}</div>
            <p className="text-xs text-muted-foreground">
              warga, {selectedMonths.size} bulan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Aksi Massal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pilih warga dan bulan untuk menambahkan pembayaran secara massal. 
            {selectedUsers.size > 0 && (
              <span className="font-medium text-foreground"> {selectedUsers.size} warga dipilih.</span>
            )}
            {selectedMonths.size > 0 && (
              <span className="font-medium text-foreground"> {selectedMonths.size} bulan dipilih.</span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Month Selection */}
            <div>
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-3">
                <Label className="text-sm font-medium">Pilih Bulan:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-months"
                    checked={selectAllMonths}
                    onCheckedChange={handleSelectAllMonths}
                  />
                  <Label htmlFor="select-all-months" className="text-sm">Pilih Semua Bulan</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                {MONTHS.map((month, index) => {
                  const monthNumber = index + 1;
                  return (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${monthNumber}`}
                        checked={selectedMonths.has(monthNumber)}
                        onCheckedChange={(checked) => handleMonthSelect(monthNumber, checked)}
                      />
                      <Label htmlFor={`month-${monthNumber}`} className="text-sm cursor-pointer">
                        {month.substring(0, 3)}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleBulkPaymentMultipleMonths}
                disabled={selectedUsers.size === 0 || selectedMonths.size === 0 || loading}
                size="lg"
                className="px-4 md:px-8 w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Memproses...</span>
                    <span className="sm:hidden">Proses...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Tambahkan Pembayaran ({selectedUsers.size} warga, {selectedMonths.size} bulan)
                    </span>
                    <span className="sm:hidden">
                      Tambah ({selectedUsers.size}w, {selectedMonths.size}b)
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Report Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Laporan Pembayaran {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Memuat data pembayaran...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tidak ada data warga ditemukan</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-3">
                {reportData.map((data) => (
                  <div key={data.user.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedUsers.has(data.user.id)}
                          onCheckedChange={(checked) => handleUserSelect(data.user.id, checked as boolean)}
                        />
                        <div>
                          <p className="font-medium">{data.user.house_number}</p>
                          <p className="text-sm text-muted-foreground">{data.user.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={data.totalPaid >= 10 ? "default" : data.totalPaid >= 6 ? "secondary" : "destructive"}>
                          {data.totalPaid >= 10 ? "Baik" : data.totalPaid >= 6 ? "Cukup" : "Kurang"}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{data.totalPaid}/12</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 12 }, (_, index) => {
                        const monthNumber = index + 1;
                        const isPaid = data.payments[monthNumber];
                        return (
                          <div key={monthNumber} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">
                              {MONTHS[index].substring(0, 3)}
                            </div>
                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isPaid ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-24">Blok Rumah</TableHead>
                      <TableHead className="min-w-48">Nama</TableHead>
                      {MONTHS.map((month) => (
                        <TableHead key={month} className="text-center min-w-16">
                          <div className="text-xs">{month.substring(0, 3)}</div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-20">Total</TableHead>
                      <TableHead className="text-center min-w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((data) => (
                      <TableRow key={data.user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(data.user.id)}
                            onCheckedChange={(checked) => handleUserSelect(data.user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {data.user.house_number}
                        </TableCell>
                        <TableCell>{data.user.name}</TableCell>
                        {Array.from({ length: 12 }, (_, index) => {
                          const monthNumber = index + 1;
                          const isPaid = data.payments[monthNumber];
                          return (
                            <TableCell key={monthNumber} className="text-center p-2">
                              <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {isPaid ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium">
                          {data.totalPaid}/12
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={data.totalPaid >= 10 ? "default" : data.totalPaid >= 6 ? "secondary" : "destructive"}>
                            {data.totalPaid >= 10 ? "Baik" : data.totalPaid >= 6 ? "Cukup" : "Kurang"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
