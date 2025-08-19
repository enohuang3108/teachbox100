"use client";

import { Product3D } from "@/components/atoms/Product3D";
import type { Product } from "@/lib/constants/products";
import AmountDisplay from "./AmountDisplay";

interface ShelfProduct extends Product {
  currentPrice: number;
}

interface ProductShelfProps {
  products: ShelfProduct[];
  onProductSelect: (product: ShelfProduct) => void;
}

interface DraggableProductProps {
  product: ShelfProduct;
  onProductSelect: (product: ShelfProduct) => void;
}

const DraggableProduct = ({
  product,
  onProductSelect,
}: DraggableProductProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(product));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleClick = () => {
    onProductSelect(product);
  };

  return (
    <div className="relative group">
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        className="relative bottom-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95 p-4 pb-0"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        aria-label={`選擇商品：${product.name}，價格 ${product.currentPrice} 元`}
      >
        <div className="mx-auto flex items-center justify-center">
          <Product3D
            modelPath={product.modelPath}
            productName={product.name}
            className=""
            autoRotate={true}
            cameraControls={false}
            size="medium"
          />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            +
          </div>
        </div>
      </div>
      <div>
        <div className="relative inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-800 via-gray-700 to-gray-600 rounded-b-lg shadow-lg"></div>
        <div className="relative inset-x-0 bottom-4 h-2 bg-gray-900 rounded-sm opacity-50"></div>
      </div>
      <AmountDisplay
        amount={product.currentPrice}
        amountColor="text-green-400"
        size="sm"
      />
    </div>
  );
};

export const ProductShelf = ({
  products,
  onProductSelect,
}: ProductShelfProps) => {
  return (
    <div className="w-full mb-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 rounded-2xl"></div>

        <div className="relative p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <DraggableProduct
                key={product.name}
                product={product}
                onProductSelect={onProductSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
