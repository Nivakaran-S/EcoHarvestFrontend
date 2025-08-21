// ProductCard.tsx
import Image from "next/image";
import { useState } from "react";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onEdit }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8000/products/${product._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product deleted successfully!");
        onDelete(product._id);
      } else {
        alert(data.message || "Error deleting product.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="relative w-full h-32 rounded overflow-hidden">
        <Image
          src={product.imageSrc || product.imageUrl}
          alt={product.name}
          fill
          className="w-full h-32 object-contain rounded"
        />
      </div>

      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <span className="text-sm text-gray-500">{product.category}</span>

      <div className="flex justify-between items-center mt-2">
        <span className="text-lg font-bold">{product.price}</span>
        <span className="text-sm line-through text-gray-400">{product.oldPrice}</span>
      </div>

      <p className="text-gray-600 text-sm">Quantity: {product.quantity} units</p>

      <span
        className={`text-sm px-2 py-1 rounded mt-2 inline-block ${
          product.status === "In Stock"
            ? "bg-green-200 text-green-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        {product.status}
      </span>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => onEdit(product)}
          className="text-blue-600 border border-blue-500 px-3 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 border border-red-500 px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
