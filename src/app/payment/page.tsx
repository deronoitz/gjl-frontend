"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/CustomAuthContext";
import { useSettings } from "@/hooks/use-settings";
import { useFinancialRecords } from "@/hooks/use-financial-records";
import { usePaymentRecords, PaymentRecord } from "@/hooks/use-payment-records";
import { mockPayments } from "@/lib/mock-data";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transfer Bank", icon: Building },
  { value: "e_wallet", label: "E-Wallet (OVO/GoPay/Dana)", icon: Smartphone },
  { value: "cash", label: "Bayar Tunai", icon: Wallet },
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function PaymentPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const isMobile = useIsMobile();
  const {
    paymentRecords,
    loading: paymentRecordsLoading,
    fetchPaymentRecords,
  } = usePaymentRecords();
  const {
    records: financialRecords,
    loading: financialLoading,
    fetchRecords: fetchFinancialRecords,
  } = useFinancialRecords();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [payingPayment, setPayingPayment] = useState<Payment | null>(null);

  // Form states for payment
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "bank_transfer",
    accountNumber: "",
    accountName: "",
    transactionId: "",
    notes: "",
    proofFile: null as File | null,
  });

  // Form states for new payment request
  const [newPaymentForm, setNewPaymentForm] = useState({
    months: [] as string[],
    year: new Date().getFullYear().toString(),
  });

  // Year filter for payment status
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Loading state for payment creation
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  
  // State untuk menyimpan payment records untuk tahun form (sementara)
  const [formYearPaymentRecords, setFormYearPaymentRecords] = useState<{
    year: number;
    records: PaymentRecord[];
  }>({ year: 0, records: [] });
  
  // Function to fetch payment records for a specific year (for form)
  const fetchPaymentRecordsForYear = useCallback(async (year: number) => {
    if (!user?.id) return [];
    
    try {
      const params = new URLSearchParams();
      params.append('userId', user.id);
      params.append('tahun', year.toString());

      const response = await fetch(`/api/payment-status?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payment records');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching payment records for year:', year, error);
      return [];
    }
  }, [user?.id]);

  // Effect to fetch payment records for the selected year in payment form if it's different from current year
  useEffect(() => {
    const formYear = parseInt(newPaymentForm.year);
    if (user?.id && formYear && formYear !== selectedYear && isNewPaymentDialogOpen) {
      // Fetch payment records for the form year so we can check which months are paid
      if (formYearPaymentRecords.year !== formYear) {
        fetchPaymentRecordsForYear(formYear).then((records) => {
          setFormYearPaymentRecords({
            year: formYear,
            records: records || []
          });
        });
      }
    }
  }, [newPaymentForm.year, selectedYear, user?.id, isNewPaymentDialogOpen, fetchPaymentRecordsForYear, formYearPaymentRecords.year]);

  // Fetch payment records when component mounts or year changes
  useEffect(() => {
    if (user?.id) {

      // Set loading state to true to show loading indicator
      // This will be handled by the individual hooks

      // Fetch payment records from payment_records table for the selected year (only for status display)
      fetchPaymentRecords({
        userId: user.id,
        tahun: selectedYear, // Make sure we're fetching for the correct year
      }).catch((error) => {
        console.error("Failed to fetch payment records:", error);
      });

      // Fetch financial records for payment history (all records for this house block - all years)
      if (user.houseNumber) {
        fetchFinancialRecords({
          house_block: user.houseNumber,
          // Remove year filter to get all years for payment history
          limit: 100, // Increase limit to get more records from all years
          show_all_status: "true", // Special parameter to show all statuses for payment page
        }).catch((error) => {
          console.error("Failed to fetch financial records:", error);
        });
      }
    }
  }, [
    user?.id,
    user?.houseNumber,
    selectedYear, // Keep this dependency for status display refresh
    fetchPaymentRecords,
    fetchFinancialRecords,
  ]);

  if (!user) return null;

  const userPayments = payments.filter((p) => p.userId === user.id);

  const processPayment = () => {
    if (!payingPayment) return;

    // Validation
    if (!paymentForm.paymentMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    if (
      paymentForm.paymentMethod === "bank_transfer" &&
      (!paymentForm.accountNumber || !paymentForm.accountName)
    ) {
      toast.error("Nomor rekening dan nama pemilik harus diisi");
      return;
    }

    if (
      paymentForm.paymentMethod === "e_wallet" &&
      !paymentForm.accountNumber
    ) {
      toast.error("Nomor e-wallet harus diisi");
      return;
    }

    // Update payment status
    setPayments(
      payments.map((p) =>
        p.id === payingPayment.id
          ? { ...p, status: "paid" as const, paymentDate: new Date() }
          : p
      )
    );

    toast.success(
      "Pembayaran berhasil diproses! Bukti pembayaran telah diterima."
    );
    setIsPaymentDialogOpen(false);
    setPayingPayment(null);
    resetPaymentForm();
  };

  const createNewPayment = async () => {
    // Validation
    if (!newPaymentForm.months || newPaymentForm.months.length === 0) {
      toast.error("Pilih minimal satu bulan");
      return;
    }

    if (!newPaymentForm.year) {
      toast.error("Pilih tahun");
      return;
    }

    setIsCreatingPayment(true);

    try {
      // Call payment gateway API
      const response = await fetch("/api/payment-gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          months: newPaymentForm.months,
          year: newPaymentForm.year,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const paymentData = await response.json();

      // Redirect to payment URL
      if (paymentData.payment_url) {
        window.open("https://" + paymentData.payment_url, "_blank");
        toast.success(
          `Link pembayaran berhasil dibuat! Total: Rp ${paymentData.amount.toLocaleString(
            "id-ID"
          )}`
        );
      } else {
        toast.success(
          "Pembayaran berhasil dibuat tetapi tidak ada link pembayaran"
        );
      }

      setIsNewPaymentDialogOpen(false);
      resetNewPaymentForm();

      // Refresh payment records and financial records to show the new data
      if (fetchPaymentRecords) {
        fetchPaymentRecords({
          userId: user.id,
          tahun: parseInt(newPaymentForm.year), // Use the year from the payment form
        });
      }
      if (fetchFinancialRecords && user.houseNumber) {
        fetchFinancialRecords({
          house_block: user.houseNumber,
          year: newPaymentForm.year, // Use the year from the payment form
          limit: 50,
          show_all_status: "true",
        });
      }
      
      // If the payment was created for a different year than currently selected,
      // update the selected year to show the new payment
      if (parseInt(newPaymentForm.year) !== selectedYear) {
        setSelectedYear(parseInt(newPaymentForm.year));
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat pembayaran"
      );
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentMethod: "bank_transfer",
      accountNumber: "",
      accountName: "",
      transactionId: "",
      notes: "",
      proofFile: null,
    });
  };

  const resetNewPaymentForm = () => {
    setNewPaymentForm({
      months: [],
      year: new Date().getFullYear().toString(),
    });
    // Clear form year payment records when resetting
    setFormYearPaymentRecords({ year: 0, records: [] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setPaymentForm({ ...paymentForm, proofFile: file });
    }
  };

  // Generate monthly payment status for current year using payment_records table only
  const generateMonthlyPaymentStatus = (year: number = selectedYear) => {
    
    // Choose the correct payment records based on the year
    let recordsToUse = paymentRecords;
    if (year !== selectedYear && formYearPaymentRecords.year === year) {
      recordsToUse = formYearPaymentRecords.records;
    }
    
    return MONTHS.map((month, index) => {
      const monthNumber = index + 1;

      // Check payment records from payment_records table - filter by both month AND year
      const monthPaymentRecords = recordsToUse.filter((record) => {
        const isMatch = record.bulan === monthNumber && record.tahun === year;

        return isMatch;
      });

      // A month is considered paid if there's a record in payment_records table for this specific year
      const isPaid = monthPaymentRecords.length > 0;

      // Calculate amount - use settings monthly fee amount if paid
      const amount = isPaid ? settings?.monthly_fee?.amount || 150000 : 0;

      return {
        month,
        monthNumber,
        isPaid,
        paymentRecords: monthPaymentRecords,
        amount,
      };
    });
  };

  const monthlyStatus = generateMonthlyPaymentStatus();

  // Combine mock payments with backend financial records for payment history
  const getCombinedPaymentHistory = () => {
    const combinedPayments: Payment[] = [...userPayments];

    // Add financial records as Payment objects
    if (financialRecords) {
      const backendPayments: Payment[] = financialRecords.map((record) => {
        // Handle timezone properly - if date doesn't have timezone info, treat as local time
        const dateStr = record.created_at;
        let paymentDate: Date;
        
        if (dateStr.includes('T')) {
          // If it already has time info, use as is
          paymentDate = new Date(dateStr);
        } else {
          // If it's just a date, treat as local date at noon to avoid timezone issues
          paymentDate = new Date(dateStr + 'T12:00:00');
        }

        return {
        id: `financial_${record.id}`,
        houseBlock: record.house_block || user.houseNumber,
        paymentDate,
        amount: Number(record.amount),
        description:
          record.description ||
          `${record.category} - ${format(paymentDate, "MMM yyyy", {
            locale: id,
          })}`,
        status:
          record.status === "done"
            ? ("paid" as const)
            : record.status === "expired"
            ? ("expired" as const)
            : ("pending" as const), // Map status: done -> paid, expired -> expired, others -> pending
        userId: record.user_uuid || user.id,
        type: record.type,
        category: record.category,
        payment_url: record.payment_url, // Include payment URL from financial records
      };
      });

      combinedPayments.push(...backendPayments);
    }

    // Remove duplicates and sort by date
    const uniquePayments = combinedPayments.filter(
      (payment, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.description === payment.description &&
            p.amount === payment.amount &&
            format(p.paymentDate, "yyyy-MM-dd") ===
              format(payment.paymentDate, "yyyy-MM-dd")
        )
    );

    return uniquePayments.sort(
      (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
    );
  };

  const combinedPaymentHistory = getCombinedPaymentHistory();

  return (
    <div className="space-y-4">
      {/* Mobile-Responsive Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pembayaran Iuran
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Kelola pembayaran iuran bulanan untuk {user.houseNumber}
          </p>
        </div>

        {isMobile ? (
          <Drawer
            open={isNewPaymentDialogOpen}
            onOpenChange={(open) => {
              setIsNewPaymentDialogOpen(open);
              if (!open) {
                // Clear form year payment records when drawer closes
                setFormYearPaymentRecords({ year: 0, records: [] });
              }
            }}
          >
            <DrawerTrigger asChild>
              <Button size={"lg"} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bayar Iuran</span>
                <span className="sm:hidden">Bayar</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4">
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-lg">Bayar Iuran Kas</DrawerTitle>
              </DrawerHeader>
              <div className="max-h-[70vh] overflow-y-auto px-1">
                <div className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="months">Bulan</Label>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {newPaymentForm.months.length === 0
                          ? "Pilih bulan"
                          : newPaymentForm.months.length === 1
                          ? MONTHS[parseInt(newPaymentForm.months[0]) - 1]
                          : `${newPaymentForm.months.length} bulan dipilih`}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {generateMonthlyPaymentStatus(parseInt(newPaymentForm.year))
                        .filter((monthStatus) => !monthStatus.isPaid) // Only show unpaid months for the selected year in form
                        .map((monthStatus) => {
                          const monthValue = monthStatus.monthNumber.toString();
                          const isChecked =
                            newPaymentForm.months.includes(monthValue);
                          return (
                            <DropdownMenuCheckboxItem
                              key={monthStatus.monthNumber}
                              checked={isChecked}
                              onSelect={(e) => e.preventDefault()}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewPaymentForm({
                                    ...newPaymentForm,
                                    months: [
                                      ...newPaymentForm.months,
                                      monthValue,
                                    ].sort((a, b) => parseInt(a) - parseInt(b)),
                                  });
                                } else {
                                  setNewPaymentForm({
                                    ...newPaymentForm,
                                    months: newPaymentForm.months.filter(
                                      (m) => m !== monthValue
                                    ),
                                  });
                                }
                              }}
                            >
                              {monthStatus.month}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <Label htmlFor="year">Tahun</Label>
                  <Select
                    value={newPaymentForm.year}
                    onValueChange={(value) => {
                      // Clear selected months when year changes
                      setNewPaymentForm({ 
                        months: [], 
                        year: value 
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
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
                        {newPaymentForm.months.length} bulan × Rp{" "}
                        {(
                          settings?.monthly_fee?.amount || 150000
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-lg md:text-xl font-bold">
                        Rp{" "}
                        {(
                          (settings?.monthly_fee?.amount || 150000) *
                          newPaymentForm.months.length
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Bulan yang dipilih:{" "}
                      {newPaymentForm.months
                        .map((m) => MONTHS[parseInt(m) - 1])
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}

                </div>
              </div>
              <DrawerFooter className="pt-2 border-t bg-background">
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={createNewPayment}
                    className="w-full"
                    disabled={isCreatingPayment}
                  >
                    {isCreatingPayment && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isCreatingPayment ? "Memproses..." : "Bayar"}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" disabled={isCreatingPayment}>
                      Batal
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={isNewPaymentDialogOpen}
            onOpenChange={(open) => {
              setIsNewPaymentDialogOpen(open);
              if (!open) {
                // Clear form year payment records when dialog closes
                setFormYearPaymentRecords({ year: 0, records: [] });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size={"lg"} className="w-full md:w-auto">
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
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {newPaymentForm.months.length === 0
                            ? "Pilih bulan"
                            : newPaymentForm.months.length === 1
                            ? MONTHS[parseInt(newPaymentForm.months[0]) - 1]
                            : `${newPaymentForm.months.length} bulan dipilih`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        {generateMonthlyPaymentStatus(parseInt(newPaymentForm.year))
                          .filter((monthStatus) => !monthStatus.isPaid) // Only show unpaid months for the selected year in form
                          .map((monthStatus) => {
                            const monthValue = monthStatus.monthNumber.toString();
                            const isChecked =
                              newPaymentForm.months.includes(monthValue);
                            return (
                              <DropdownMenuCheckboxItem
                                key={monthStatus.monthNumber}
                                checked={isChecked}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewPaymentForm({
                                      ...newPaymentForm,
                                      months: [
                                        ...newPaymentForm.months,
                                        monthValue,
                                      ].sort((a, b) => parseInt(a) - parseInt(b)),
                                    });
                                  } else {
                                    setNewPaymentForm({
                                      ...newPaymentForm,
                                      months: newPaymentForm.months.filter(
                                        (m) => m !== monthValue
                                      ),
                                    });
                                  }
                                }}
                              >
                                {monthStatus.month}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <Label htmlFor="year">Tahun</Label>
                    <Select
                      value={newPaymentForm.year}
                      onValueChange={(value) => {
                        // Clear selected months when year changes
                        setNewPaymentForm({ 
                          months: [], 
                          year: value 
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                        <SelectItem value="2028">2028</SelectItem>
                        <SelectItem value="2029">2029</SelectItem>
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
                          {newPaymentForm.months.length} bulan × Rp{" "}
                          {(
                            settings?.monthly_fee?.amount || 150000
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-lg md:text-xl font-bold">
                          Rp{" "}
                          {(
                            (settings?.monthly_fee?.amount || 150000) *
                            newPaymentForm.months.length
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Bulan yang dipilih:{" "}
                        {newPaymentForm.months
                          .map((m) => MONTHS[parseInt(m) - 1])
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewPaymentDialogOpen(false)}
                    className="w-full md:w-auto"
                    disabled={isCreatingPayment}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={createNewPayment}
                    className="w-full md:w-auto"
                    disabled={isCreatingPayment}
                  >
                    {isCreatingPayment && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isCreatingPayment ? "Memproses..." : "Bayar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Monthly Payment Status */}
      <Card key={`payment-status-${selectedYear}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Status Pembayaran Iuran
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="yearFilter" className="text-sm font-medium">
                Tahun:
              </Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
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
          {paymentRecordsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Memuat data pembayaran...
              </span>
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {monthlyStatus.map((status) => (
                  <div
                    key={`${status.monthNumber}-${selectedYear}`}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      status.isPaid
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
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
                    <div
                      className={`text-xs ${
                        status.isPaid ? "text-green-700" : "text-gray-500"
                      }`}
                    >
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
                    {monthlyStatus.filter((s) => s.isPaid).length} dari{" "}
                    {MONTHS.length} bulan telah dibayar
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total dibayar: Rp{" "}
                  {monthlyStatus
                    .reduce((sum, s) => sum + s.amount, 0)
                    .toLocaleString("id-ID")}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card key={`payment-history-all-years`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg">Riwayat Pembayaran</CardTitle>
            <p className="text-sm text-muted-foreground">
              Menampilkan semua riwayat pembayaran dari semua tahun
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {financialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Memuat riwayat pembayaran...
              </span>
            </div>
          ) : combinedPaymentHistory.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Belum ada riwayat pembayaran
            </p>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {combinedPaymentHistory.map((payment) => (
                  <div key={payment.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.paymentDate, "dd MMM yyyy HH:mm", {
                            locale: id,
                          })}
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {format(payment.paymentDate, "yyyy")}
                          </span>
                        </p>
                        {payment.id.startsWith("financial_") && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Tercatat di sistem
                          </p>
                        )}
                        {payment.status === "pending" &&
                          payment.payment_url && (
                            <a
                              href={"https://" + payment.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                            >
                              Bayar Sekarang →
                            </a>
                          )}
                      </div>
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "default"
                            : payment.status === "expired"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {payment.status === "paid"
                          ? "Lunas"
                          : payment.status === "expired"
                          ? "Kedaluwarsa"
                          : "Belum Dibayar"}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table Layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedPaymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(payment.paymentDate, "dd MMM yyyy HH:mm", {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {format(payment.paymentDate, "yyyy")}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>
                          Rp {payment.amount.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : payment.status === "expired"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {payment.status === "paid"
                              ? "Lunas"
                              : payment.status === "expired"
                              ? "Kedaluwarsa"
                              : "Belum Dibayar"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.status === "pending" &&
                          payment.payment_url ? (
                            <a
                              href={"https://" + payment.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                              Bayar Sekarang
                            </a>
                          ) : payment.status === "pending" ? (
                            <span className="text-sm text-muted-foreground">
                              Belum tersedia
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      Total{" "}
                      {
                        combinedPaymentHistory.filter((p) => p.status === "paid")
                          .length
                      }{" "}
                      pembayaran lunas
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-green-600">
                      Total nilai lunas: Rp{" "}
                      {combinedPaymentHistory
                        .reduce(
                          (sum, p) => sum + (p.status === "paid" ? p.amount : 0),
                          0
                        )
                        .toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Periode: {combinedPaymentHistory.length > 0 ? 
                        `${format(
                          new Date(Math.min(...combinedPaymentHistory.map(p => p.paymentDate.getTime()))), 
                          "yyyy"
                        )} - ${format(
                          new Date(Math.max(...combinedPaymentHistory.map(p => p.paymentDate.getTime()))), 
                          "yyyy"
                        )}` 
                        : "Tidak ada data"
                      }
                    </p>
                  </div>
                </div>
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
                <h4 className="font-semibold mb-2">
                  {payingPayment.description}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rumah:</p>
                    <p className="font-medium">{payingPayment.houseBlock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jatuh Tempo:</p>
                    <p className="font-medium">
                      {format(payingPayment.paymentDate, "dd MMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    Rp {payingPayment.amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-semibold">
                  Pilih Metode Pembayaran
                </Label>
                <div className="grid gap-3 mt-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentForm.paymentMethod === method.value
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentForm.paymentMethod === method.value}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              paymentMethod: e.target.value,
                            })
                          }
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
              {paymentForm.paymentMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm font-medium">
                      Informasi Rekening Tujuan:
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bank BCA: 1234567890 a.n. Pengurus Perumahan
                      <br />
                      Bank Mandiri: 0987654321 a.n. Pengurus Perumahan
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="accountNumber"
                        className="text-sm font-medium"
                      >
                        Nomor Rekening Pengirim
                      </Label>
                      <Input
                        id="accountNumber"
                        value={paymentForm.accountNumber}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            accountNumber: e.target.value,
                          })
                        }
                        placeholder="1234567890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="accountName"
                        className="text-sm font-medium"
                      >
                        Nama Pemilik Rekening
                      </Label>
                      <Input
                        id="accountName"
                        value={paymentForm.accountName}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            accountName: e.target.value,
                          })
                        }
                        placeholder="Nama sesuai KTP"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="transactionId"
                      className="text-sm font-medium"
                    >
                      ID Transaksi / Nomor Referensi
                    </Label>
                    <Input
                      id="transactionId"
                      value={paymentForm.transactionId}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          transactionId: e.target.value,
                        })
                      }
                      placeholder="TXN123456789 (opsional)"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {paymentForm.paymentMethod === "e_wallet" && (
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 border rounded-lg">
                    <p className="text-sm font-medium">
                      Scan QR Code atau Transfer ke:
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      OVO/GoPay/Dana: 081234567890
                      <br />
                      a.n. Pengurus Perumahan
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="ewalletNumber"
                      className="text-sm font-medium"
                    >
                      Nomor E-Wallet Pengirim
                    </Label>
                    <Input
                      id="ewalletNumber"
                      value={paymentForm.accountNumber}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="081234567890"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="transactionId"
                      className="text-sm font-medium"
                    >
                      ID Transaksi
                    </Label>
                    <Input
                      id="transactionId"
                      value={paymentForm.transactionId}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          transactionId: e.target.value,
                        })
                      }
                      placeholder="TXN123456789 (opsional)"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {paymentForm.paymentMethod === "cash" && (
                <div className="p-3 bg-muted/50 border rounded-lg">
                  <p className="text-sm font-medium">Pembayaran Tunai:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Silakan datang ke kantor pengelola perumahan pada:
                    <br />
                    <strong>Senin-Jumat: 08:00-16:00 WIB</strong>
                    <br />
                    <strong>Sabtu: 08:00-12:00 WIB</strong>
                  </p>
                </div>
              )}

              {/* Upload Proof */}
              {paymentForm.paymentMethod !== "cash" && (
                <div>
                  <Label htmlFor="proof" className="text-sm font-medium">
                    Upload Bukti Pembayaran
                  </Label>
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
                <Label htmlFor="notes" className="text-sm font-medium">
                  Catatan Tambahan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="w-full md:w-auto"
                >
                  Batal
                </Button>
                <Button onClick={processPayment} className="w-full md:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {paymentForm.paymentMethod === "cash"
                      ? "Konfirmasi Pembayaran"
                      : "Kirim Bukti Pembayaran"}
                  </span>
                  <span className="sm:hidden">
                    {paymentForm.paymentMethod === "cash"
                      ? "Konfirmasi"
                      : "Kirim"}
                  </span>
                </Button>
              </div>

              <div className="p-3 bg-muted/50 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Setelah mengirim bukti pembayaran, status akan berubah menjadi
                  &quot;Sedang Diverifikasi&quot; dan akan dikonfirmasi oleh
                  admin dalam 1x24 jam.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
