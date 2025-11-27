import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Save,
  XCircle,
  Loader2,
  AlertCircle,
  Phone,
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Users,
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

export default function AddAdmin() {
  const navigate = useNavigate();
  const location = useLocation(); 

  // const [isSuperAdmin, setIsSuperAdmin] = useState(false); // << XÓA BỎ STATE KHÔNG DÙNG
  const [loadingCheck, setLoadingCheck] = useState(true); 

  // State cho form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
    permanentAddress: "",
    gender: "MALE", 
    dateOfBirth: "",
    email: "",
    username: "",
    password: "",
    role: location.state?.role || "STAFF", 
  });

  // State cho API call
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // === 1. KIỂM TRA QUYỀN TRUY CẬP TRANG (Đã sửa logic linh hoạt) ===
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        
        let isAdmin = user.roles?.some((role) => role.name === "ROLE_ADMIN");
        if (!isAdmin) {
          isAdmin = (user.role === "ROLE_ADMIN" || user.role === "ADMIN");
        }

        if (isAdmin) {
          // setIsSuperAdmin(true); // << XÓA BỎ VÌ KHÔNG DÙNG
        } else {
          alert("Bạn không có quyền truy cập trang này.");
          navigate("/admin-management");
        }
      } else {
        navigate("/login");
      }
    } catch (e) { // << SỬA LỖI ESLINT
      console.error("Failed to parse user from localStorage", e);
      navigate("/login");
    } finally {
      setLoadingCheck(false); 
    }
  }, [navigate]);

  // === 2. HÀM XỬ LÝ FORM ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // === 3. HÀM SUBMIT FORM (GỌI API) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint =
      formData.role === "ADMIN"
        ? "/user/create-admin"
        : "/user/create-staff";

    const payload = { ...formData };
    delete payload.role; 

    if (payload.avatar === "") payload.avatar = null;
    if (payload.permanentAddress === "") payload.permanentAddress = null;

    try {
      await axiosClient.post(endpoint, payload);
      alert(`Tạo tài khoản ${formData.role} thành công!`);
      navigate("/admin-management"); // Quay lại trang danh sách
    } catch (err) {
      console.error(`Lỗi khi tạo ${formData.role}:`, err);
      const errMsg =
        err.response?.data?.message ||
        "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Nếu đang kiểm tra quyền, hiển thị loading
  if (loadingCheck) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-8 text-gray-800">
      {/* Header */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Tạo tài khoản mới</h2>
            <p className="text-sm text-blue-100">
              Tạo tài khoản {formData.role === "ADMIN" ? "Admin" : "Staff"} mới
            </p>
          </div>
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-8"
      >
        {/* Lựa chọn vai trò */}
        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" /> Chọn vai trò
        </h3>
        <div className="mb-6">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={true} // Vô hiệu hóa, vì vai trò đã được chọn từ trang trước
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="STAFF">Staff (Nhân viên)</option>
            <option value="ADMIN">Admin (Quản trị viên)</option>
          </select>
        </div>

        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-600" /> Thông tin tài khoản
        </h3>

        {/* Username + Email + Password */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">
              Tên đăng nhập (Bắt buộc)
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email (Bắt buộc)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Mật khẩu (Bắt buộc)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
        </div>

        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-600" /> Thông tin cá nhân
        </h3>
        
        {/* Tên + Họ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">Tên (Bắt buộc)</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Họ (Bắt buộc)</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
        
        {/* SĐT + Ngày sinh + Giới tính */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">Số điện thoại (Bắt buộc)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
           <div>
            <label className="text-sm text-gray-600">Ngày sinh (Bắt buộc)</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Giới tính (Bắt buộc)</label>
             <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Địa chỉ + Avatar */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-sm text-gray-600">Địa chỉ (Không bắt buộc)</label>
            <input
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              placeholder="123 Đường ABC, Phường X, Quận Y..."
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Link ảnh đại diện (Không bắt buộc)</label>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/image.png"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>
        </div>

        {/* Hiển thị lỗi (nếu có) */}
        {error && (
           <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-6 flex items-center gap-2">
             <AlertCircle size={18} />
             <p>{error}</p>
           </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button" // Ngăn submit form
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
            disabled={loading} // Vô hiệu hóa khi đang tải
          >
            <XCircle size={16} /> Hủy
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            disabled={loading} // Vô hiệu hóa khi đang tải
          >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Save size={16} />
            )}
            {loading ? "Đang tạo..." : "Lưu tài khoản"}
          </button>
        </div>
      </form>
    </div>
  );
}