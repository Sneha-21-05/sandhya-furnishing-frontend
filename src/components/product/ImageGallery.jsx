import React, { useState } from "react";

/* IMAGE HELPER */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/uploads"))
    return `http://localhost:5000${imageUrl}`;
  return `http://localhost:5000/uploads/${imageUrl}`;
};

const ImageGallery = ({ images = [] }) => {
  const formattedImages = images.map(getImageUrl).filter(Boolean);

  const [activeImage, setActiveImage] = useState(
    formattedImages[0] || null
  );

  if (!formattedImages.length) {
    return (
      <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 rounded-xl text-gray-400">
        No Images Available
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">

      {/* MAIN IMAGE */}
      <div className="w-full h-[380px] sm:h-[460px] flex items-center justify-center bg-gray-50 rounded-[1.5rem] overflow-hidden p-4">
        <img
          src={activeImage}
          alt="Product"
          className="max-h-full max-w-full object-contain mix-blend-multiply"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 overflow-x-auto">
        {formattedImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            onClick={() => setActiveImage(img)}
            className={`h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-xl cursor-pointer border-2 bg-gray-50 transition-all hover:opacity-90
              ${activeImage === img ? "border-[#0a2328] shadow-sm" : "border-transparent"}`}
          />
        ))}
      </div>

    </div>
  );
};

export default ImageGallery;
