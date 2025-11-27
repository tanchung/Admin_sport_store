import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

export default function CreateUser() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
    permanentAddress: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    username: "",
    password: "",
  });

  // ✅ Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Submit tạo tài khoản mới
  const handleSave = async () => {
    try {
      // Validate cơ bản
      if (!user.firstName || !user.lastName || !user.email || !user.username || !user.password) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
      }

      console.log("📤 Sending user:", user);

      const payload = {
        ...user,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString() : null,
      };

      const res = await axiosClient.post("/user/create", payload);

      console.log("✅ Response:", res.data);
      alert("🎉 Tạo tài khoản thành công!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Lỗi khi tạo tài khoản:", err.response?.data || err);
      alert(
        `Đã xảy ra lỗi khi tạo tài khoản!\nChi tiết: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6">
      <UserProfileButton />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-md flex justify-between items-center">
        <h2 className="text-lg font-semibold">Thêm Tài Khoản Người Dùng</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* Họ */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ</label>
            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nhập họ"
            />
          </div>

          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nhập tên"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="VD: 0987654321"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="example@gmail.com"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium mb-1">Giới tính</label>
            <select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={user.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Địa chỉ */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Địa chỉ thường trú</label>
            <input
              type="text"
              name="permanentAddress"
              value={user.permanentAddress}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nhập địa chỉ"
            />
          </div>

          {/* Avatar */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Ảnh đại diện (URL)</label>
            <input
              type="text"
              name="avatar"
              value={user.avatar}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>

          {/* Tên đăng nhập */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700"
          >
            <Save size={16} /> Lưu Tài Khoản
          </button>
        </div>
      </div>
    </div>
  );
}
