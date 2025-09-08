import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { FinancialRecord } from '@/hooks/use-financial-records';

interface Summary {
  total_income: number;
  total_expense: number;
  net_balance: number;
}

interface ExportOptions {
  records: FinancialRecord[];
  summary: Summary;
  filters: {
    month?: string;
    year?: string;
    type?: string;
  };
}

const MONTHS_INDO = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const exportFinancialReportToPDF = ({ records, summary, filters }: ExportOptions) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set up fonts
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text('LAPORAN KEUANGAN', 105, 20, { align: 'center' });
    doc.text('PERUMAHAN GJL', 105, 30, { align: 'center' });
    
    // Filter information
    doc.setFontSize(12);
    let yPosition = 45;
    
    // Generate filter text
    const filterTexts = [];
    if (filters.month && filters.month !== 'all') {
      const monthName = MONTHS_INDO[parseInt(filters.month)];
      filterTexts.push(`Bulan: ${monthName}`);
    }
    if (filters.year && filters.year !== 'all') {
      filterTexts.push(`Tahun: ${filters.year}`);
    }
    if (filters.type && filters.type !== 'all') {
      const typeText = filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      filterTexts.push(`Tipe: ${typeText}`);
    }
    
    if (filterTexts.length > 0) {
      doc.text('Filter: ' + filterTexts.join(' | '), 20, yPosition);
      yPosition += 10;
    }
    
    // Date generated
    doc.text(`Dibuat pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 20, yPosition);
    yPosition += 15;
    
    // Summary section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN KEUANGAN', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Summary table
    const summaryData = [
      ['Total Pemasukan', `Rp ${summary.total_income.toLocaleString('id-ID')}`],
      ['Total Pengeluaran', `Rp ${summary.total_expense.toLocaleString('id-ID')}`],
      ['Saldo Bersih', `Rp ${summary.net_balance.toLocaleString('id-ID')}`],
    ];
    
    autoTable(doc, {
      head: [['Keterangan', 'Jumlah']],
      body: summaryData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Detail transactions
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL TRANSAKSI', 20, yPosition);
    yPosition += 10;
    
    // Prepare table data
    const tableData = records.map((record) => [
      record.house_block || record.user?.house_number || '-',
      record.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      record.category,
      format(new Date(record.created_at), 'dd/MM/yyyy', { locale: id }),
      `${record.type === 'income' ? '+' : '-'}Rp ${record.amount.toLocaleString('id-ID')}`,
      record.description || '-',
      record.created_by_user?.name || 'System'
    ]);
    
    // Create table
    autoTable(doc, {
      head: [['Blok', 'Tipe', 'Kategori', 'Tanggal', 'Nominal', 'Keterangan', 'Oleh']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      styles: { 
        fontSize: 9, 
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [66, 139, 202], 
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 40 },
        6: { cellWidth: 25 }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 10, right: 10 }
    });
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
    
    // Generate filename
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd-HHmm', { locale: id });
    let filename = `laporan-keuangan-${dateStr}`;
    
    if (filters.month && filters.month !== 'all') {
      filename += `-${MONTHS_INDO[parseInt(filters.month)].toLowerCase()}`;
    }
    if (filters.year && filters.year !== 'all') {
      filename += `-${filters.year}`;
    }
    if (filters.type && filters.type !== 'all') {
      filename += `-${filters.type}`;
    }
    
    filename += '.pdf';
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
