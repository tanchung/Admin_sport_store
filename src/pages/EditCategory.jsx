import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Archive } from "lucide-react"; 
import axiosClient from "../api/axiosClient";
import UserProfileButton from "../components/UserProfileButton";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation(); 
  
  // State cho dữ liệu form
  const [categoryData, setCategoryData] = useState({
    name: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tải dữ liệu category nếu không được truyền qua state
  useEffect(() => {
    if (location.state) {
      // 1. Dùng dữ liệu từ state (nhanh hơn)
      setCategoryData(location.state);
    } else {
      // 2. Nếu F5 trang, gọi API để lấy dữ liệu
      const fetchCategoryById = async () => {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/category/get-by-id/${id}`);
          let data = res.data.result || res.data;
          if (data && typeof data === 'object') {
            setCategoryData(data);
          } else {
             setError("Không tìm thấy dữ liệu danh mục.");
          }
        } catch (err) {
          console.error("Lỗi khi tải danh mục:", err);
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      };
      fetchCategoryById();
    }
  }, [id, location.state]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Payload chỉ có name theo API documentation
    const payload = {
      name: categoryData.name.trim(),
    };

    console.log("📤 Sending payload:", payload);

    try {
      const response = await axiosClient.put(`/category/update/${id}`, payload);
      console.log("✅ Update response:", response.data);
      alert("Cập nhật danh mục thành công!");
      navigate("/categorys");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      console.error("❌ Response data:", err.response?.data);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // Let axiosClient interceptor handle logout/redirect; just set local error
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(`Cập nhật thất bại: ${err.response?.data?.message || err.message}`);
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
          <h2 className="text-lg font-semibold">Chỉnh Sửa Danh mục</h2>
          <p className="text-sm text-blue-100">ID: {id}</p>
        </div>
        <button
          onClick={() => navigate("/categorys")}
          className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            
            {/* Tên Danh mục */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên Danh mục</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={categoryData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            
          </div>

          {/* Nút Submit và Lỗi */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex-1">
              {error && <p className="text-red-500 text-sm mb-4 sm:mb-0">{error}</p>}
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



