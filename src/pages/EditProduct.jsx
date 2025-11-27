import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package, Upload, X as XIcon, Trash2 } from "lucide-react";
import axiosClient from "../api/axiosClient";
import UserProfileButton from "../components/UserProfileButton";

export default function EditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Lấy ID sản phẩm từ URL

  // Lấy dữ liệu sản phẩm ban đầu từ state của navigation
  const initialProductData = location.state;

  // State cho dữ liệu form
  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    price: 0,
    inventory: 0,
    description: "",
    categoryId: "",
    collectionId: "", // Thêm collectionId
    collectionName: "", // Thêm collectionName để hiển thị
  });

  // State để tải và lưu danh sách category
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]); // Thêm state cho collections
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho images
  const [existingImages, setExistingImages] = useState([]); // Ảnh hiện có từ server
  const [newImages, setNewImages] = useState([]); // Ảnh mới để upload
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Preview ảnh mới

  // Tải danh sách categories và set dữ liệu form ban đầu
  useEffect(() => {
    // 1. Set dữ liệu form từ location.state
    if (initialProductData) {
      setProductData({
        name: initialProductData.name || "",
        brand: initialProductData.brand || "",
        price: initialProductData.price || 0,
        inventory: initialProductData.inventory || 0,
        description: initialProductData.description || "",
        categoryId: initialProductData.category?.id.toString() || "",
        collectionId: initialProductData.collection?.id?.toString() || "",
        // Fix: API trả về collectionId là string, không phải object
        collectionName: initialProductData.collectionId || initialProductData.collection?.name || "Không có bộ sưu tập",
      });
      // Set existing images
      setExistingImages(initialProductData.images || []);
    } else {
      setError("Không tìm thấy dữ liệu sản phẩm. Vui lòng quay lại trang danh sách.");
      console.warn("Không tìm thấy location.state. Cân nhắc gọi API để lấy dữ liệu sản phẩm.");
    }

    // 2. Tải danh sách categories
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get("/category/getall", {
          headers: { "x-no-redirect": "1" }
        });
        let apiData = [];
        if (res.data && Array.isArray(res.data.result)) {
          apiData = res.data.result;
        } else if (Array.isArray(res.data)) {
          apiData = res.data;
        }
        setCategories(apiData);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setError("Không thể tải danh sách danh mục.");
      }
    };

    // 3. Tải danh sách collections (để hiển thị thông tin)
    const fetchCollections = async () => {
      try {
        const res = await axiosClient.get("/collection/get-all", {
          headers: { "x-no-redirect": "1" }
        });
        console.log("📦 Collection API Response (EditProduct):", res.data); // Debug log
        
        let apiData = [];
        if (res.data && res.data.result && Array.isArray(res.data.result.content)) {
          apiData = res.data.result.content;
        } else if (res.data && Array.isArray(res.data.result)) {
          apiData = res.data.result;
        }
        
        console.log("📦 Processed Collections (EditProduct):", apiData); // Debug log
        setCollections(apiData);
      } catch (err) {
        console.error("Lỗi khi tải bộ sưu tập:", err);
      }
    };

    fetchCategories();
    fetchCollections();
  }, [id, initialProductData]); // Chạy lại nếu ID hoặc dữ liệu ban đầu thay đổi

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  // Xử lý chọn ảnh mới
  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  // Xóa ảnh mới (chưa upload)
  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Xóa ảnh hiện có (gọi API delete)
  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await axiosClient.delete(`/image/delete/${imageId}`, {
        headers: { "x-no-redirect": "1" }
      });
      alert("Xóa ảnh thành công!");
      setExistingImages(prev => prev.filter(img => img.imageId !== imageId));
    } catch (err) {
      console.error("❌ Lỗi khi xóa ảnh:", err);
      alert("Xóa ảnh thất bại. Vui lòng thử lại.");
    }
  };

  // Upload ảnh mới (đã đúng - sử dụng /image/upload)
  const uploadNewImages = async (productId) => {
    if (newImages.length === 0) return;

    const formData = new FormData();
    newImages.forEach(file => {
      formData.append('files', file);
    });
    formData.append('productId', productId);

    try {
      const res = await axiosClient.post('/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "x-no-redirect": "1"
        },
      });
      console.log('✅ Upload new images success:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Lỗi khi upload ảnh mới:', err);
      throw err;
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === productData.categoryId
    );

    if (!selectedCategory) {
      setError("Vui lòng chọn một danh mục hợp lệ.");
      setLoading(false);
      return;
    }

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
    };

    try {
      // Gọi song song cả 2 API: update product và upload images
      const promises = [
        axiosClient.put(`/products/update/${id}`, payload, {
          headers: { "x-no-redirect": "1" }
        })
      ];

      // Thêm promise upload ảnh nếu có ảnh mới
      if (newImages.length > 0) {
        promises.push(uploadNewImages(id));
      }

      // Chờ tất cả API hoàn thành (chạy song song)
      await Promise.all(promises);

      // Thông báo thành công
      if (newImages.length > 0) {
        alert("Cập nhật sản phẩm và upload ảnh mới thành công!");
      } else {
        alert("Cập nhật sản phẩm thành công!");
      }

      navigate("/products");
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      setError("Cập nhật sản phẩm thất bại. Vui lòng thử lại.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có dữ liệu ban đầu, không render form
  if (!initialProductData && !error) {
     return (
        <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800 flex items-center justify-center">
            <p>Đang tải dữ liệu...</p>
        </div>
     );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      <UserProfileButton />
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Chỉnh sửa Sản phẩm</h2>
          <p className="text-sm text-blue-100">Cập nhật thông tin chi tiết của sản phẩm</p>
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
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    <option disabled>Đang tải danh mục...</option>
                  )}
                </select>
              </div>

              {/* Bộ sưu tập (chỉ hiển thị, không chỉnh sửa) */}
              <div>
                <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bộ sưu tập <span className="text-xs text-gray-500">(Không thể chỉnh sửa)</span>
                </label>
                <input
                  type="text"
                  id="collectionName"
                  name="collectionName"
                  disabled
                  value={productData.collectionName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
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

          {/* Image Management Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-md font-semibold mb-4 text-gray-700">Quản lý hình ảnh</h3>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh hiện có ({existingImages.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div key={img.imageId} className="relative group">
                      <img
                        src={img.downloadUrl}
                        alt={img.imageName}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.imageId)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm ảnh mới
              </label>
              <div className="mb-4">
                <label htmlFor="new-image-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  <Upload size={16} />
                  Chọn ảnh
                  <input
                    id="new-image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageSelect}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  ({newImages.length} ảnh mới đã chọn)
                </span>
              </div>

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon size={16} />
                      </button>
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                        Mới
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nút Submit và Lỗi */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            {error && <p className="text-red-500 text-sm mb-4 sm:mb-0">{error}</p>}
            
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? "Đang cập nhật..." : "Cập nhật Sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
