import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtils";

const SofaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));
  const [showInquiry, setShowInquiry] = useState(false);

  // Fetch single product
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);

        if (res.data.product?.colors?.length > 0) {
          setSelectedColor(res.data.product.colors[0]);
        }
      })
      .catch((err) => console.error("Failed to load product:", err));
  }, [id]);

  // ⭐ Add to Cart Handler
  const handleAddToCart = async () => {
    if (!user || !user._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const response = await addToCart(user._id, product._id, quantity);

      if (response.success) {
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* LEFT: Images */}
      <div>
        <img
          src={
            selectedColor?.images?.[0]
              ? getImageUrl(selectedColor.images[0])
              : getImageUrl(product.images?.[0])
          }
          alt={product.name}
          className="w-full rounded-lg"
        />

        <div className="flex gap-2 mt-4">
          {(selectedColor?.images || product.images || []).map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img)}
              alt=""
              className="w-16 h-16 object-cover rounded border cursor-pointer"
              onClick={() =>
                setSelectedColor({
                  ...selectedColor,
                  images: [img],
                })
              }
            />
          ))}
        </div>
      </div>

      {/* MIDDLE: Product Info */}
      <div>
        <h2 className="text-2xl font-semibold">
          {product.name}
        </h2>

        <p className="text-gray-600 mt-2">{product.description}</p>

        <p className="text-2xl font-bold mt-4">₹ {product.price}</p>

        {/* Color Selector */}
        {product.colors?.length > 0 && (
          <div className="mt-4">
            <p className="font-medium mb-2">Available Colors</p>
            <div className="flex gap-3">
              {product.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor?.name === color.name
                    ? "border-black"
                    : "border-gray-300"
                    }`}
                  style={{ backgroundColor: color.hex || "#ccc" }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Purchase Box */}
      <div className="border p-4 rounded-lg">
        <p className="font-medium">Quantity</p>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="px-3 py-1 border"
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 border"
          >
            +
          </button>
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded"
        >
          Add to Cart
        </button>

        <button className="w-full bg-black text-white py-2 mt-2 rounded">
          Order Now
        </button>

        <button
          onClick={() => setShowInquiry(true)}
          className="w-full border border-black text-black py-2 mt-3 rounded hover:bg-black hover:text-white transition"
        >
          Request Custom Size
        </button>
      </div>
    </div>
  );
};

export default SofaDetail;
