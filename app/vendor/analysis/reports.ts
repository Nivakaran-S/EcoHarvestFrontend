import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface Order {
  _id: string;
  orderNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  MRP: number;
  status: string;
}

export function generateSalesReport(data: Order[]) {
  const doc = new jsPDF("l", "pt", "a4");
  autoTable(doc, {
    head: [["Order #", "Order Date", "Status", "Total Amount"]],
    body: data.map(order => [
      order.orderNumber,
      new Date(order.orderTime).toLocaleString(),
      order.status,
      order.totalAmount,
    ]),
    startY: 30,
    theme: "grid",
  });
  doc.save("Sales_Report.pdf");
}

export function generateProductReport(data: Product[]) {
  const doc = new jsPDF("l", "pt", "a4");
  autoTable(doc, {
    head: [["Name", "Category", "Stock", "Unit Price", "MRP", "Status"]],
    body: data.map(product => [
      product.name,
      product.category,
      product.quantity,
      product.unitPrice,
      product.MRP,
      product.status,
    ]),
    startY: 50,
    theme: "grid",
  });
  doc.save("Product_Report.pdf");
}
