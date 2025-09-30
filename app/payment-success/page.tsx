"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Max from "../components/Max";
import { CheckCircle, Download, ArrowRight, Printer } from "lucide-react";

const BASE_URL = "https://eco-harvest-backend.vercel.app";

interface Receipt {
  _id: string;
  receiptNumber: string;
  transactionId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  amounts: {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };
  couponCode: string | null;
  paymentMethod: string;
  issuedAt: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("receiptId");
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (receiptId) {
      fetchReceipt();
    } else {
      setLoading(false);
    }
  }, [receiptId]);

  const fetchReceipt = async () => {
    try {
      const response = await axios.get<{ success: boolean; data: Receipt }>(
        `${BASE_URL}/receipts/${receiptId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setReceipt(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptId) return;
    
    setDownloadingPDF(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/receipts/pdf/${receiptId}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receipt?.receiptNumber || receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };
  
  const [id, setId] = useState("");
    const [role, setRole] = useState("");
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [cart, setCart] = useState<{ products: any[] }>({ products: [] });
    
  
    useEffect(() => {
      const fetchCookies = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/check-cookie/`,
            {
              withCredentials: true,
            }
          );
  
          console.log(response.data);
          setId(response.data.id);
          setRole(response.data.role);
  
          if (response.data.role === "Customer") {
            setUserLoggedIn(true);
            try {
              const response2 = await axios.get(
                `${BASE_URL}/cart/${response.data.id}`
              );
              setCart({ products: response2.data });
              console.log("Cart items fetched successfully:", response2.data);
            } catch (err) {
              console.error("Error fetching cart items:", err);
            }
          } else if (response.data.role === "Vendor") {
            router.push("/vendor");
          } else if (response.data.role === "Admin") {
            router.push("/admin");
          }
        } catch (error) {
          console.error("Error fetching cookies:", error);
        }
      };
  
      fetchCookies();
    }, []);
  


  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation
                cart={cart}
                id={id}
                userLoggedIn={userLoggedIn}
                productsDetail={cart.products}
                numberOfCartItems={cart.products.length}
              />
        <div className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
            <p className="text-gray-600 mb-6">The receipt you are looking for does not exist.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation
              cart={cart}
              id={id}
              userLoggedIn={userLoggedIn}
              productsDetail={cart.products}
              numberOfCartItems={cart.products.length}
            />
      
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Success Message */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been confirmed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  <Download className="w-5 h-5" />
                  {downloadingPDF ? "Downloading..." : "Download Receipt"}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => router.push("/orders")}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  View Orders
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Receipt Number</p>
                    <p className="font-semibold">{receipt.receiptNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transaction ID</p>
                    <p className="font-semibold">{receipt.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold">
                      {new Date(receipt.issuedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-semibold uppercase">{receipt.paymentMethod.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{receipt.customerDetails.name}</p>
                  <p className="text-gray-600">{receipt.customerDetails.email}</p>
                  <p className="text-gray-600">{receipt.customerDetails.phone}</p>
                  <p className="text-gray-600">{receipt.customerDetails.address}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Items Purchased:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">Product</th>
                        <th className="text-center p-3 font-semibold">Qty</th>
                        <th className="text-right p-3 font-semibold">Price</th>
                        <th className="text-right p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {receipt.items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3">{item.productName}</td>
                          <td className="text-center p-3">{item.quantity}</td>
                          <td className="text-right p-3">Rs. {item.unitPrice.toFixed(2)}</td>
                          <td className="text-right p-3">Rs. {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {receipt.amounts.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {receipt.amounts.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {receipt.couponCode && `(${receipt.couponCode})`}:
                      </span>
                      <span className="font-medium">- Rs. {receipt.amounts.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span className="font-medium">Rs. {receipt.amounts.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">
                      {receipt.amounts.deliveryFee === 0 ? 'FREE' : `Rs. ${receipt.amounts.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>Rs. {receipt.amounts.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
                <p className="font-medium mb-2">Thank you for shopping with EcoHarvest!</p>
                <p>For any queries, please contact us at support@ecoharvest.com</p>
              </div>
            </div>

            {/* Action Buttons at Bottom */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 print:hidden">
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition text-center"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push("/orders")}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition text-center"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}