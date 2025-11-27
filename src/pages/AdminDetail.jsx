import React, { useState, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  ToggleRight,
  Save,
  XCircle,
  AlertCircle,
  Phone,
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Users,
  Loader2,
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

// Hàm chuyển đổi ngày "01/01/1990" (API) sang "1990-01-01" (Form)
const convertDateToInput = (dateString) => {
  if (!dateString) return "";
  try {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Sắp xếp lại từ dd/MM/yyyy sang yyyy-MM-dd
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // Thử parse trực tiếp nếu định dạng khác
    return new Date(dateString).toISOString().split('T')[0];
  } catch (e) { // << SỬA LỖI ESLINT
    console.error("Error converting date:", e)
    return "";
  }
};

export default function AdminDetail() {
  const navigate = useNavigate();
  const { state: admin } = useLocation();

  // State kiểm tra quyền Admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // State cho API call
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- STATE FORM (Đã cập nhật đầy đủ các trường) ---
  const [formData, setFormData] = useState({
    username: admin?.username || "",
    email: admin?.email || "",
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    phone: admin?.phone || "",
    avatar: admin?.avatar || "",
    permanentAddress: admin?.permanentAddress || "",
    gender: admin?.gender || "MALE",
    dateOfBirth: convertDateToInput(admin?.dateOfBirth), // Chuyển đổi ngày
    role: admin?.roles?.some(r => r.name === "ROLE_ADMIN") ? "Admin" : "Staff", 
    status: admin?.nonLocked ? "active" : "inactive", // nonLocked: true là 'active'
    password: "", // Luôn để trống
  });

  // --- USEEFFECT KIỂM TRA QUYỀN (ĐÃ SỬA) ---
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user"); 
      if (userString) {
        const user = JSON.parse(userString);
        
        let isAdmin = user.roles?.some(role => role.name === "ROLE_ADMIN");
        if (!isAdmin) {
          isAdmin = (user.role === "ROLE_ADMIN" || user.role === "ADMIN");
        }
        setIsSuperAdmin(isAdmin);
      } else {
         setIsSuperAdmin(false);
      }
    } catch (e) { // << SỬA LỖI ESLINT
      console.error("Failed to parse user from localStorage", e);
      setIsSuperAdmin(false); 
    }
  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- HÀM LƯU THAY ĐỔI (ĐÃ IMPLEMENT API) ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Giả sử API update là /user/update-admin/{id} hoặc /user/update-staff/{id}
    // và chúng nhận cùng một cấu trúc body.
    
    // Quyết định API endpoint dựa trên vai trò
    const endpoint =
      formData.role === "Admin"
        ? `/user/update-admin/${admin.id}` 
        : `/user/update-staff/${admin.id}`;

    // Chuẩn bị payload
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      avatar: formData.avatar || null,
      permanentAddress: formData.permanentAddress || null,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
      username: formData.username,
      ...(formData.password && { password: formData.password }),
      nonLocked: formData.status === 'active', 
    };

    try {
      // Sử dụng PUT (hoặc POST/PATCH tùy theo API của bạn)
      await axiosClient.put(endpoint, payload); 
      alert("Cập nhật tài khoản thành công!");
      navigate("/admin-management"); // Quay lại trang danh sách
    } catch (err) {
      console.error(`Lỗi khi cập nhật:`, err);
      const errMsg =
        err.response?.data?.message ||
        "Không thể cập nhật tài khoản. Vui lòng kiểm tra lại thông tin.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Render fallback nếu không có admin ---
  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Không có dữ liệu người dùng.{" "}
        <button
          className="ml-2 text-blue-600 underline"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-8 text-gray-800">
      {/* Header */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Chỉnh sửa thông tin người dùng
            </h2>
            <p className="text-sm text-blue-100">
              Cập nhật thông tin người dùng #{admin.id}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-md p-8"
      >
        
        {/* Thêm thông báo khóa */}
        {!isSuperAdmin && (
           <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm mb-6 flex items-center gap-3">
             <AlertCircle size={20} className="text-yellow-600" />
             <div>
               <h4 className="font-semibold">Chế độ chỉ xem</h4>
               <p className="text-sm">Bạn không có quyền Admin để chỉnh sửa thông tin này.</p>
             </div>
           </div>
        )}

        {/* --- FORM ĐÃ CẬP NHẬT ĐẦY ĐỦ --- */}
        
        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-600" /> Thông tin tài khoản
        </h3>
        {/* Username + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">Tên đăng nhập</label>
            <input
              type="text" name="username" value={formData.username} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Mật khẩu mới</label>
          <input
            type="password" name="password" placeholder="Để trống nếu không thay đổi" value={formData.password} onChange={handleChange}
            disabled={!isSuperAdmin}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-600" /> Thông tin cá nhân
        </h3>
        {/* Tên + Họ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">Tên</label>
            <input
              type="text" name="firstName" value={formData.firstName} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Họ</label>
            <input
              type="text" name="lastName" value={formData.lastName} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        {/* SĐT + Ngày sinh + Giới tính */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="text-sm text-gray-600">Số điện thoại</label>
            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
           <div>
            <label className="text-sm text-gray-600">Ngày sinh</label>
            <input
              type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Giới tính</label>
             <select
              name="gender" value={formData.gender} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <label className="text-sm text-gray-600">Địa chỉ</label>
            <input
              type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Link ảnh đại diện</label>
            <input
              type="text" name="avatar" value={formData.avatar} onChange={handleChange}
              disabled={!isSuperAdmin}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        {/* Role & Status */}
        <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" /> Vai trò và trạng thái
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-sm text-gray-600">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={true} // Vai trò không nên thay đổi ở trang chi tiết
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option>Admin</option>
              <option>Staff</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Trạng thái (Khóa/Mở)</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isSuperAdmin} // << THÊM DISABLED
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="active">Hoạt động (Đã kích hoạt)</option>
              <option value="inactive">Không hoạt động (Đã khóa)</option>
            </select>
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
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            <XCircle size={16} /> Hủy
          </button>
          <button
            type="submit"
            disabled={!isSuperAdmin || loading} // << THÊM DISABLED
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isSuperAdmin ? "Bạn không có quyền lưu" : "Lưu thay đổi"}
          >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Save size={16} />
            )}
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}