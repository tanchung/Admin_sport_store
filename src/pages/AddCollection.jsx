import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UploadCloud } from "lucide-react"; // Đổi icon
import axiosClient from "../api/axiosClient.js";
import UserProfileButton from "../components/UserProfileButton.jsx";

export default function AddCollection() {
  const navigate = useNavigate();

  const [collectionData, setCollectionData] = useState({
    name: "",
    description: "",
  });
  
  // === THAY ĐỔI 1: Thêm state cho file ===
  const [imageFile, setImageFile] = useState(null); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý thay đổi input (cho name và description)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCollectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // === THAY ĐỔI 2: Hàm xử lý khi chọn file ===
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // === THAY ĐỔI 3: Cập nhật logic handleSubmit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Đưa text data vào Query Params
      const params = new URLSearchParams();
      params.append("name", collectionData.name);
      params.append("description", collectionData.description);

      // 2. Đưa file vào FormData
      const formData = new FormData();
      if (imageFile) {
        // "file" là key name mà backend mong đợi. 
        // Thay đổi "file" nếu backend dùng key khác (ví dụ: "imageFile")
        formData.append("imageFile", imageFile); 
      }
      
      // 3. Gửi request
      // (Bỏ logic defaultImage, vì server sẽ tự xử lý nếu không có file)
      await axiosClient.post(
        `/collection/create-collection?${params.toString()}`,
        formData
      );

      alert("✅ Thêm bộ sưu tập thành công!");
      navigate("/collections");
    } catch (err) {
      console.error("❌ Lỗi khi thêm bộ sưu tập:", err);
      setError("Thêm thất bại. Vui lòng thử lại.");

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
          <h2 className="text-lg font-semibold">Thêm Bộ Sưu Tập Mới</h2>
          <p className="text-sm text-blue-100">Điền thông tin chi tiết</p>
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

            {/* === THAY ĐỔI 4: Đổi input thành type="file" === */}
            <div>
              <label
                htmlFor="imageFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hình ảnh (Upload)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imageFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload một file</span>
                      <input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">hoặc kéo và thả</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF lên đến 10MB
                  </p>
                  {imageFile && (
                    <p className="text-sm font-semibold text-green-600 pt-2">
                      Đã chọn file: {imageFile.name}
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
                value={collectionData.description}
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
              {loading ? "Đang lưu..." : "Lưu Bộ Sưu Tập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}