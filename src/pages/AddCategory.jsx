import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Folder, Save, XCircle } from "lucide-react";
import UserProfileButton from "../components/UserProfileButton.jsx";
import axiosClient from "../api/axiosClient.js";

export default function AddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form reload
    if (!name) {
      alert("Vui lòng nhập tên danh mục.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axiosClient.post("/category/create", { name: name }, {
        headers: { "x-no-redirect": "1" }
      });
      alert("Tạo danh mục thành công!");
      navigate("/categorys"); 
    } catch (err) {
      console.error("Lỗi khi tạo danh mục:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.");
      } else {
        setError("Đã xảy ra lỗi khi tạo danh mục.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      {/* ===== HEADER ===== */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Thêm Danh mục mới</h2>
          <p className="text-sm text-blue-100">Tạo một danh mục sản phẩm mới</p>
        </div>
        <button
          onClick={() => navigate("/categorys")}
          className="flex items-center gap-2 text-sm bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-indigo-50 transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* ===== FORM THÊM MỚI ===== */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        {/* Tên danh mục */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Folder size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full outline-none text-sm"
              placeholder="Nhập tên danh mục..."
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {error && (
            <div className="flex-1 text-red-500 text-sm mr-4">{error}</div>
          )}
          <button
            type="button"
            onClick={() => navigate("/categorys")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition text-sm"
          >
            <XCircle size={16} /> Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm disabled:opacity-50"
          >
            <Save size={16} /> {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
