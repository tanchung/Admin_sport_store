import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient"; // ✅ Kiểm tra đường dẫn thật có file này

export default function EditVoucher() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Dữ liệu ban đầu (chuẩn hóa field)
  const [voucher, setVoucher] = useState(() => {
    const data = location.state || {};
    return {
      id: data.id || null,
      code: data.code || "",
      discountAmount: data.discountAmount ?? 0,
      percentTag: data.percentTag ?? data.percentTage ?? true, // fix typo percentTage
      usageLimit: data.usageLimit ?? 0,
      usedCount: data.usedCount ?? 0,
      startDate: data.startDate ? data.startDate.slice(0, 10) : "",
      endDate: data.endDate ? data.endDate.slice(0, 10) : "",
      active: data.active ?? true,
      minOrderAmount: data.minOrderAmount ?? 0,
      maxDiscountAmount: data.maxDiscountAmount ?? 0,
      pointRequired: data.pointRequired ?? 0,
    };
  });

  // ✅ Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVoucher((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  // ✅ Lưu voucher (POST hoặc PUT)
  const handleSave = async () => {
    try {
      console.log("📤 Sending voucher:", voucher);

      // Kiểm tra dữ liệu bắt buộc
      if (!voucher.code || !voucher.startDate || !voucher.endDate) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin Voucher!");
        return;
      }

      // Định dạng dữ liệu gửi (backend thường yêu cầu yyyy-MM-dd)
      const payload = {
        code: voucher.code,
        discountAmount: Number(voucher.discountAmount),
        percentTage: Boolean(voucher.percentTag), // ✅ Backend expects 'percentTage' not 'percentTag'
        usageLimit: Number(voucher.usageLimit),
        usedCount: Number(voucher.usedCount),
        startDate: new Date(voucher.startDate).toISOString(),
        endDate: new Date(voucher.endDate).toISOString(),
        active: Boolean(voucher.active),
        minOrderAmount: Number(voucher.minOrderAmount),
        maxDiscountAmount: Number(voucher.maxDiscountAmount),
        pointRequired: Number(voucher.pointRequired),
      };

      console.log("📤 Final payload:", payload);

      let res;
      if (voucher.id) {
        res = await axiosClient.put(`/voucher/update/${voucher.id}`, payload);
      } else {
        res = await axiosClient.post(`/voucher/create`, payload);
      }

      console.log("✅ Response:", res.data);
      alert("🎉 Lưu Voucher thành công!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Lỗi khi lưu voucher:", err.response?.data || err);
      alert(
        `Đã xảy ra lỗi khi lưu voucher!\nChi tiết: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // ✅ Đơn vị hiển thị cho discount
  const getDiscountSuffix = () => (voucher.percentTag ? "%" : "₫");

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6">
      <UserProfileButton />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-md flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {voucher.id ? "Chỉnh sửa Voucher" : "Thêm Voucher"}
        </h2>
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
          {/* Mã Voucher */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã Voucher</label>
            <input
              type="text"
              name="code"
              value={voucher.code}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Giá trị giảm */}
          <div>
            <label className="block text-sm font-medium mb-1 flex justify-between">
              <span>Giá trị giảm</span>
              <span className="text-xs text-gray-500">
                {voucher.percentTag ? "Theo phần trăm" : "Theo số tiền"}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="discountAmount"
                value={voucher.discountAmount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {getDiscountSuffix()}
              </span>
            </div>
          </div>

          {/* Giới hạn sử dụng */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giới hạn sử dụng
            </label>
            <input
              type="number"
              name="usageLimit"
              value={voucher.usageLimit}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Đã sử dụng */}
          <div>
            <label className="block text-sm font-medium mb-1">Đã sử dụng</label>
            <input
              type="number"
              name="usedCount"
              value={voucher.usedCount}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Điểm yêu cầu */}
          <div>
            <label className="block text-sm font-medium mb-1">Điểm yêu cầu</label>
            <input
              type="number"
              name="pointRequired"
              value={voucher.pointRequired}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Giá trị đơn hàng tối thiểu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá trị đơn tối thiểu
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={voucher.minOrderAmount}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Giảm tối đa */}
          <div>
            <label className="block text-sm font-medium mb-1">Giảm tối đa</label>
            <input
              type="number"
              name="maxDiscountAmount"
              value={voucher.maxDiscountAmount}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              value={voucher.startDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              name="endDate"
              value={voucher.endDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-6 mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="percentTag"
              checked={voucher.percentTag}
              onChange={handleChange}
            />
            <span className="text-sm">Giảm theo phần trăm</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={voucher.active}
              onChange={handleChange}
            />
            <span className="text-sm">Đang hoạt động</span>
          </label>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700"
          >
            <Save size={16} /> Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
}
