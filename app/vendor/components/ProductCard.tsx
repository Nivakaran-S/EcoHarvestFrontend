import Image from "next/image";
import { useState } from "react";
import { Product } from "./types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

const BASE_URL = "https://eco-harvest-backend.vercel.app";

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onEdit }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products/${product._id}`, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={product.imageSrc || product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <span className="text-xs text-gray-500 uppercase">{product.category}</span>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.subtitle}</p>

        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-gray-900">Rs. {product.price}</span>
            {product.oldPrice && (
              <span className="text-sm line-through text-gray-400 ml-2">Rs. {product.oldPrice}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Stock: {product.quantity} units</p>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              product.status === "In Stock"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.status}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 text-blue-600 border border-blue-500 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiEdit size={16} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 text-red-600 border border-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={16} /> {loading ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;