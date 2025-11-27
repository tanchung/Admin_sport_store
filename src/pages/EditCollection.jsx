import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, UploadCloud } from "lucide-react"; // Đổi icon
import axiosClient from "../api/axiosClient.js";
import UserProfileButton from "../components/UserProfileButton.jsx";

export default function EditCollection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // State cho dữ liệu form (vẫn giữ imageUrl để hiển thị)
  const [collectionData, setCollectionData] = useState({
    name: "",
    description: "",
    imageUrl: "", // Dùng để hiển thị ảnh hiện tại
  });
  
  // === THAY ĐỔI 1: Thêm state cho file MỚI ===
  const [imageFile, setImageFile] = useState(null); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tải dữ liệu collection (Giữ nguyên)
  useEffect(() => {
    if (location.state) {
      setCollectionData(location.state);
    } else {
      const fetchCollectionById = async () => {
        setLoading(true);
        try {
          const res = await axiosClient.get(
            `/collection/get-collection-by-id/${id}`
          );
          let data = res.data.result || res.data;
          if (data && typeof data === "object") {
            setCollectionData(data);
          } else {
            setError("Không tìm thấy dữ liệu bộ sưu tập.");
          }
        } catch (err) {
          console.error("Lỗi khi tải bộ sưu tập:", err);
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      };
      fetchCollectionById();
    }
  }, [id, location.state]);

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCollectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // === THAY ĐỔI 2: Hàm xử lý khi chọn file MỚI ===
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // === THAY ĐỔI 3: Cập nhật logic handleSubmit ===
  // Trong file EditCollection.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Đưa text data vào Query Params
      const params = new URLSearchParams();
      params.append("name", collectionData.name);
      params.append("description", collectionData.description || "");

      // 2. Đưa file MỚI (nếu có) vào FormData
      const formData = new FormData();
      if (imageFile) {
        
        // ================== SỬA LỖI Ở ĐÂY ==================
        // Key name phải là "imageFile" (theo Swagger của bạn)
        formData.append("imageFile", imageFile); 
        // ===================================================
        
      }
      
      // 3. Gửi request
      await axiosClient.put(
        `/collection/update-collection/${id}?${params.toString()}`,
        formData
      );

      alert("Cập nhật bộ sưu tập thành công!");
      navigate("/collections");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      // ... (phần còn lại của catch block giữ nguyên) ...
       setError("Cập nhật thất bại. Vui lòng thử lại.");
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
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
          <h2 className="text-lg font-semibold">Chỉnh Sửa Bộ Sưu Tập</h2>
          <p className="text-sm text-blue-100">ID: {id}</p>
        </div>
        <button
          onClick={() => navigate("/collections")}
          className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Tên Bộ Sưu Tập */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên Bộ Sưu Tập
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={collectionData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* === THAY ĐỔI 4: Hiển thị ảnh cũ VÀ cho phép upload ảnh mới === */}
            <div>
              <label
                htmlFor="imageFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hình ảnh
              </label>
              
              {/* Hiển thị ảnh hiện tại */}
              {collectionData.imageUrl && !imageFile && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Hình ảnh hiện tại:</p>
                  <img
                    src={collectionData.imageUrl}
                    alt={collectionData.name}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Vùng upload file mới */}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imageFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>{imageFile ? "Thay đổi file" : "Upload file mới"}</span>
                      <input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">
                      {imageFile ? "" : "để thay thế ảnh cũ"}
                    </p>
                  </div>
                  {imageFile ? (
                    <p className="text-sm font-semibold text-green-600 pt-2">
                      Đã chọn: {imageFile.name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Để trống nếu không muốn thay đổi
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={collectionData.description || ""} // Đảm bảo không phải là null
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>

          {/* Nút Submit và Lỗi */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex-1">
              {error && (
                <p className="text-red-500 text-sm mb-4 sm:mb-0">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}