import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import api from "../../api";

const BACKEND_URL = "https://sandhya-furnishing-backend.onrender.com";

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    isLatest: false,
  });

  // Sofa fields
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [warranty, setWarranty] = useState("");
  const [fabric, setFabric] = useState("");
  const [extraNote, setExtraNote] = useState("");

  // Curtain fields
  const [fabricType, setFabricType] = useState("");
  const [transparency, setTransparency] = useState("");
  const [pattern, setPattern] = useState("");
  const [curtainColor, setCurtainColor] = useState("");
  const [lining, setLining] = useState("");
  const [stitchingType, setStitchingType] = useState("");
  const [defaultSize, setDefaultSize] = useState("");
  const [installationType, setInstallationType] = useState("");
  const [installationCharges, setInstallationCharges] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [customSizeAvailable, setCustomSizeAvailable] = useState(false);
  const [curtainExtraNote, setCurtainExtraNote] = useState("");

  // Pillow fields
  const [pillowType, setPillowType] = useState("");
  const [pillowSize, setPillowSize] = useState("");
  const [pillowWeight, setPillowWeight] = useState("");
  const [pillowFabric, setPillowFabric] = useState("");
  const [pillowFilling, setPillowFilling] = useState("");
  const [pillowDimensions, setPillowDimensions] = useState("");

  // Cotton Gadda fields
  const [gSize, setGSize] = useState("");
  const [gThickness, setGThickness] = useState("");
  const [gWeight, setGWeight] = useState("");
  const [gFabricMaterial, setGFabricMaterial] = useState("");
  const [gFillingType, setGFillingType] = useState("");
  const [gColorOptions, setGColorOptions] = useState("");

  // ================= Carpet Fields =================
  const [carpetType, setCarpetType] = useState("");
  const [carpetSize, setCarpetSize] = useState("");
  const [carpetWeight, setCarpetWeight] = useState("");
  const [carpetMaterial, setCarpetMaterial] = useState("");
  const [carpetWashType, setCarpetWashType] = useState("");
  const [carpetColorOptions, setCarpetColorOptions] = useState("");
  const [carpetShape, setCarpetShape] = useState("");
  const [carpetAdditionalNote, setCarpetAdditionalNote] = useState("");

  // Product Images
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Dimension Images (MULTIPLE)
  const [dimensionImages, setDimensionImages] = useState([]);
  const [dimensionPreviews, setDimensionPreviews] = useState([]);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    api.get("/categories/all").then((res) => {
      setCategories(res.data.categories || []);
    });
  }, []);

  /* ================= LOAD TYPES ================= */
  useEffect(() => {
    if (!selectedCategory) return;

    const catObj = categories.find(
      (c) => c.name.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
    );

    if (!catObj) return;

    api
      .get(`/types/category/${catObj._id}`)
      .then((res) => setTypes(res.data.types || []))
      .catch(() => setTypes([]));
  }, [selectedCategory, categories]);

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      const res = await api.get(`/products/${id}`);
      const p = res.data.product;
      const extra = p.extraFields || {};

      // SET BASIC INFO
      setProductData({
        name: p.name,
        price: p.price,
        description: p.description || "",
        isLatest: p.isLatest || false,
      });

      // SET CATEGORY FIRST
      const catName = p.category?.name?.toLowerCase().trim();
      setSelectedCategory(catName);

      // WAIT for types to load based on category
      setTimeout(() => {
        setSelectedType(p.type?._id);
      }, 300);

      // ========== SOFA FIELDS ==========
      setSize(p.extraFields?.size || "");
      setColor(p.extraFields?.color || "");
      setWarranty(p.extraFields?.warranty || "");
      setFabric(p.extraFields?.fabric || "");
      setExtraNote(p.extraFields?.extraNote || "");

      // ========== CURTAIN FIELDS ==========
      setFabricType(p.extraFields?.fabricType || "");
      setTransparency(p.extraFields?.transparency || "");
      setPattern(p.extraFields?.pattern || "");
      setCurtainColor(p.extraFields?.color || "");
      setLining(p.extraFields?.lining || "");
      setStitchingType(p.extraFields?.stitchingType || "");
      setDefaultSize(p.extraFields?.defaultSize || "");
      setInstallationType(p.extraFields?.installationType || "");
      setInstallationCharges(p.extraFields?.installationCharges || "");
      setCareInstructions(p.extraFields?.careInstructions || "");
      setCustomSizeAvailable(p.extraFields?.customSizeAvailable || false);

      // COTTON GADDA
      setGSize(p.extraFields?.size || "");
      setGThickness(p.extraFields?.thickness || "");
      setGWeight(p.extraFields?.weight || "");
      setGFabricMaterial(p.extraFields?.fabricMaterial || "");
      setGFillingType(p.extraFields?.fillingType || "");
      setGColorOptions(p.extraFields?.colorOptions || "");

      // PILLOW FIELDS
      setPillowType(p.extraFields?.pillowType || "");
      setPillowSize(p.extraFields?.size || "");
      setPillowWeight(p.extraFields?.weight || "");
      setPillowFabric(p.extraFields?.fabricMaterial || "");
      setPillowFilling(p.extraFields?.fillingMaterial || "");
      setPillowDimensions(p.extraFields?.dimensions || "");

      // ========== CARPET FIELDS ==========
      // ========== CARPET FIELDS ==========
      setCarpetType(extra.carpetType || "");
      setCarpetSize(extra.size || "");
      setCarpetWeight(extra.weight || "");
      setCarpetMaterial(extra.material || "");
      setCarpetWashType(extra.washType || "");
      setCarpetColorOptions(extra.colorOptions || "");
      setCarpetShape(extra.shape || "");
      setCarpetAdditionalNote(extra.additionalNote || "");

      // NOTE: curtain extra note uses a separate field in state,
      // but DB uses same key "extraNote"
      setCurtainExtraNote(p.extraFields?.extraNote || "");

      // IMAGES
      const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        if (url.startsWith("/uploads")) return `${BACKEND_URL}${url}`;
        return `${BACKEND_URL}/uploads/${url}`;
      };

      if (p.images) {
        setImagePreviews(p.images.map(getImageUrl));
      }

      if (p.dimensionImages) {
        setDimensionPreviews(p.dimensionImages.map(getImageUrl));
      }
    };

    loadProduct();
  }, [id]);
  /* ================= PRODUCT IMAGES ================= */
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [
      ...prev,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= DIMENSION IMAGES ================= */
  const handleDimensionChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setDimensionImages((prev) => [...prev, ...newFiles]);
    setDimensionPreviews((prev) => [
      ...prev,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };


  const removeDimensionImage = (index) => {
    setDimensionImages((prev) => prev.filter((_, i) => i !== index));
    setDimensionPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const catObj = categories.find(
      (c) =>
        c.name.toLowerCase().trim() ===
        selectedCategory.toLowerCase().trim()
    );

    if (!catObj) {
      console.error("Category object not found");
      return;
    }
    if (!selectedType) {
      console.error("Type is missing");
      return;
    }

    const formData = new FormData();
    formData.append("product_name", productData.name);
    formData.append("price", productData.price);
    formData.append("description", productData.description);
    formData.append("category_id", catObj._id);
    formData.append("type_id", selectedType);
    formData.append("isLatest", productData.isLatest);

    const catLower = selectedCategory?.toLowerCase()?.trim() || "";

    // SOFA
    if (catLower.includes("sofa")) {
      formData.append(
        "extraFields",
        JSON.stringify({
          size,
          color,
          warranty,
          fabric,
          extraNote,
        })
      );
    }

    // CURTAINS
    if (catLower.includes("curtain")) {
      formData.append(
        "extraFields",
        JSON.stringify({
          fabricType,
          transparency,
          pattern,
          color: curtainColor,
          lining,
          stitchingType,
          defaultSize,
          installationType,
          installationCharges,
          careInstructions,
          customSizeAvailable,
          extraNote: curtainExtraNote,
        })
      );
    }

    if (catLower.includes("carpet")) {
      formData.append(
        "extraFields",
        JSON.stringify({
          carpetType,
          shape: carpetShape,
          size: carpetSize,
          weight: carpetWeight,
          material: carpetMaterial,
          washType: carpetWashType,
          colorOptions: carpetColorOptions,
          additionalNote: carpetAdditionalNote
        })
      );
    }

    // PILLOWS
    if (catLower.includes("pillow")) {
      formData.append(
        "extraFields",
        JSON.stringify({
          pillowType,
          size: pillowSize,
          weight: pillowWeight,
          fabricMaterial: pillowFabric,
          fillingMaterial: pillowFilling,
          dimensions: pillowDimensions,
        })
      );
    }

    // COTTON GADDA
    if (catLower.includes("cotton") || catLower.includes("gadda") || catLower.includes("bedding")) {
      formData.append(
        "extraFields",
        JSON.stringify({
          size: gSize,
          thickness: gThickness,
          weight: gWeight,
          fabricMaterial: gFabricMaterial,
          fillingType: gFillingType,
          colorOptions: gColorOptions,
        })
      );
    }

    // Append existing images that haven't been deleted
    const getExistingFromPreviews = (previews) => {
      // Return strings that look like backend URLs (not Object URLs)
      return previews
        .filter(url => url.startsWith("http"))
        .map(url => url.replace(BACKEND_URL, ""));
    };

    const existingImages = getExistingFromPreviews(imagePreviews);
    const existingDimensionImages = getExistingFromPreviews(dimensionPreviews);

    formData.append("existingImages", JSON.stringify(existingImages));
    formData.append("existingDimensionImages", JSON.stringify(existingDimensionImages));

    // Append newly added files
    images.forEach((file) => formData.append("images", file));
    dimensionImages.forEach((file) =>
      formData.append("dimensionImages", file)
    );

    try {
      if (isEditMode) {
        await api.put(`/products/update/${id}`, formData);
      } else {
        await api.post("/products/add", formData);
      }

      setSuccessMessage(
        isEditMode
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setTimeout(() => {
        setSuccessMessage("");
        navigate("/admin/products");
      }, 1200);

    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/products")}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-sm font-medium mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </button>

          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                {isEditMode ? "Update the details of the selected product below." : "Fill in the product details below to add it to your catalog."}
              </p>
            </div>

            {successMessage && (
              <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-200">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-12">

          {/* Categorization Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                1
              </span>
              Categorization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <div className="relative">
                  <select
                    required
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value.toLowerCase().trim())}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name.toLowerCase().trim()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Product Type *</label>
                <div className="relative">
                  <select
                    required
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
                    disabled={!selectedCategory || types.length === 0}
                  >
                    <option value="">Select a Type</option>
                    {types.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.type_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                2
              </span>
              Basic Details
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Product Name *</label>
                <input
                  required
                  placeholder="e.g. Luxury Velvet L-Shaped Sofa"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price (₹) *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</div>
                  <input
                    required
                    type="number"
                    placeholder="0.00"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 pl-8 rounded-xl text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Provide a detailed description of the product..."
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* ================= CURTAIN FIELDS ================= */}
          {(selectedCategory?.toLowerCase()?.trim() || "").includes("curtain") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </span>
                Curtain Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fabric Type</label>
                  <input placeholder="e.g. Cotton, Silk, Polyester" value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transparency</label>
                  <input placeholder="e.g. Sheer, Semi-Sheer, Blackout" value={transparency} onChange={(e) => setTransparency(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pattern / Design</label>
                  <input placeholder="e.g. Floral, Geometric, Solid" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</label>
                  <input placeholder="e.g. Navy Blue, Beige, Emerald" value={curtainColor} onChange={(e) => setCurtainColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lining</label>
                  <input placeholder="e.g. Cotton lining, Blackout lining" value={lining} onChange={(e) => setLining(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stitching Type</label>
                  <input placeholder="e.g. Eyelet, Pinch Pleat, Rod Pocket" value={stitchingType} onChange={(e) => setStitchingType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Default Size</label>
                  <input placeholder="e.g. 5ft x 7ft (W x H)" value={defaultSize} onChange={(e) => setDefaultSize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Installation Type</label>
                  <input placeholder="e.g. Professional Installation Included" value={installationType} onChange={(e) => setInstallationType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Installation Charges</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</div>
                    <input type="number" placeholder="0" value={installationCharges} onChange={(e) => setInstallationCharges(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-7 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Care Instructions</label>
                  <input placeholder="e.g. Dry clean only, Machine washable" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Additional Details / Notes</label>
                  <textarea rows="2" placeholder="Any extra information specific to this curtain design..." value={curtainExtraNote} onChange={(e) => setCurtainExtraNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none" />
                </div>
                <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Custom Size Available</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Allow customers to request exact dimensions for this design.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={customSizeAvailable} onChange={(e) => setCustomSizeAvailable(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= SOFA FIELDS ================= */}
          {(selectedCategory?.toLowerCase()?.trim() || "").includes("sofa") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                Sofa Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dimensions / Size</label>
                  <input placeholder="e.g. 3 Seater (72 x 30 x 32 inches)" value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</label>
                  <input placeholder="e.g. Charcoal Grey, Mustard Yellow" value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Warranty</label>
                  <input placeholder="e.g. 5 Years Frame Warranty" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fabric & Material</label>
                  <input placeholder="e.g. Premium Velvet, Solid Teak Wood Base" value={fabric} onChange={(e) => setFabric(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Additional Details / Notes</label>
                  <textarea rows="2" placeholder="Any extra information specific to this sofa..." value={extraNote} onChange={(e) => setExtraNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none" />
                </div>
              </div>
            </div>
          )}

          {((selectedCategory?.toLowerCase()?.trim() || "").includes("cotton") || (selectedCategory?.toLowerCase()?.trim() || "").includes("gadda") || (selectedCategory?.toLowerCase()?.trim() || "").includes("bedding")) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                </span>
                Cotton Gadda Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Size</label>
                  <input
                    placeholder="e.g. Single / Double / Custom"
                    value={gSize}
                    onChange={(e) => setGSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Thickness (in inches)</label>
                  <input
                    value={gThickness}
                    onChange={(e) => setGThickness(e.target.value)}
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Weight</label>
                  <input
                    value={gWeight}
                    onChange={(e) => setGWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Fabric Material</label>
                  <input
                    value={gFabricMaterial}
                    onChange={(e) => setGFabricMaterial(e.target.value)}
                    placeholder="e.g. Cotton / Soft Cotton"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Filling Type</label>
                  <input
                    value={gFillingType}
                    onChange={(e) => setGFillingType(e.target.value)}
                    placeholder="e.g. Cotton / Recycled Cotton"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Color Options</label>
                  <input
                    value={gColorOptions}
                    onChange={(e) => setGColorOptions(e.target.value)}
                    placeholder="e.g. Red, Blue, Maroon"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

              </div>
            </div>
          )}

          {/* ================= CARPET FIELDS ================= */}
          {(selectedCategory?.toLowerCase()?.trim() || "").includes("carpet") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  🧶
                </span>
                Carpet Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Carpet Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Carpet Type</label>
                  <input
                    value={carpetType}
                    onChange={(e) => setCarpetType(e.target.value)}
                    placeholder="Handloom, Jute, Wool, etc."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Size</label>
                  <input
                    value={carpetSize}
                    onChange={(e) => setCarpetSize(e.target.value)}
                    placeholder="e.g. 4x6, 5x7, 6x9"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Shape */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Shape</label>
                  <input
                    value={carpetShape}
                    onChange={(e) => setCarpetShape(e.target.value)}
                    placeholder="Rectangle, Round, Square, Oval..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Weight</label>
                  <input
                    value={carpetWeight}
                    onChange={(e) => setCarpetWeight(e.target.value)}
                    placeholder="e.g. 3kg, 4kg"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Material */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Material</label>
                  <input
                    value={carpetMaterial}
                    onChange={(e) => setCarpetMaterial(e.target.value)}
                    placeholder="Cotton, Wool, Jute, Shaggy..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Wash Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Wash Type</label>
                  <input
                    value={carpetWashType}
                    onChange={(e) => setCarpetWashType(e.target.value)}
                    placeholder="Machine Wash / Dry Clean"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>

                {/* Color Options */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Color Options</label>
                  <input
                    value={carpetColorOptions}
                    onChange={(e) => setCarpetColorOptions(e.target.value)}
                    placeholder="Red, Blue, Beige, Multi-color..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>


                {/* Additional Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Additional Note</label>
                  <textarea
                    rows="2"
                    value={carpetAdditionalNote}
                    onChange={(e) => setCarpetAdditionalNote(e.target.value)}
                    placeholder="Any special details customers should know..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg resize-none"
                  />
                </div>

              </div>
            </div>
          )}

          {/* ================= PILLOW FIELDS ================= */}
          {(selectedCategory?.toLowerCase()?.trim() || "").includes("pillow") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 12s1.5-6 8-6 8 6 8 6-1.5 6-8 6-8-6-8-6z" />
                  </svg>
                </span>
                Pillow Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pillow Type</label>
                  <input placeholder="Soft, Firm, Memory Foam, Cotton" value={pillowType} onChange={(e) => setPillowType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Size</label>
                  <input placeholder="Standard / Queen / King" value={pillowSize} onChange={(e) => setPillowSize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Weight</label>
                  <input placeholder="e.g. 500g, 700g" value={pillowWeight} onChange={(e) => setPillowWeight(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fabric Material</label>
                  <input placeholder="e.g. Cotton, Velvet, Polyester" value={pillowFabric} onChange={(e) => setPillowFabric(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filling Material</label>
                  <input placeholder="e.g. Microfiber, Cotton, Memory Foam" value={pillowFilling} onChange={(e) => setPillowFilling(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dimensions (L × W × H)</label>
                  <input placeholder="e.g. 24 × 16 × 6 inches" value={pillowDimensions} onChange={(e) => setPillowDimensions(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Product Images & Media */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                3
              </span>
              Product Media
            </h2>

            <div className="space-y-8">
              {/* Main Images */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Main Product Images *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Click to browse or drag images here</p>
                  <p className="text-xs text-slate-400 mb-4">Supports PNG, JPG, WEBP (Max 5MB)</p>
                  <label className="cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    Select Images
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors transform scale-75 group-hover:scale-100"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dimension Images */}
              <div className="pt-8 border-t border-gray-100">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Dimension / Blueprint Images (Optional)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Upload technical drawings or size charts</p>
                  <label className="mt-3 cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    Select Images
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleDimensionChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {dimensionPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                    {dimensionPreviews.map((img, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt={`Dimension ${index}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeDimensionImage(index)}
                            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors transform scale-75 group-hover:scale-100"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings & Submit Card */}
          <div className="bg-slate-50/50 rounded-2xl border border-gray-100 shadow-inner p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={productData.isLatest}
                onChange={(e) => setProductData({ ...productData, isLatest: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 group-hover:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-shadow"></div>
              <span className="ml-3 text-sm font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Mark as Latest / Featured Product</span>
            </label>

            <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-blue-600 focus:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 text-white rounded-xl font-bold tracking-wide transition-all shadow-md shadow-slate-900/10 active:scale-[0.98]">
              {isEditMode ? "Save Changes" : "Publish Product"}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;
