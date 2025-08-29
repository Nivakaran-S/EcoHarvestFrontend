"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

// ==== Types ====
interface ProductFormData {
  name: string;
  subtitle: string;
  quantity: string;
  unitPrice: string;
  category: string;
  productCategory_id: string;
  imageUrl: string;
  status: string;
  MRP: string;
  predictedFoodName: string;
  predictedFoodCategory: string;
}

interface ProductCategory {
  _id: string;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData, resetForm: () => void) => void;
  toastMessage: string;
}

// API Response interface for prediction
interface PredictionResponse {
  label: string; // Food name
  category: string; // Food category
  output_image?: string; // Optional base64 image
}

// ===== Base URLs =====
const BASE_URL = "https://eco-harvest-backend.vercel.app";
const PREDICTION_URL = "https://nivakaran-food-classification.hf.space";

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  toastMessage,
}) => {
  const initialFormData: ProductFormData = {
    name: "",
    subtitle: "",
    quantity: "",
    unitPrice: "",
    category: "Resell",
    productCategory_id: "",
    imageUrl: "",
    status: "In Stock",
    MRP: "",
    predictedFoodName: "",
    predictedFoodCategory: "",
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string>("");
  const [tempImageUrl, setTempImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/productcategories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: ProductCategory[] = await res.json();
        setProductCategories(data);
      } catch (err) {
        console.error("Failed to fetch product categories", err);
      }
    };

    if (isOpen) {
      fetchCategories();
      setPredictionError("");
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempImageUrl(e.target.value);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPredictionError("");
    setTempImageUrl("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData, resetForm);
  };

  // Convert Google Drive share link to direct download link
  const convertGoogleDriveUrl = (url: string): string => {
    const driveShareMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (driveShareMatch) {
      const fileId = driveShareMatch[1];
      return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
    if (url.includes("drive.google.com/uc?id=")) return url;
    return url;
  };

  const handlePredictFromUrl = async () => {
    if (!tempImageUrl.trim()) {
      setPredictionError("Please enter a Google Drive image URL");
      return;
    }

    setPredictionError("");
    setIsPredicting(true);

    try {
      const directUrl = convertGoogleDriveUrl(tempImageUrl.trim());

      // Fetch the image blob
      const imageResponse = await fetch(directUrl);
      if (!imageResponse.ok) throw new Error("Failed to fetch image from URL");
      const imageBlob = await imageResponse.blob();

      const formDataAI = new FormData();
      formDataAI.append("file", imageBlob, "image.jpg");

      const res = await fetch(`${PREDICTION_URL}/predict`, {
        method: "POST",
        body: formDataAI,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data: PredictionResponse = await res.json();

      setFormData(prev => ({
        ...prev,
        predictedFoodName: data.label || "Unknown",
        predictedFoodCategory: data.category || "Uncategorized",
        name: data.label || "",
        imageUrl: tempImageUrl.trim(),
      }));

      // Match predicted category with existing categories
      const matchingCategory = productCategories.find(
        cat =>
          cat.name.toLowerCase().includes(data.category.toLowerCase()) ||
          data.category.toLowerCase().includes(cat.name.toLowerCase())
      );

      if (matchingCategory) {
        setFormData(prev => ({ ...prev, productCategory_id: matchingCategory._id }));
      }

      setTempImageUrl("");
    } catch (err) {
      console.error("Prediction error:", err);
      const errorMessage = err instanceof Error ? err.message : "Prediction failed";
      setPredictionError(errorMessage);
      setFormData(prev => ({
        ...prev,
        predictedFoodName: "",
        predictedFoodCategory: "",
      }));
    } finally {
      setIsPredicting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>

        {toastMessage && (
          <div className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-green-500 text-white px-4 py-2 rounded shadow-md">
            {toastMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Drive URL section */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <label className="block text-lg font-semibold text-blue-800">
              🍎 Step 1: Provide Google Drive Image Link for AI Classification
            </label>
            <p className="text-sm text-blue-600 mb-2">
              Paste a Google Drive image link to automatically identify the food and fill product details
            </p>
            <div className="space-y-2">
              <input
                type="url"
                value={tempImageUrl}
                placeholder="https://drive.google.com/file/d/your-file-id/view?usp=sharing"
                className="w-full p-2 border rounded"
                onChange={handleImageUrlChange}
                disabled={isPredicting}
              />
              <button
                type="button"
                onClick={handlePredictFromUrl}
                disabled={isPredicting || !tempImageUrl.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isPredicting ? "Analyzing Image..." : "Predict Food Category"}
              </button>
            </div>

            {isPredicting && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Analyzing food image with AI...</span>
              </div>
            )}

            {predictionError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                AI Prediction Error: {predictionError}
              </div>
            )}

            {formData.predictedFoodName && !isPredicting && !predictionError && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                ✅ Food identified successfully! Product details auto-filled below.
              </div>
            )}

            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Note:</strong> Make sure your Google Drive image is set to "Anyone with the link can view".
            </div>
          </div>

          {/* Predicted Results Section */}
          {(formData.predictedFoodName || formData.predictedFoodCategory) && (
            <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800">🤖 AI Prediction Results</h3>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-green-700">Identified Food Item</label>
                <input type="text" name="predictedFoodName" value={formData.predictedFoodName} readOnly className="w-full p-2 border rounded bg-white"/>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-green-700">Food Category</label>
                <input type="text" name="predictedFoodCategory" value={formData.predictedFoodCategory} readOnly className="w-full p-2 border rounded bg-white"/>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📝 Step 2: Complete Product Details</h3>
          </div>

          <input type="text" name="name" value={formData.name} placeholder="Product Name" className="w-full p-2 border rounded" onChange={handleChange} required />
          <input type="text" name="subtitle" value={formData.subtitle} placeholder="Subtitle" className="w-full p-2 border rounded" onChange={handleChange} required />
          <input type="number" name="quantity" value={formData.quantity} placeholder="Quantity" className="w-full p-2 border rounded" onChange={handleChange} required min="0"/>
          <input type="number" name="unitPrice" value={formData.unitPrice} placeholder="Unit Price" className="w-full p-2 border rounded" onChange={handleChange} required min="0" step="0.01"/>
          
          <select name="category" value={formData.category} className="w-full p-2 border rounded" onChange={handleChange} required>
            <option value="Resell">Resell</option>
            <option value="Recycling">Recycling</option>
            <option value="Fertilizer">Fertilizer</option>
          </select>

          <select name="productCategory_id" value={formData.productCategory_id} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Select Product Category</option>
            {productCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image URL (Auto-filled)</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} className={`w-full p-2 border rounded ${formData.imageUrl ? "bg-gray-50" : ""}`} onChange={handleChange} readOnly={!!formData.imageUrl}/>
            {formData.imageUrl && <p className="text-xs text-gray-500">ℹ️ Automatically set from your Google Drive link</p>}
          </div>

          <input type="number" name="MRP" value={formData.MRP} placeholder="MRP" className="w-full p-2 border rounded" onChange={handleChange} required min="0" step="0.01"/>

          <div className="flex justify-between pt-4">
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors" onClick={onClose} disabled={isPredicting}>Cancel</button>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={isPredicting}>
              {isPredicting ? "Processing..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
