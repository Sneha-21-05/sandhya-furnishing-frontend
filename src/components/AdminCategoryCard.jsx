import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminCategoryCard = ({ category, onEdit, onDelete }) => {
  const image =
    category.image_url
      ? `http://localhost:5000${category.image_url}`
      : "https://via.placeholder.com/400x300";

  return (
    <div className="bg-white rounded-xl shadow p-4 relative">
      <img
        src={image}
        alt={category.name}
        className="w-full h-40 object-cover rounded-lg"
      />

      <h3 className="mt-3 text-lg font-semibold">
        {category.name}
      </h3>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiEdit2 />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FiTrash2 />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminCategoryCard;
