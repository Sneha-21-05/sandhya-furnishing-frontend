import api from "../api";   // keep using old api.js for axios instance

export const getCart = async (userId) => {
  try {
    const res = await api.get(`/cart/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get cart failed:", error);
    return null;
  }
};

export const addToCart = async (userId, productId, quantity = 1, isCustomSize = false, customDimensions = null) => {
  try {
    const res = await api.post("/cart/add", {
      userId,
      productId,
      quantity,
      isCustomSize,
      customDimensions,
    });

    // Auto-sync cart count globally for the UI badge!
    if (res.data?.success) {
      try {
        const cartData = await getCart(userId);
        if (cartData?.cart?.items) {
          localStorage.setItem("cartCount", cartData.cart.items.length);
          window.dispatchEvent(new Event("cart-updated"));
        }
      } catch (err) {
        console.error("Failed to auto-sync global cart count", err);
      }
    }

    return res.data;
  } catch (error) {
    console.error("Add to cart failed:", error);
    return { success: false };
  }
};


