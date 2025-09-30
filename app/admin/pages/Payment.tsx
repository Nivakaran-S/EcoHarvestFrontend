import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Download, Search, TrendingUp, CreditCard, RefreshCw, Gift, Trash2, Check, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuration
const API_BASE_URL = 'https://eco-harvest-backend.vercel.app';

// Types
interface Payment {
  _id: string;
  transactionId: string;
  receiptNumber: string;
  paymentMethod: string;
  amount: {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };
  status: string;
  createdAt: string;
  orderId?: any;
  userId?: any;
  couponCode?: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  description: string;
  isActive: boolean;
}

interface Stats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  refundedPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  todayRevenue: number;
  monthRevenue: number;
}

interface CouponForm {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  description: string;
  isActive: boolean;
}

interface ReportForm {
  fromDate: string;
  toDate: string;
  status: string;
  paymentMethod: string;
}

export default function AdminPayment() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'coupons'>('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    refundedPayments: 0,
    failedPayments: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
    monthRevenue: 0
  });

  const [couponForm, setCouponForm] = useState<CouponForm>({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    description: '',
    isActive: true
  });

  const [reportForm, setReportForm] = useState<ReportForm>({
    fromDate: '',
    toDate: '',
    status: 'all',
    paymentMethod: 'all'
  });

  useEffect(() => {
    fetchPayments();
    fetchCoupons();
  }, []);

  const fetchPayments = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const calculateStats = (paymentData: Payment[]): void => {
    const completed = paymentData.filter(p => p.status === 'completed');
    const pending = paymentData.filter(p => p.status === 'pending' || p.status === 'processing');
    const refunded = paymentData.filter(p => p.status === 'refunded');
    const failed = paymentData.filter(p => p.status === 'failed');
    
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount.total, 0);
    const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = completed
      .filter(p => new Date(p.createdAt) >= today)
      .reduce((sum, p) => sum + p.amount.total, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = completed
      .filter(p => new Date(p.createdAt) >= firstDayOfMonth)
      .reduce((sum, p) => sum + p.amount.total, 0);

    setStats({
      totalRevenue,
      totalPayments: paymentData.length,
      pendingPayments: pending.length,
      completedPayments: completed.length,
      refundedPayments: refunded.length,
      failedPayments: failed.length,
      averageOrderValue: avgOrderValue,
      todayRevenue,
      monthRevenue
    });
  };

  const handleCreateCoupon = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...couponForm,
          discountValue: parseFloat(couponForm.discountValue),
          minimumOrderAmount: couponForm.minimumOrderAmount ? parseFloat(couponForm.minimumOrderAmount) : 0,
          maximumDiscount: couponForm.maximumDiscount ? parseFloat(couponForm.maximumDiscount) : null,
          usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Coupon created successfully!');
        setShowCouponModal(false);
        fetchCoupons();
        resetCouponForm();
      } else {
        alert(data.message || 'Failed to create coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        alert('Coupon deleted successfully!');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const handleGenerateReport = async (): Promise<void> => {
    try {
      let filtered = [...payments];

      if (reportForm.fromDate) {
        filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(reportForm.fromDate));
      }
      if (reportForm.toDate) {
        const toDate = new Date(reportForm.toDate);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(p => new Date(p.createdAt) <= toDate);
      }
      if (reportForm.status !== 'all') {
        filtered = filtered.filter(p => p.status === reportForm.status);
      }
      if (reportForm.paymentMethod !== 'all') {
        filtered = filtered.filter(p => p.paymentMethod === reportForm.paymentMethod);
      }

      const completedFiltered = filtered.filter(p => p.status === 'completed');
      const totalDiscounts = completedFiltered.reduce((sum, p) => sum + (p.amount?.discount || 0), 0);
      const totalTax = completedFiltered.reduce((sum, p) => sum + (p.amount?.tax || 0), 0);
      const totalDeliveryFees = completedFiltered.reduce((sum, p) => sum + (p.amount?.deliveryFee || 0), 0);

      const reportData = {
        dateRange: `${reportForm.fromDate || 'Start'} to ${reportForm.toDate || 'End'}`,
        totalTransactions: filtered.length,
        totalRevenue: completedFiltered.reduce((sum, p) => sum + (p.amount?.total || 0), 0),
        totalSubtotal: completedFiltered.reduce((sum, p) => sum + (p.amount?.subtotal || 0), 0),
        totalDiscounts,
        totalTax,
        totalDeliveryFees,
        completedTransactions: filtered.filter(p => p.status === 'completed').length,
        pendingTransactions: filtered.filter(p => p.status === 'pending' || p.status === 'processing').length,
        failedTransactions: filtered.filter(p => p.status === 'failed').length,
        refundedTransactions: filtered.filter(p => p.status === 'refunded').length,
        averageTransaction: completedFiltered.length > 0 ? completedFiltered.reduce((sum, p) => sum + (p.amount?.total || 0), 0) / completedFiltered.length : 0,
        byPaymentMethod: {
          card: filtered.filter(p => p.paymentMethod === 'card').length,
          bank_transfer: filtered.filter(p => p.paymentMethod === 'bank_transfer').length,
          qr_code: filtered.filter(p => p.paymentMethod === 'qr_code').length,
          cash_on_delivery: filtered.filter(p => p.paymentMethod === 'cash_on_delivery').length
        },
        payments: filtered
      };

      downloadReportPDF(reportData);
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const downloadReportPDF = (reportData: any): void => {
    const doc = new jsPDF();
    
    // Header with company branding
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ECOHARVEST', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sustainable Shopping for a Greener Tomorrow', 105, 28, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Report', 105, 50, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 58, { align: 'center' });
    doc.text(`Date Range: ${reportData.dateRange}`, 105, 64, { align: 'center' });
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, 78);
    
    const summaryData = [
      ['Total Transactions', reportData.totalTransactions.toString()],
      ['Total Revenue', `Rs. ${reportData.totalRevenue.toFixed(2)}`],
      ['Total Subtotal', `Rs. ${reportData.totalSubtotal.toFixed(2)}`],
      ['Total Discounts', `Rs. ${reportData.totalDiscounts.toFixed(2)}`],
      ['Total Tax (5%)', `Rs. ${reportData.totalTax.toFixed(2)}`],
      ['Total Delivery Fees', `Rs. ${reportData.totalDeliveryFees.toFixed(2)}`],
      ['Average Transaction', `Rs. ${reportData.averageTransaction.toFixed(2)}`],
    ];
    
    (doc as any).autoTable({
      startY: 83,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { 
        fillColor: [34, 197, 94],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 70 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Status Breakdown
    const statusStartY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Status', 20, statusStartY);
    
    const statusData = [
      ['Completed', reportData.completedTransactions.toString(), `${((reportData.completedTransactions / reportData.totalTransactions) * 100 || 0).toFixed(1)}%`],
      ['Pending', reportData.pendingTransactions.toString(), `${((reportData.pendingTransactions / reportData.totalTransactions) * 100 || 0).toFixed(1)}%`],
      ['Failed', reportData.failedTransactions.toString(), `${((reportData.failedTransactions / reportData.totalTransactions) * 100 || 0).toFixed(1)}%`],
      ['Refunded', reportData.refundedTransactions.toString(), `${((reportData.refundedTransactions / reportData.totalTransactions) * 100 || 0).toFixed(1)}%`],
    ];
    
    (doc as any).autoTable({
      startY: statusStartY + 5,
      head: [['Status', 'Count', 'Percentage']],
      body: statusData,
      theme: 'striped',
      headStyles: { 
        fillColor: [34, 197, 94],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 50 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Payment Methods
    const methodStartY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Methods Distribution', 20, methodStartY);
    
    const totalMethodTransactions = Object.values(reportData.byPaymentMethod).reduce((a: any, b: any) => a + b, 0) as number;
    const methodData = [
      ['Card', reportData.byPaymentMethod.card.toString(), `${((reportData.byPaymentMethod.card / totalMethodTransactions) * 100 || 0).toFixed(1)}%`],
      ['Bank Transfer', reportData.byPaymentMethod.bank_transfer.toString(), `${((reportData.byPaymentMethod.bank_transfer / totalMethodTransactions) * 100 || 0).toFixed(1)}%`],
      ['QR Code', reportData.byPaymentMethod.qr_code.toString(), `${((reportData.byPaymentMethod.qr_code / totalMethodTransactions) * 100 || 0).toFixed(1)}%`],
      ['Cash on Delivery', reportData.byPaymentMethod.cash_on_delivery.toString(), `${((reportData.byPaymentMethod.cash_on_delivery / totalMethodTransactions) * 100 || 0).toFixed(1)}%`],
    ];
    
    (doc as any).autoTable({
      startY: methodStartY + 5,
      head: [['Payment Method', 'Count', 'Percentage']],
      body: methodData,
      theme: 'striped',
      headStyles: { 
        fillColor: [34, 197, 94],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 50 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Transaction Details on new page
    if (reportData.payments.length > 0) {
      doc.addPage();
      
      // Page header
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details', 105, 16, { align: 'center' });
      
      const transactionData = reportData.payments.slice(0, 30).map((payment: Payment) => [
        payment.transactionId.substring(0, 12) + '...',
        payment.receiptNumber,
        payment.paymentMethod.replace('_', ' '),
        `Rs. ${payment.amount.total.toFixed(2)}`,
        payment.status.toUpperCase(),
        new Date(payment.createdAt).toLocaleDateString()
      ]);
      
      (doc as any).autoTable({
        startY: 32,
        head: [['Transaction ID', 'Receipt #', 'Method', 'Amount', 'Status', 'Date']],
        body: transactionData,
        theme: 'grid',
        headStyles: { 
          fillColor: [34, 197, 94],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 30 },
          2: { cellWidth: 28 },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 26, halign: 'center' },
          5: { cellWidth: 26 }
        },
        margin: { left: 10, right: 10 },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 4) {
            const status = data.cell.raw.toLowerCase();
            if (status === 'completed') {
              doc.setTextColor(22, 163, 74);
            } else if (status === 'pending' || status === 'processing') {
              doc.setTextColor(234, 179, 8);
            } else if (status === 'failed') {
              doc.setTextColor(239, 68, 68);
            } else if (status === 'refunded') {
              doc.setTextColor(168, 85, 247);
            }
          }
        }
      });
      
      if (reportData.payments.length > 30) {
        const remainingY = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Note: Showing first 30 transactions out of ${reportData.payments.length} total transactions.`, 105, remainingY, { align: 'center' });
      }
    }
    
    // Footer on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'EcoHarvest Payment Report - Confidential',
        20,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`payment-report-${Date.now()}.pdf`);
  };

  const resetCouponForm = (): void => {
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      description: '',
      isActive: true
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'refunded': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage payments, coupons, and generate comprehensive reports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Payments</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
            <p className="text-xs text-gray-500 mt-1">Completed: {stats.completedPayments}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">Rs. {stats.todayRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Month Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">Rs. {stats.monthRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {(['overview', 'payments', 'coupons'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Overview</h2>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => fetchPayments()}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Refresh Data</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('coupons')}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Gift className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Manage Coupons</span>
                      </button>
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Download Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Revenue Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
                      <p className="text-xl font-bold text-gray-900">Rs. {stats.averageOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Active Coupons</p>
                      <p className="text-xl font-bold text-gray-900">{coupons.filter(c => c.isActive).length}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.totalPayments > 0 ? ((stats.completedPayments / stats.totalPayments) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by transaction ID or receipt number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading payments...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              No payments found
                            </td>
                          </tr>
                        ) : (
                          filteredPayments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.transactionId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.receiptNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {payment.paymentMethod?.replace('_', ' ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                Rs. {payment.amount?.total?.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.couponCode ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    {payment.couponCode}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Coupon Management</h2>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                  </button>
                </div>

                {coupons.length === 0 ? (
                  <div className="text-center py-12 border border-gray-200 rounded-lg">
                    <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No coupons created yet</p>
                    <button
                      onClick={() => setShowCouponModal(true)}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Coupon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div key={coupon._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                            <p className="text-sm text-gray-600">{coupon.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}
                              title={coupon.isActive ? 'Active' : 'Inactive'}
                            >
                              {coupon.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-semibold text-gray-900">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}%` 
                                : `Rs. ${coupon.discountValue}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min Order:</span>
                            <span className="font-semibold text-gray-900">Rs. {coupon.minimumOrderAmount}</span>
                          </div>
                          {coupon.maximumDiscount && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Max Discount:</span>
                              <span className="font-semibold text-gray-900">Rs. {coupon.maximumDiscount}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Used:</span>
                            <span className="font-semibold text-gray-900">
                              {coupon.usedCount} / {coupon.usageLimit || '∞'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valid Until:</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Coupon</h2>
            </div>
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                    placeholder="SAVE20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    required
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.minimumOrderAmount}
                    onChange={(e) => setCouponForm({...couponForm, minimumOrderAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.maximumDiscount}
                    onChange={(e) => setCouponForm({...couponForm, maximumDiscount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({...couponForm, validFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({...couponForm, validUntil: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the coupon offer..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active immediately
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Create Coupon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCouponModal(false);
                    resetCouponForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Generate Payment Report</h2>
              <p className="text-sm text-gray-600 mt-1">Select criteria for your custom report</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={reportForm.fromDate}
                  onChange={(e) => setReportForm({...reportForm, fromDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={reportForm.toDate}
                  onChange={(e) => setReportForm({...reportForm, toDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={reportForm.status}
                  onChange={(e) => setReportForm({...reportForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={reportForm.paymentMethod}
                  onChange={(e) => setReportForm({...reportForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="qr_code">QR Code</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleGenerateReport}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Generate PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 