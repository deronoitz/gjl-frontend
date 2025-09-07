'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { useSettings } from '@/hooks/use-settings';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { mockPayments } from '@/lib/mock-data';
import { Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Plus, 
  Building, 
  Smartphone, 
  Wallet,
  Upload,
  FileText,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Transfer Bank', icon: Building },
  { value: 'e_wallet', label: 'E-Wallet (OVO/GoPay/Dana)', icon: Smartphone },
  { value: 'cash', label: 'Bayar Tunai', icon: Wallet },
];

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function PaymentPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { paymentData, loading: paymentLoading, fetchPaymentStatus } = usePaymentStatus();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [payingPayment, setPayingPayment] = useState<Payment | null>(null);
  const [message, setMessage] = useState('');
  
  // Form states for payment
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'bank_transfer',
    accountNumber: '',
    accountName: '',
    transactionId: '',
    notes: '',
    proofFile: null as File | null
  });

  // Form states for new payment request
  const [newPaymentForm, setNewPaymentForm] = useState({
    months: [] as string[],
    year: new Date().getFullYear().toString()
  });

  // Year filter for payment status
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch payment records when component mounts or year changes
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching payment status for user:', user.id, 'year:', selectedYear);
      fetchPaymentStatus({
        userId: user.id,
        tahun: selectedYear
      }).catch(error => {
        console.error('Failed to fetch payment status:', error);
        // Don't continue fetching if there's an auth error
      });
    } else {
      console.log('No user found, skipping payment status fetch');
    }
  }, [user?.id, selectedYear, fetchPaymentStatus]);

  if (!user) return null;

  const userPayments = payments.filter(p => p.userId === user.id);
  const pendingPayments = userPayments.filter(p => p.status === 'pending');

  const handlePayment = (payment: Payment) => {
    setPayingPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const processPayment = () => {
    if (!payingPayment) return;

    // Validation
    if (!paymentForm.paymentMethod) {
      setMessage('Pilih metode pembayaran');
      return;
    }

    if (paymentForm.paymentMethod === 'bank_transfer' && (!paymentForm.accountNumber || !paymentForm.accountName)) {
      setMessage('Nomor rekening dan nama pemilik harus diisi');
      return;
    }

    if (paymentForm.paymentMethod === 'e_wallet' && !paymentForm.accountNumber) {
      setMessage('Nomor e-wallet harus diisi');
      return;
    }

    // Update payment status
    setPayments(payments.map(p => 
      p.id === payingPayment.id 
        ? { ...p, status: 'paid' as const, paymentDate: new Date() }
        : p
    ));

    setMessage('Pembayaran berhasil diproses! Bukti pembayaran telah diterima.');
    setIsPaymentDialogOpen(false);
    setPayingPayment(null);
    resetPaymentForm();
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

  const createNewPayment = () => {
    // Validation
    if (!newPaymentForm.months || newPaymentForm.months.length === 0) {
      setMessage('Pilih minimal satu bulan');
      return;
    }

    // Create payments for each selected month
    const monthlyFeeAmount = settings?.monthly_fee?.amount || 150000; // Get from database or fallback
    const newPayments: Payment[] = newPaymentForm.months.map(monthIndex => {
      const amount = monthlyFeeAmount;
      const monthName = MONTHS[parseInt(monthIndex) - 1];
      const description = `Iuran Bulanan ${monthName} ${newPaymentForm.year}`;

      return {
        id: (Date.now() + Math.random()).toString(),
        houseBlock: user.houseNumber,
        paymentDate: new Date(),
        amount: amount,
        description: description,
        status: 'pending',
        userId: user.id,
        type: 'income',
        category: 'maintenance'
      };
    });

    setPayments([...newPayments, ...payments]);
    setMessage(`${newPayments.length} tagihan pembayaran berhasil dibuat!`);
    setIsNewPaymentDialogOpen(false);
    resetNewPaymentForm();

    setTimeout(() => setMessage(''), 5000);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentMethod: 'bank_transfer',
      accountNumber: '',
      accountName: '',
      transactionId: '',
      notes: '',
      proofFile: null
    });
  };

  const resetNewPaymentForm = () => {
    setNewPaymentForm({
      months: [],
      year: new Date().getFullYear().toString()
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('Ukuran file maksimal 5MB');
        return;
      }
      setPaymentForm({ ...paymentForm, proofFile: file });
    }
  };

  // Generate monthly payment status for current year using both mock data and real backend data
  const generateMonthlyPaymentStatus = () => {
    const paidPayments = userPayments.filter(p => p.status === 'paid');
    
    return MONTHS.map((month, index) => {
      const monthNumber = index + 1;
      
      // Check mock payments (local data)
      const mockMonthPayments = paidPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const paymentMonth = paymentDate.getMonth() + 1;
        const paymentYear = paymentDate.getFullYear();
        
        // Check if payment description contains the month name or payment date matches
        const descriptionContainsMonth = payment.description.toLowerCase().includes(month.toLowerCase());
        const dateMatches = paymentMonth === monthNumber && paymentYear === selectedYear;
        
        return descriptionContainsMonth || dateMatches;
      });
      
      // Check backend payment records
      const backendMonthPayments = paymentData.filter(record => {
        return record.bulan === monthNumber && record.tahun === selectedYear;
      });
      
      // A month is considered paid if there's either mock data or backend data
      const isPaid = mockMonthPayments.length > 0 || backendMonthPayments.length > 0;
      
      // Calculate total amount from both sources
      const mockAmount = mockMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const backendAmount = backendMonthPayments.length > 0 ? (settings?.monthly_fee?.amount || 150000) : 0;
      
      return {
        month,
        monthNumber,
        isPaid,
        payments: mockMonthPayments,
        backendRecords: backendMonthPayments,
        amount: mockAmount + backendAmount
      };
    });
  };

  const monthlyStatus = generateMonthlyPaymentStatus();

  return (
    <div className="space-y-4">
      {/* Mobile-Responsive Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pembayaran Iuran</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Kelola pembayaran iuran bulanan untuk {user.houseNumber}
          </p>
        </div>
        
        <Dialog open={isNewPaymentDialogOpen} onOpenChange={setIsNewPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button size={'lg'} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bayar Iuran</span>
              <span className="sm:hidden">Bayar</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bayar Iuran Kas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="months">Bulan</Label>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {newPaymentForm.months.length === 0
                          ? "Pilih bulan"
                          : newPaymentForm.months.length === 1
                          ? MONTHS[parseInt(newPaymentForm.months[0]) - 1]
                          : `${newPaymentForm.months.length} bulan dipilih`
                        }
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                      {MONTHS.map((month, index) => {
                        const monthValue = (index + 1).toString();
                        const isChecked = newPaymentForm.months.includes(monthValue);
                        return (
                          <DropdownMenuCheckboxItem
                            key={index}
                            checked={isChecked}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewPaymentForm({
                                  ...newPaymentForm,
                                  months: [...newPaymentForm.months, monthValue].sort((a, b) => parseInt(a) - parseInt(b))
                                });
                              } else {
                                setNewPaymentForm({
                                  ...newPaymentForm,
                                  months: newPaymentForm.months.filter(m => m !== monthValue)
                                });
                              }
                            }}
                          >
                            {month}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <Label htmlFor="year">Tahun</Label>
                  <Select value={newPaymentForm.year} onValueChange={(value) => 
                    setNewPaymentForm({ ...newPaymentForm, year: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Total Amount Display */}
              {newPaymentForm.months.length > 0 && (
                <div className="p-3 md:p-4 bg-muted/50 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <div>
                      <p className="text-sm font-medium">
                        Total yang harus dibayar:
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {newPaymentForm.months.length} bulan × Rp {(settings?.monthly_fee?.amount || 150000).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-lg md:text-xl font-bold">
                        Rp {((settings?.monthly_fee?.amount || 150000) * newPaymentForm.months.length).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Bulan yang dipilih: {newPaymentForm.months.map(m => MONTHS[parseInt(m) - 1]).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-2">
                <Button variant="outline" onClick={() => setIsNewPaymentDialogOpen(false)} className="w-full md:w-auto">
                  Batal
                </Button>
                <Button onClick={createNewPayment} className="w-full md:w-auto">
                  Bayar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Monthly Payment Status */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Status Pembayaran Iuran
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="yearFilter" className="text-sm font-medium">Tahun:</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-20 md:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paymentLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">Memuat data pembayaran...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {monthlyStatus.map((status) => (
                  <div
                    key={status.monthNumber}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      status.isPaid
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{status.month}</h4>
                      {status.isPaid ? (
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-xs ${status.isPaid ? 'text-green-700' : 'text-gray-500'}`}>
                      {status.isPaid ? (
                        <>
                          <p className="font-medium">✓ Sudah Dibayar</p>
                        </>
                      ) : (
                        <p>Belum Dibayar</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {monthlyStatus.filter(s => s.isPaid).length} dari {MONTHS.length} bulan telah dibayar
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total dibayar: Rp {monthlyStatus.reduce((sum, s) => sum + s.amount, 0).toLocaleString('id-ID')}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Tagihan Belum Dibayar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-3 md:p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{payment.description}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Jatuh tempo: {format(payment.paymentDate, 'dd MMM yyyy', { locale: id })}
                    </p>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      Rp {payment.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Button onClick={() => handlePayment(payment)} className="w-full md:w-auto">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Bayar Sekarang</span>
                    <span className="sm:hidden">Bayar</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {userPayments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Belum ada riwayat pembayaran
            </p>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {userPayments
                  .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
                  .map((payment) => (
                    <div key={payment.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(payment.paymentDate, 'dd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                        <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                          {payment.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold">Rp {payment.amount.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPayments
                      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(payment.paymentDate, 'dd MMM yyyy', { locale: id })}
                          </TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                              {payment.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
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

      {/* Enhanced Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Proses Pembayaran
            </DialogTitle>
          </DialogHeader>
          {payingPayment && (
            <div className="space-y-4">
              {/* Payment Summary */}
              <div className="p-3 md:p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">{payingPayment.description}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rumah:</p>
                    <p className="font-medium">{payingPayment.houseBlock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jatuh Tempo:</p>
                    <p className="font-medium">
                      {format(payingPayment.paymentDate, 'dd MMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    Rp {payingPayment.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-semibold">Pilih Metode Pembayaran</Label>
                <div className="grid gap-3 mt-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentForm.paymentMethod === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentForm.paymentMethod === method.value}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{method.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Details Form */}
              {paymentForm.paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm font-medium">Informasi Rekening Tujuan:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bank BCA: 1234567890 a.n. Pengurus Perumahan<br />
                      Bank Mandiri: 0987654321 a.n. Pengurus Perumahan
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber" className="text-sm font-medium">Nomor Rekening Pengirim</Label>
                      <Input
                        id="accountNumber"
                        value={paymentForm.accountNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                        placeholder="1234567890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountName" className="text-sm font-medium">Nama Pemilik Rekening</Label>
                      <Input
                        id="accountName"
                        value={paymentForm.accountName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                        placeholder="Nama sesuai KTP"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="transactionId" className="text-sm font-medium">ID Transaksi / Nomor Referensi</Label>
                    <Input
                      id="transactionId"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      placeholder="TXN123456789 (opsional)"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {paymentForm.paymentMethod === 'e_wallet' && (
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm font-medium">Scan QR Code atau Transfer ke:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      OVO/GoPay/Dana: 081234567890<br />
                      a.n. Pengurus Perumahan
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="ewalletNumber" className="text-sm font-medium">Nomor E-Wallet Pengirim</Label>
                    <Input
                      id="ewalletNumber"
                      value={paymentForm.accountNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                      placeholder="081234567890"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionId" className="text-sm font-medium">ID Transaksi</Label>
                    <Input
                      id="transactionId"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      placeholder="TXN123456789 (opsional)"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {paymentForm.paymentMethod === 'cash' && (
                <div className="p-3 bg-muted/50 border rounded-lg">
                  <p className="text-sm font-medium">Pembayaran Tunai:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Silakan datang ke kantor pengelola perumahan pada:<br />
                    <strong>Senin-Jumat: 08:00-16:00 WIB</strong><br />
                    <strong>Sabtu: 08:00-12:00 WIB</strong>
                  </p>
                </div>
              )}

              {/* Upload Proof */}
              {paymentForm.paymentMethod !== 'cash' && (
                <div>
                  <Label htmlFor="proof" className="text-sm font-medium">Upload Bukti Pembayaran</Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                  {paymentForm.proofFile && (
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {paymentForm.proofFile.name}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: JPG, PNG, PDF (Max. 5MB)
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="w-full md:w-auto">
                  Batal
                </Button>
                <Button onClick={processPayment} className="w-full md:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {paymentForm.paymentMethod === 'cash' ? 'Konfirmasi Pembayaran' : 'Kirim Bukti Pembayaran'}
                  </span>
                  <span className="sm:hidden">
                    {paymentForm.paymentMethod === 'cash' ? 'Konfirmasi' : 'Kirim'}
                  </span>
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  Setelah mengirim bukti pembayaran, status akan berubah menjadi &quot;Sedang Diverifikasi&quot; 
                  dan akan dikonfirmasi oleh admin dalam 1x24 jam.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
