"use client";

import { Product3D } from "@/components/atoms/Product3D";
import type { Product } from "@/lib/constants/products";
import { ShoppingCartIcon } from "./icons/shoppingCart";

interface SelectedProduct extends Product {
  id: string;
  price: number;
}

interface ShelfProduct extends Product {
  currentPrice: number;
}

interface ShoppingCartProps {
  selectedProducts: SelectedProduct[];
  onProductRemove: (productId: string) => void;
  onProductDrop: (product: ShelfProduct) => void;
}

export const ShoppingCart = ({
  selectedProducts,
  onProductRemove,
  onProductDrop,
}: ShoppingCartProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const productData = e.dataTransfer.getData("application/json");
      const product = JSON.parse(productData) as ShelfProduct;
      onProductDrop(product);
    } catch (error) {
      console.error("Failed to parse dropped product data:", error);
    }
  };

  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">購物車</h2>
        {selectedProducts.length > 0 && (
          <div className="text-lg font-semibold text-green-600">
            總計：${totalAmount}
          </div>
        )}
      </div>

      <div
        className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors ${
          selectedProducts.length === 0
            ? "border-gray-300 bg-gray-50"
            : "border-blue-300 bg-blue-50"
        } hover:border-blue-400 hover:bg-blue-100`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="region"
        aria-label="購物車放置區域"
      >
        {selectedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-gray-500">
            <ShoppingCartIcon className="w-18 h-18 mb-4" />
            <p className="text-center text-sm leading-relaxed max-w-xs">
              拖拉商品到這裡或點擊商品添加到購物車
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-3 shadow-md border border-gray-200 relative group"
              >
                <button
                  onClick={() => onProductRemove(product.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`移除 ${product.name}`}
                >
                  ×
                </button>

                <Product3D
                  modelPath={product.modelPath}
                  productName={product.name}
                  className="mb-2"
                  autoRotate={false}
                  cameraControls={false}
                  size="medium"
                />

                <div className="text-center">
                  <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm font-bold text-green-600">
                    ${product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
