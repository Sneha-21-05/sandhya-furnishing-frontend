import React from "react";

const ProductCard = ({ item }) => {
  const imageSrc = item?.image_url
    ? `http://localhost:5000${item.image_url}`
    : "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-4">
      <img
        src={imageSrc}
        alt={item.name}
        className="w-full h-48 object-cover rounded"
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/300x200?text=No+Image";
        }}
      />

      <h3 className="mt-3 font-semibold text-lg text-gray-200">
        {item.name}
      </h3>
    </div>
  );
};

export default ProductCard;
