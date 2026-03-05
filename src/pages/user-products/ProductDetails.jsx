import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtils";

const ProductDetails = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!category) return;

    setLoading(true);

    // Fetch products by category
    api
      .get(`/products/category/${category}`)
      .then((res) => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation(); // prevent card click event

    if (!user || !user._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const response = await addToCart(user._id, productId, 1);

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

  if (loading) {
    return <p style={{ padding: "30px" }}>Loading products...</p>;
  }

  return (
    <div className="category-products-page">
      <h2 style={{ marginBottom: "20px", textTransform: "capitalize" }}>
        {category} Products
      </h2>

      {products.length === 0 ? (
        <p>No products available in this category.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() =>
                navigate(`/product/${category}/${product._id}`)
              }
              style={{ cursor: "pointer" }}
            >
              <img
                src={getImageUrl(product.images?.[0])}
                alt={product.name}
                className="product-image"
              />

              <h4>{product.name}</h4>

              <p className="price">
                ₹{product.price}
                {product.price_unit === "per_sqft" && (
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {" "}/ sq ft
                  </span>
                )}
              </p>

              <button
                onClick={(e) => handleAddToCart(e, product._id)}
                className="add-cart-btn"
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  background: "black",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
