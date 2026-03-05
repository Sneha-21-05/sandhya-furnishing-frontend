export const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // Handle case where path starts with /uploads
    if (imagePath.startsWith("/uploads")) {
        return `https://sandhya-furnishing-backend.onrender.com${imagePath}`;
    }

    // Handle case where it is just the filename
    return `https://sandhya-furnishing-backend.onrender.com/uploads/${imagePath}`;
};
