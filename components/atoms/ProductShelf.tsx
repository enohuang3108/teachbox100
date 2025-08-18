"use client";

import { Product3D } from "@/components/atoms/Product3D";
import type { Product } from "@/lib/constants/products";

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
      {/* 商品架子效果 */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-800 via-gray-700 to-gray-600 rounded-b-lg shadow-lg"></div>
      <div className="absolute inset-x-0 bottom-3 h-2 bg-gray-900 rounded-sm opacity-50"></div>

      {/* 商品容器 */}
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        className="relative cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95 bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg border border-gray-200 group-hover:shadow-xl group-hover:border-blue-300 p-4 pb-6 mb-2"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        aria-label={`選擇商品：${product.name}，價格 ${product.currentPrice} 元`}
      >
        {/* 閃光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>

        {/* 3D 模型容器 - 限制大小 */}
        <div className="mx-auto mb-3 flex items-center justify-center">
          <Product3D
            modelPath={product.modelPath}
            productName={product.name}
            className=""
            autoRotate={true}
            cameraControls={false}
            size="medium"
          />
        </div>

        {/* 商品信息 */}
        <div className="text-center relative z-10">
          <h3 className="text-sm font-bold mb-1 text-gray-800 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="bg-green-100 rounded-full px-2 py-1 inline-block">
            <p className="text-xs font-semibold text-green-700">
              ${product.currentPrice}
            </p>
          </div>
        </div>

        {/* 選擇提示 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            +
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductShelf = ({
  products,
  onProductSelect,
}: ProductShelfProps) => {
  return (
    <div className="w-full mb-8">
      {/* 標題和裝飾 */}
      {/* <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 relative inline-block">
          <span className="relative z-10">🏪 商品架</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg opacity-20 transform -skew-x-12"></div>
        </h2>
      </div> */}

      {/* 商品架主體 */}
      <div className="relative">
        {/* 背景架子效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 rounded-2xl shadow-inner"></div>
        <div className="absolute inset-0 bg-wood-pattern opacity-30 rounded-2xl"></div>

        {/* 商品網格 */}
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

        {/* 架子底部裝飾 */}
        <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl"></div>
      </div>
    </div>
  );
};
