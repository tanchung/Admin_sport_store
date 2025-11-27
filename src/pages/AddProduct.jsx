import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Package, Upload, X as XIcon } from "lucide-react";
import axiosClient from "../api/axiosClient";
import UserProfileButton from "../components/UserProfileButton";

export default function AddProduct() {
  const navigate = useNavigate();
  
  // State cho dữ liệu form
  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    price: 0,
    inventory: 0,
    description: "",
    categoryId: "", 
    collectionId: "", 
  });

  // State để tải và lưu danh sách category và collection
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho images
  const [selectedImages, setSelectedImages] = useState([]); // Files để upload
  const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs

  // Tải danh sách categories và collections khi component mount
  useEffect(() => {
    let isMounted = true; // Flag để tránh cập nhật state trên component đã unmount

    // 1. Tải danh sách categories
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get("/category/getall");
        let apiData = [];
        if (res.data && Array.isArray(res.data.result)) {
          apiData = res.data.result;
        } else if (Array.isArray(res.data)) {
          apiData = res.data;
        }

        if (isMounted) {
          setCategories(apiData);
          // Tự động chọn category đầu tiên nếu có
          if (apiData.length > 0) {
            setProductData(prev => ({ ...prev, categoryId: apiData[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        if (isMounted) {
          setError("Không thể tải danh sách danh mục.");
        }
      }
    };

    // 2. Tải danh sách collections
    const fetchCollections = async () => {
      try {
        const res = await axiosClient.get("/collection/get-all"); 
        console.log("📦 Collection API Response:", res.data); // Debug log
        
        let apiData = [];
        // Xử lý cấu trúc response có phân trang
        if (res.data && res.data.result && Array.isArray(res.data.result.content)) { 
          // API trả về: { result: { content: [...], page: {...} } }
          apiData = res.data.result.content;
        } else if (res.data && Array.isArray(res.data.result)) { 
          // API trả về: { result: [...] }
          apiData = res.data.result;
        } else if (res.data && Array.isArray(res.data.data)) {
          apiData = res.data.data;
        } else if (Array.isArray(res.data)) {
          apiData = res.data;
        } else if (res.data && typeof res.data === 'object' && res.data.id) {
          // Nếu trả về 1 object
          apiData = [res.data];
        }
        
        console.log("📦 Processed Collections:", apiData); // Debug log
        
        if (isMounted) {
          setCollections(apiData);
          // Tự động chọn collection đầu tiên nếu có
          if (apiData.length > 0 && apiData[0].id) {
            setProductData(prev => ({ ...prev, collectionId: apiData[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải bộ sưu tập:", err);
        console.error("Error response:", err.response?.data); // Debug log
        if (isMounted && (!err.response || (err.response && err.response.status !== 401))) {
           setError("Không thể tải danh sách bộ sưu tập.");
        }
      }
    };

    fetchCategories();
    fetchCollections(); 

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // [] đảm bảo useEffect chỉ chạy 1 lần khi mount

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : (type === 'select-one' ? value.toString() : value),
    }));
  };

  // Xử lý chọn ảnh
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Thêm files vào danh sách
    setSelectedImages(prev => [...prev, ...files]);

    // Tạo preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (index) => {
    // Revoke preview URL để tránh memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images sau khi tạo product thành công
  const uploadImages = async (productId) => {
    if (selectedImages.length === 0) return;

    const formData = new FormData();
    selectedImages.forEach(file => {
      formData.append('files', file);
    });
    formData.append('productId', productId);

    try {
      const res = await axiosClient.post('/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Upload images success:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Lỗi khi upload ảnh:', err);
      throw err;
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Tìm đối tượng category hoàn chỉnh
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === productData.categoryId
    );

    if (!selectedCategory || !productData.collectionId) {
      setError("Vui lòng chọn danh mục và bộ sưu tập hợp lệ.");
      setLoading(false);
      return;
    }

    // Xây dựng payload theo yêu cầu của API (POST /products/create)
    const payload = {
      name: productData.name,
      brand: productData.brand,
      price: productData.price,
      inventory: productData.inventory,
      description: productData.description,
      category: {
        id: selectedCategory.id,
        name: selectedCategory.name,
      },
      collectionId: parseInt(productData.collectionId, 10),
    };

    try {
      // 1. Tạo sản phẩm trước
      const createRes = await axiosClient.post("/products/create", payload);
      const newProductId = createRes.data?.result?.id || createRes.data?.id;
      
      if (!newProductId) {
        throw new Error("Không lấy được ID sản phẩm sau khi tạo");
      }

      // 2. Upload ảnh nếu có
      if (selectedImages.length > 0) {
        await uploadImages(newProductId);
        alert("Thêm sản phẩm và upload ảnh thành công!");
      } else {
        alert("Thêm sản phẩm thành công!");
      }
      
      navigate("/products");
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      setError("Thêm sản phẩm thất bại. Vui lòng thử lại.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      <UserProfileButton />
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Thêm Sản phẩm mới</h2>
          <p className="text-sm text-blue-100">Điền thông tin chi tiết của sản phẩm</p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cột 1: Tên, Brand, Description */}
            <div className="flex flex-col gap-4">
              {/* Tên sản phẩm */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={productData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Thương hiệu */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  required
                  value={productData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={productData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>

            {/* Cột 2: Category, Collection, Price, Inventory */}
            <div className="flex flex-col gap-4">
              {/* Danh mục */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={productData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))
                  ) : (
                    <option disabled>Đang tải danh mục...</option>
                  )}
                </select>
              </div>

              {/* Bộ sưu tập  */}
              <div>
                <label htmlFor="collectionId" className="block text-sm font-medium text-gray-700 mb-1">Bộ sưu tập</label>
                <select
                  id="collectionId"
                  name="collectionId"
                  required
                  value={productData.collectionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="" disabled>-- Chọn bộ sưu tập --</option>
                  {collections.length > 0 ? (
                    collections.map(col => (
                      <option key={col.id} value={col.id.toString()}>
                        {col.name || col.collectionName || `Collection #${col.id}`}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      {error ? "Không thể tải bộ sưu tập" : "Đang tải bộ sưu tập..."}
                    </option>
                  )}
                </select>
              </div>

              {/* Giá */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="1000"
                  value={productData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tồn kho */}
              <div>
                <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  required
                  min="0"
                  value={productData.inventory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sản phẩm
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <Upload size={16} />
                Chọn ảnh
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <span className="ml-3 text-sm text-gray-500">
                ({selectedImages.length} ảnh đã chọn)
              </span>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nút Submit và Lỗi */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            {/* Hiển thị lỗi ở bên trái */}
            <div className="flex-1">
              {error && <p className="text-red-500 text-sm mb-4 sm:mb-0">{error}</p>}
            </div>
            
            {/* Nút submit ở bên phải */}
            <button
              type="submit"
              disabled={loading || categories.length === 0 || collections.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? "Đang lưu..." : "Lưu Sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

