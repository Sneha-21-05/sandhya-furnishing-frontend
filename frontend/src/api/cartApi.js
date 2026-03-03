import api from "../api";   // keep using old api.js for axios instance

export const addToCart = async (userId, productId, quantity = 1, isCustomSize = false, customDimensions = null) => {
  try {
    const res = await api.post("/cart/add", {
      userId,
      productId,
      quantity,
      isCustomSize,
      customDimensions,
    });
    return res.data;
  } catch (error) {
    console.error("Add to cart failed:", error);
    return { success: false };
  }
};

export const getCart = async (userId) => {
  try {
    const res = await api.get(`/cart/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get cart failed:", error);
    return null;
  }
};
