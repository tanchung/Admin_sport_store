import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function Orders() {
  const navigate = useNavigate();

  // --- STATE CHO DỮ LIỆU VÀ API ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE CHO PHÂN TRANG ---
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // --- STATE CHO BỘ LỌC/TÌM KIẾM ---
  const [search, setSearch] = useState(""); // Dùng cho ID
  const [status, setStatus] = useState(""); // Dùng cho dropdown
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortDir, setSortDir] = useState("asc"); // State cho sắp xếp

  // --- HÀM GỌI API (TẢI DANH SÁCH VÀ TÌM KIẾM) ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = "/orders/get-orders";
      const params = new URLSearchParams({
        pageNumber,
        pageSize,
        sortDir: sortDir,
        sortBy: "id",
      });

      // Kiểm tra xem có bất kỳ bộ lọc nào được áp dụng không
      const hasFilters = search || status || startDate || endDate;

      if (hasFilters) {
        // Nếu có, chuyển sang API search-orders
        endpoint = "/orders/search-orders";

        if (search) params.append("id", search);
        if (status) params.append("status", status);
        if (startDate) params.append("startDay", startDate);
        if (endDate) params.append("endDay", endDate);
      }

      const res = await axiosClient.get(`${endpoint}?${params.toString()}`);
      console.log("API Response:", res.data);

      const ordersData = res.data?.result?.content;
      const totalPagesData = res.data?.result?.page?.totalPages;

      if (ordersData) {
        setOrders(ordersData);
        setTotalPages(totalPagesData || 1);
      } else {
        setOrders([]);
        setTotalPages(1);
        setError("Không tìm thấy dữ liệu đơn hàng.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng.");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, status, startDate, endDate, sortDir]);

  // --- Reset trang về 0 khi bộ lọc thay đổi ---
  useEffect(() => {
    if (pageNumber !== 0) {
      setPageNumber(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, startDate, endDate, sortDir]);

  // --- Tự động gọi API khi các state phụ thuộc thay đổi ---
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // fetchOrders đã chứa tất cả dependencies

  // --- HÀM XỬ LÝ PHÂN TRANG ---
  const handlePrev = () => pageNumber > 0 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages - 1 && setPageNumber(pageNumber + 1);

  // --- HÀM XỬ LÝ SẮP XẾP ---
  const handleSortToggle = () => {
    setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
  };

  // --- HÀM ĐỊNH DẠNG TRẠNG THÁI (Helper) ---
  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-700";
      case "CONFIRMED":
        return "bg-yellow-100 text-yellow-700";
      case "SHIPPING":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
      case "CANCEL_REQUESTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ================== THAY ĐỔI 1: BẮT ĐẦU ==================
  // Hàm mới để xử lý thông tin thanh toán, trả về cả text và class
  const getPaymentStatusInfo = (status) => {
    if (status === "PAID") {
      return {
        text: "Đã thanh toán",
        className: "bg-green-100 text-green-700",
      };
    }
    // Mặc định cho tất cả các trường hợp khác (PENDING, null, undefined)
    return {
      text: "Chưa thanh toán",
      className: "bg-yellow-100 text-yellow-700",
    };
  };
  // ================== THAY ĐỔI 1: KẾT THÚC ==================

  return (
    <div className="flex-1 p-6 bg-[#F5F7FB] text-gray-800 min-h-screen">
      <UserProfileButton />
      {/* Header */}
      <div className="bg-white shadow-md rounded-2xl p-5 mb-5">
        <h2 className="text-2xl font-semibold text-gray-700">
          Quản lý đơn hàng
        </h2>
        <p className="text-sm text-gray-500">Theo dõi và quản lý đơn hàng</p>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <select
            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-300"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="CANCEL_REQUESTED">Yêu cầu hủy</option>
          </select>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-center border rounded-lg overflow-hidden">
            <input
              type="number"
              className="px-3 py-2 text-sm outline-none w-60"
              placeholder="Tìm theo ID đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              min="0"
            />
            <button
              onClick={() => setPageNumber(0)} // Nút tìm kiếm sẽ trigger useEffect
              className="bg-blue-600 text-white px-4 py-2 text-sm"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Nút sắp xếp ID */}
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all focus:ring focus:ring-blue-300"
          >
            Sắp xếp ID
            {sortDir === "asc" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white shadow-md rounded-2xl p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="p-3">OrderID</th>
                  <th className="p-3">Mã đơn hàng</th>
                  <th className="p-3">Ngày đặt</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500"
                    >
                      Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const currentStatus = order.oderStatus || order.status;
                    const createdDate = new Date(
                      order.orderDate || order.createdAt
                    );

                    return (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-blue-50 cursor-pointer transition-all"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <td className="p-3 font-medium text-blue-700">
                          #{order.id}
                        </td>
                        <td className="p-3">{order.orderCode}</td>
                        <td className="p-3">
                          {createdDate.toString() === "Invalid Date"
                            ? "N/A"
                            : createdDate.toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3 text-green-600 font-semibold">
                          {order.totalAmount?.toLocaleString()}đ
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                              currentStatus
                            )}`}
                          >
                            {currentStatus || "N/A"}
                          </span>
                        </td>
                        {/* ================== THAY ĐỔI 2: BẮT ĐẦU ================== */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              getPaymentStatusInfo(order.payment?.status)
                                .className
                            }`}
                          >
                            {
                              getPaymentStatusInfo(order.payment?.status)
                                .text
                            }
                          </span>
                        </td>
                        {/* ================== THAY ĐỔI 2: KẾT THÚC ================== */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {/* Phân trang */}
            <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
              <span>
                Trang {totalPages === 0 ? 0 : pageNumber + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={pageNumber === 0}
                  className="px-3 py-1 border rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <button
                  onClick={handleNext}
                  disabled={pageNumber >= totalPages - 1}
                  className="px-3 py-1 border rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}