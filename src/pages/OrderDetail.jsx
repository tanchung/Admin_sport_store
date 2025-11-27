import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

export default function OrderDetail() {
  const { orderId: paramOrderId, id: paramId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  const [orderId] = useState(paramOrderId || paramId);

  // --- STATE ---
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // --- STATE MỚI ĐỂ LẤY TÊN KHÁCH HÀNG ---
  const [customerName, setCustomerName] = useState("Đang tải...");
  const [customerPhone, setCustomerPhone] = useState("Đang tải...");

  // --- HÀM TẢI DỮ LIỆU ĐƠN HÀNG ---
  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!orderId || orderId === "undefined") {
      console.error("❌ ID đơn hàng không hợp lệ:", orderId);
      setError("ID đơn hàng không hợp lệ hoặc không được cung cấp.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosClient.get(`/orders/get-order/${orderId}`);
      console.log("Order Detail Response:", res.data);
      if (res.data?.result) {
        const result = res.data.result;
        setOrder(result);
        setSelectedStatus(
          result.oderStatus || result.orderStatus || result.status || ""
        );
      } else {
        setError("Không tìm thấy đơn hàng.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết đơn hàng:", err);
      setError("Không thể tải chi tiết đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // --- HÀM TẢI DỮ LIỆU KHÁCH HÀNG (MỚI) ---
  useEffect(() => {
    if (order && order.userId) {
      const fetchCustomerData = async () => {
        try {
          const res = await axiosClient.get(`/user/getUser/${order.userId}`);
          if (res.data?.result) {
            const customer = res.data.result;
            setCustomerName(
              `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                "Khách (Không tên)"
            );
            setCustomerPhone(customer.phone || "N/A");
          } else {
            setCustomerName("Không tìm thấy tên");
            setCustomerPhone("N/A");
          }
        } catch (err) {
          console.error("❌ Lỗi khi tải dữ liệu khách hàng:", err);
          setCustomerName("Lỗi tải tên");
          setCustomerPhone("Lỗi tải SĐT");
        }
      };
      fetchCustomerData();
    } else if (order) {
      setCustomerName("Không có User ID");
      setCustomerPhone("N/A");
    }
  }, [order]);

  // --- HÀM CẬP NHẬT TRẠNG THÁI (ADMIN TỰ ĐỔI) ---
  const handleUpdateStatus = async () => {
    try {
      const config = {
        params: {
          status: selectedStatus,
        },
      };

      await axiosClient.put(
        `/orders/update-order-status/${orderId}`, // 1. URL
        null, // 2. Data (body)
        config // 3. Config (chứa query params)
      );

      alert("Cập nhật trạng thái thành công!");
      setShowModal(false);
      fetchOrderDetail(); // Tải lại dữ liệu mới
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert(
          "Lỗi: Bạn không có quyền thực hiện hành động này. Đang đăng xuất..."
        );
      } else if (err.response && err.response.status === 404) {
        alert(
          "Cập nhật thất bại: Không tìm thấy API (Lỗi 404). Vui lòng kiểm tra lại đường dẫn API."
        );
      } else {
        alert("Cập nhật thất bại. Vui lòng thử lại.");
      }
    }
  };

  // --- CHỨC NĂNG MỚI: XÁC NHẬN HỦY ĐƠN (ADMIN ĐỒNG Ý) ---
  const handleConfirmCancel = async () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn XÁC NHẬN yêu cầu hủy đơn hàng này không?"
      )
    )
      return;

    try {
      await axiosClient.patch(`/orders/confirm-cancel-order/${orderId}`);
      alert("Xác nhận hủy đơn hàng thành công!");
      fetchOrderDetail(); // Tải lại dữ liệu mới
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận hủy:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Lỗi: Bạn không có quyền thực hiện hành động này. Đang đăng xuất...");
      } else {
        alert("Xác nhận hủy thất bại. Vui lòng thử lại.");
      }
    }
  };

  // --- Xử lý UI khi đang tải hoặc lỗi ---
  if (loading) {
    return (
      <div className="flex-1 p-6 text-center text-gray-500">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 p-6 text-center text-red-500">
        <p>{error || "Không tìm thấy dữ liệu đơn hàng."}</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // --- TÍNH TOÁN TỔNG TIỀN (Dựa trên dữ liệu API) ---
  const totalItem =
    order.orderItems?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) || 0;
  const shipFee = order.shippingFee || 20000;
  const grandTotal = totalItem + shipFee;

  const currentStatus = order.oderStatus || order.orderStatus || order.status;
  const createdDate = new Date(
    order.orderDate || order.createdAt || order.createdDate
  );

  // --- Helper functions cho thanh toán ---
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case "PAID":
        return {
          text: "Đã thanh toán",
          className: "bg-green-100 text-green-700",
        };
      case "UNPAID":
        return {
          text: "Chưa thanh toán",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "FAILED":
        return { text: "Thất bại", className: "bg-red-100 text-red-700" };
      default:
        return { text: status || "N/A", className: "bg-gray-100 text-gray-700" };
    }
  };

  const getPaymentMethodText = (method) => {
    if (method === "PAYOS") return "PAYOS (Chuyển khoản)";
    if (method === "COD") return "COD (Thu hộ)";
    return method || "N/A";
  };

  return (
    <div className="flex-1 p-6 bg-[#EEF2F7] min-h-screen text-gray-800">
      <UserProfileButton />
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-700">
          🧾 Chi tiết đơn hàng {order.orderCode}
        </h1>
        <button
          onClick={() => navigate("/orders")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          ← Quay lại
        </button>
      </div>

      {/* ====== THÔNG TIN ĐƠN HÀNG ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Thông tin đơn hàng */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-sm uppercase">
            Thông tin đơn hàng
          </div>
          <div className="p-4 text-sm space-y-2">
            
            
            <div className="flex justify-between">
              <span className="font-medium">Mã đơn hàng (ID):</span>
              <span>#{order.orderCode}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Ngày đặt:</span>
              <span>
                {createdDate.toString() === "Invalid Date"
                  ? "N/A"
                  : createdDate.toLocaleString("vi-VN")}
              </span>
            </div>

            {/* === Trạng thái + nút cập nhật === */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    currentStatus === "PENDING"
                      ? "bg-blue-100 text-blue-700"
                      : currentStatus === "CONFIRMED"
                      ? "bg-yellow-100 text-yellow-700"
                      : currentStatus === "SHIPPING"
                      ? "bg-purple-100 text-purple-700"
                      : currentStatus === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : currentStatus === "CANCELLED" ||
                        currentStatus === "CANCEL_REQUESTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {currentStatus || "N/A"}
                </span>
              </div>

              {/* === HIỂN THỊ NÚT TÙY THEO TRẠNG THÁI === */}
              <div className="flex gap-2">
                {currentStatus === "CANCEL_REQUESTED" && (
                  <button
                    onClick={handleConfirmCancel}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    Xác nhận hủy
                  </button>
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm"
                >
                  Cập nhật
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Khách hàng:</span>
              <span>{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Số điện thoại:</span>
              <span>{customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tổng tiền:</span>
              <span className="text-green-600 font-semibold">
                {order.totalAmount?.toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin giao hàng */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-sm uppercase">
            Thông tin giao hàng
          </div>
          <div className="p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Địa chỉ:</span>
              <span className="text-right w-1/2">
                {order.shippingAddress || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phí giao hàng:</span>
              <span>{shipFee.toLocaleString()} đ</span>
            </div>
          </div>
        </div>
        
        {/* Thông tin thanh toán */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-sm uppercase">
            Thông tin thanh toán
          </div>

          {!order.payment ? (
            <div className="p-4 text-sm text-gray-500">
              Không có dữ liệu thanh toán cho đơn hàng này.
            </div>
          ) : (
            <div className="p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              
              <div className="flex justify-between">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    getPaymentStatusInfo(order.payment.status).className
                  }`}
                >
                  {getPaymentStatusInfo(order.payment.status).text}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Hình thức:</span>
                <span>{getPaymentMethodText(order.payment.method)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tổng tiền:</span>
                <span className="font-semibold text-green-600">
                  {order.payment.amount?.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">
                  {order.payment.amountPaid?.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Còn lại:</span>
                <span className="font-semibold text-red-600">
                  {order.payment.amountRemaining?.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Mã giao dịch:</span>
                <span>{order.payment.transactionId || "N/A"}</span>
              </div>
              
              {/* Chỉ hiển thị thông tin ngân hàng nếu là PAYOS */}
              {order.payment.method === "PAYOS" && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Ngân hàng:</span>
                    
                    <span>
                      {order.payment.counterAccountBankName === ""
                        ? "Agribank"
                        : order.payment.counterAccountBankName || "N/A"}
                    </span>
                  </div>
                   <div className="flex justify-between">
                    <span className="font-medium">Chủ tài khoản:</span>
                    <span>{order.payment.counterAccountName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Số tài khoản:</span>
                    <span>{order.payment.counterAccountNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Thời gian:</span>
                    <span>
                      {new Date(order.payment.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </>
              )}
              
            </div>
          )}
        </div>

      </div>

      {/* ====== CHI TIẾT SẢN PHẨM ====== */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-sm uppercase">
          Chi tiết đơn hàng
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b text-gray-700">
            <tr>
              <th className="p-3 text-left">Mã SP</th>
              <th className="p-3 text-left">Tên sản phẩm</th>
              <th className="p-3 text-center">Đơn giá</th>
              <th className="p-3 text-center">Số lượng</th>
              <th className="p-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          
         
          <tbody>
            {order.orderItems.map((item, i) => (
              <tr key={item.productId || i} className="border-b hover:bg-gray-50">
                <td className="p-3">SP{item.productId || "N/A"}</td>
                <td className="p-3 flex items-center gap-3">
                  
                  {item.productName || "Sản phẩm"}
                </td>
                <td className="p-3 text-center text-green-600">
                  {item.price?.toLocaleString()}đ
                </td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right font-semibold text-green-600">
                  {(item.price * item.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
          

          <tfoot className="bg-gray-50 text-sm font-medium">
            <tr>
              <td colSpan="4" className="text-right p-3">
                Tổng tiền sản phẩm:
              </td>
              <td className="p-3 text-right">{totalItem.toLocaleString()} đ</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-right p-3">
                Phí giao hàng:
              </td>
              <td className="p-3 text-right">{shipFee.toLocaleString()} đ</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-right p-3">
                Tổng cộng:
              </td>
              <td className="p-3 text-right text-green-600 font-bold">
                {grandTotal.toLocaleString()} đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ===== MODAL CẬP NHẬT TRẠNG THÁI ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[420px] rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-500 text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-semibold text-sm">
                Cập nhật trạng thái đơn hàng (Admin)
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 text-sm">
              <p className="mb-2">
                <strong>Đơn hàng:</strong>{" "}
                <span className="text-red-600">{order.orderCode}</span>
              </p>
              <p className="text-gray-500 mb-4">
                Ngày đặt:{" "}
                {createdDate.toString() === "Invalid Date"
                  ? "N/A"
                  : createdDate.toLocaleString("vi-VN")}
              </p>

              <label className="block font-medium mb-1">
                Chọn trạng thái mới
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-5"
              >
                <option value="PENDING">Chờ xác nhận (PENDING)</option>
                <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                <option value="SHIPPING">Đang giao hàng (SHIPPING)</option>
                <option value="DELIVERED">Đã giao (DELIVERED)</option>
                <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Đóng
                </button>
                <button
                  onClick={handleUpdateStatus} // Gọi hàm API
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}