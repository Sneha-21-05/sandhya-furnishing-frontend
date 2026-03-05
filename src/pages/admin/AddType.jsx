import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import AdminLayout from "./AdminLayout";

const AddType = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [typeName, setTypeName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();

    if (isEdit) {
      api.get(`/types/single/${id}`).then((res) => {
        if (res.data.success) {
          const type = res.data.type;
          setTypeName(type.type_name);
          setCategoryId(type.category_id);
          if (type.image_url) {
            setPreview(`https://sandhya-furnishing-backend.onrender.com${type.image_url}`);
          }
        }
      });
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/all");
      if (res.data.success) {
        setCategories(res.data.categories);
        setError("");
      }
    } catch {
      setError("Failed to load categories");
    }
  };

  const handleImageChange = (file) => {
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("type_name", typeName);
    formData.append("category_id", categoryId);
    if (image) formData.append("image", image);

    try {
      const res = isEdit
        ? await api.put(`/types/update/${id}`, formData)
        : await api.post("/types/add", formData);

      if (res.data.success) {
        setMessage(
          isEdit
            ? "Type updated successfully"
            : "Type added successfully"
        );
        setTimeout(() => navigate("/admin/types"), 1000);
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto mt-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-wide flex items-center gap-3">
            <button onClick={() => navigate("/admin/types")} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            {isEdit ? "Edit Type" : "Add New Type"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            {isEdit ? "Update the details of the selected product type." : "Create a new product type for a specific category."}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="font-medium text-[15px]">{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            <span className="font-medium text-[15px]">{error}</span>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CATEGORY SELECT */}
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-slate-700">Parent Category</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium cursor-pointer"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="" disabled className="text-slate-400 font-normal">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* TYPE NAME INPUT */}
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-slate-700">Type Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                placeholder="e.g. Modern Sofa"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-slate-700">Type Image</label>

              <div className="flex flex-col sm:flex-row gap-6 mt-2">
                {/* Current Image / Preview Box */}
                <div className="w-full sm:w-48 aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs font-medium text-slate-400">No image chosen</span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="type-image"
                      className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      accept="image/*"
                    />
                    <label htmlFor="type-image" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer font-medium text-sm shadow-sm peer-focus-[focus-visible]:ring-2 peer-focus-[focus-visible]:ring-blue-500 peer-focus-[focus-visible]:ring-offset-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Choose File
                    </label>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
                    Select a high-quality image that represents this product type. We recommend a transparent PNG or a JPG with a solid background.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/types")}
                className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-semibold shadow-sm text-[15px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg text-[15px] flex items-center justify-center gap-2"
              >
                {isEdit ? "Update Type" : "Save Type"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddType;
