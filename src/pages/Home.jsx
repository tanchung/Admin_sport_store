import React, { useState, useEffect } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  CartesianGrid,
  ComposedChart,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  CalendarDays,
  Calculator,
  ClipboardList,
  ArrowLeft,
  Loader2, // Thêm icon loading
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient"; //  importing axiosClient

// ======================= CÁC HÀM TIỆN ÍCH =======================

// Định dạng tiền tệ
const formatCurrency = (value) => {
  if (typeof value !== "number") return "0₫";
  return `${value.toLocaleString("vi-VN")}₫`;
};

// Lấy ngày hôm nay theo định dạng YYYY-MM-DD
const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

// Lấy ngày đầu và cuối của 1 tháng
const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Ngày 0 của tháng sau là ngày cuối của tháng này
  return { startDate, endDate };
};

// Năm hiện tại để lọc
const CURRENT_YEAR = 2025;

// Màu cho biểu đồ tròn
const PIE_COLORS = [
  "#EC4899",
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#7C3AED", // Thêm màu
  "#F97316", // Thêm màu
];

// Tên các tháng
const MONTH_NAMES = [
  "Tháng 01", "Tháng 02", "Tháng 03", "Tháng 04",
  "Tháng 05", "Tháng 06", "Tháng 07", "Tháng 08",
  "Tháng 09", "Tháng 10", "Tháng 11", "Tháng 12",
];

// ======================= CÁC COMPONENT CON (Giữ nguyên) =======================
// ... (StatCard, MonthlyRevenueChart, CumulativeRevenueChart, ProductSalesChart) ...
// Mình sẽ ẩn các component này đi cho gọn, bạn chỉ cần giữ nguyên
// chúng y như file gốc của bạn.
// ...

// Thẻ thông tin nhỏ cho phần "Thời gian thực"
const StatCard = ({ icon, title, value, note, colorClass }) => (
  <div
    className={`flex items-center p-4 bg-white rounded-lg shadow-sm ${colorClass}`}
  >
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      {note && (
        <p className="text-xs font-medium text-gray-500 mt-1">{note}</p>
      )}
    </div>
  </div>
);

// Biểu đồ Doanh thu theo tháng (Cột + Đường)
const MonthlyRevenueChart = ({ data, onBarClick }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white w-full p-6 md:p-10 rounded-2xl shadow-lg"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-700">
        DOANH THU THEO THÁNG NĂM {CURRENT_YEAR}
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(v) => `${formatCurrency(v)}`} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              height={36}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Xu hướng doanh thu"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            
            <Bar
              dataKey="revenue"
              name="Doanh thu tháng"
              fill="url(#colorRevenue)"
              radius={[10, 10, 0, 0]}
              onClick={onBarClick}
              cursor="pointer"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
};

// Biểu đồ Doanh thu tích lũy (Miền)
const CumulativeRevenueChart = ({ data }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white w-full p-6 md:p-10 rounded-2xl shadow-lg"
    >
      <h2 className="text-xl font-bold text-gray-700 mb-6">
        DOANH THU TÍCH LŨY {CURRENT_YEAR}
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(v) => `${formatCurrency(v)}`} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Area
              type="monotone"
              dataKey="total"
              name="Doanh thu tích lũy"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              fill="url(#colorCumulative)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
};

// Biểu đồ Doanh số sản phẩm (Tròn)
const ProductSalesChart = ({ monthData, onBack, loading }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-white w-full p-6 md:p-10 rounded-2xl shadow-lg"
    >
      {/* Header và Nút Back */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">
          DOANH SỐ SẢN PHẨM THÁNG {monthData.month.split(" ")[1]} {CURRENT_YEAR}
        </h2>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Quay lại biểu đồ doanh thu
        </button>
      </div>

      {loading ? (
        <div className="h-[400px] flex justify-center items-center">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="ml-4 text-gray-600">Đang tải chi tiết sản phẩm...</p>
        </div>
      ) : (
        <>
          {/* Biểu đồ tròn */}
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthData.products}
                  dataKey="price"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  fill="#8884d8"
                >
                  {monthData.products.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${formatCurrency(v)}`} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Thông tin chi tiết */}
          <div className="mt-10">
            {/* ================== THAY ĐỔI 1: SỬA TIÊU ĐỀ ================== */}
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Thông tin chi tiết (Đã giao)
            </h3>
            {/* ================== KẾT THÚC THAY ĐỔI 1 ================== */}
            <div className="space-y-3">
              <div className="bg-green-100 p-4 rounded-lg font-semibold flex justify-between text-green-800">
                <span>Tổng doanh số (từ đơn đã giao):</span>
                <span>{formatCurrency(monthData.revenue)}</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                {monthData.products.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {p.quantity}
                      </p>
                    </div>
                    <span
                      className="font-semibold text-lg"
                      style={{ color: p.color }}
                    >
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
};

// ======================= COMPONENT CHÍNH =======================
const Home = () => {
  const [view, setView] = useState("revenue"); // 'revenue' hoặc 'products'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pieLoading, setPieLoading] = useState(false);

  // State cho 4 thẻ tóm tắt
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    count: 0,
    highest: "-",
    avg: 0,
  });

  // State cho 4 thẻ thời gian thực
  const [realTimeStats, setRealTimeStats] = useState({
    online: 0,
    todayRevenue: 0,
    todayProducts: 0,
    pending: 0,
  });

  // State cho 2 biểu đồ chính
  const [chartData, setChartData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);

  // Hàm gọi API khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const today = getTodayDateString();

        // === 1. Lập lịch các API call (ĐÃ CẬP NHẬT) ===

        // Thống kê thời gian thực
        const activeUsersPromise = axiosClient.get("/user/total-active-users");

        // MỚI: API Doanh thu hôm nay (theo yêu cầu)
        const todayRevenuePromise = axiosClient.get(
          `/orders/total-revenue?startDate=${today}&endDate=${today}`
        );

        // CẬP NHẬT: Đơn hàng chờ xử lý (theo yêu cầu - cả năm 2025)
        // Dùng URL bạn cung cấp
        const pendingOrdersPromise = axiosClient.get(
          "/orders/search-orders?sortDir=desc&sortBy=id&status=PENDING&startDay=2025-01-01&endDay=2025-12-30&pageNumber=0&pageSize=10"
        );

        // CẬP NHẬT: Đơn hàng hôm nay (để lọc sản phẩm)
        // Thêm pageSize=999 để lấy TẤT CẢ đơn hàng hôm nay, không chỉ trang 1
        const todayOrdersPromise = axiosClient.get(
          `/orders/search-orders?status=DELIVERED&startDate=${today}&endDate=${today}&pageSize=999`
        );

        // Thống kê 12 tháng (Giữ nguyên)
        const monthlyRevenuePromises = MONTH_NAMES.map((_, index) => {
          const month = index + 1;
          const { startDate, endDate } = getMonthDateRange(CURRENT_YEAR, month);
          return axiosClient.get(
            `/orders/total-revenue?startDate=${startDate}&endDate=${endDate}`
          );
        });

        // === 2. Thực thi tất cả API cùng lúc (ĐÃ CẬP NHẬT) ===
        const [
          activeUsersRes,
          todayRevenueRes, // Thêm
          pendingOrdersRes,
          todayOrdersRes,
          ...monthlyRevenueResponses
        ] = await Promise.all([
          activeUsersPromise,
          todayRevenuePromise, // Thêm
          pendingOrdersPromise,
          todayOrdersPromise,
          ...monthlyRevenuePromises,
        ]);

        // === 3. Xử lý dữ liệu "Thời gian thực" (ĐÃ CẬP NHẬT) ===
        const online = activeUsersRes.data?.result || 0;

        // MỚI: Lấy doanh thu hôm nay từ API riêng
        const todayRevenue = Number(todayRevenueRes.data?.result) || 0;

        // ================== THAY ĐỔI QUAN TRỌNG (BẮT ĐẦU) ==================
        // Lấy 'totalElements' từ 'result.page.totalElements'
        // Dựa theo hình ảnh API response bạn đã cung cấp
        const pending = pendingOrdersRes.data?.result?.page?.totalElements || 0;
        // ================== THAY ĐỔI QUAN TRỌNG (KẾT THÚC) ==================

        // CẬP NHẬT: Xử lý sản phẩm bán hôm nay
        const todayOrdersRaw = todayOrdersRes.data?.result?.content || [];

        // ================== BƯỚC LỌC BẢO VỆ "HÔM NAY" (BẮT ĐẦU) ==================
        // Lọc lại thủ công, phòng trường hợp API trả về thừa dữ liệu
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayOrders = todayOrdersRaw.filter(order => {
          // Dùng 'orderDate' (đã xác nhận từ API response)
          const orderDateStr = order.orderDate;
          
          if (!orderDateStr) return false; 
          
          const orderDateTime = new Date(orderDateStr);
          return orderDateTime >= todayStart && orderDateTime <= todayEnd;
        });
        // ================== BƯỚC LỌC BẢO VỆ "HÔM NAY" (KẾT THÚC) ==================


        // Lọc các đơn hàng đã thanh toán (PAID) (Giữ nguyên logic cũ)
        const paidTodayOrders = todayOrders.filter(
          (order) => order.payment && order.payment.status === "PAID"
        );

        // Tính tổng sản phẩm từ các đơn đã thanh toán
        // Dựa trên hình 3, order.orderItems[].quantity
        const todayProducts = paidTodayOrders.reduce(
          (sum, order) =>
            sum +
            (order.orderItems || []).reduce(
              (qSum, item) => qSum + (item.quantity || 0),
              0
            ),
          0
        );

        setRealTimeStats({
          online: online,
          todayRevenue: todayRevenue, // Cập nhật
          todayProducts: todayProducts, // Cập nhật
          pending: pending, // Cập nhật
        });

        // === 4. Xử lý dữ liệu "Tháng" ===
        const monthlyData = MONTH_NAMES.map((monthName, index) => {
          const revenue = Number(monthlyRevenueResponses[index].data?.result) || 0;
          return {
            month: monthName,
            revenue: revenue,
          };
        });

        // Tính toán cho 4 thẻ tóm tắt
        const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
        const monthsWithRevenue = monthlyData.filter((d) => d.revenue > 0);
        const count = monthsWithRevenue.length;
        const avg = count > 0 ? totalRevenue / count : 0;
        
        let highestMonth = { month: "-", revenue: 0 };
        if (monthsWithRevenue.length > 0) {
            highestMonth = monthsWithRevenue.reduce((max, d) =>
                d.revenue > max.revenue ? d : max
            );
        }

        setSummaryStats({
          total: totalRevenue,
          count: count,
          highest: highestMonth.month === "-" ? "-" : highestMonth.month.split(" ")[1], // Chỉ lấy "05" -> "May"
          avg: avg,
        });

        // Tính toán cho 2 biểu đồ (thêm 'avg' cho biểu đồ cột)
        const avgForChart = count > 0 ? totalRevenue / 12 : 0; // Trung bình trên 12 tháng
        const finalChartData = monthlyData.map((d) => ({
          ...d,
          avg: avgForChart,
        }));
        setChartData(finalChartData);

        // Dữ liệu tích lũy
        const cumulative = monthlyData.map((d, i) => ({
          month: d.month,
          total: monthlyData
            .slice(0, i + 1)
            .reduce((sum, item) => sum + item.revenue, 0),
        }));
        setCumulativeData(cumulative);

      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu dashboard:", error);
        alert("Không thể tải dữ liệu dashboard. Vui lòng kiểm tra token hoặc API.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Chỉ chạy 1 lần khi mount

  // Hàm xử lý khi nhấn vào cột (Sẽ gọi API mới)
  const handleBarClick = async (data) => {
    if (!data || !data.month) return;

    try {
      setPieLoading(true);
      setView("products"); // Chuyển view ngay lập tức

      // Tìm tháng (ví dụ: "Tháng 05" -> 5)
      const monthIndex = MONTH_NAMES.indexOf(data.month) + 1;
      if (monthIndex === 0) return;

      const { startDate, endDate } = getMonthDateRange(CURRENT_YEAR, monthIndex);

      // Gọi API search-orders cho tháng đó, LỌC THEO STATUS=DELIVERED
      const res = await axiosClient.get(
        `/orders/search-orders?status=DELIVERED&startDate=${startDate}&endDate=${endDate}&pageSize=999`
      );

      const ordersRaw = res.data?.result?.content || [];

      // ================== BƯỚC LỌC BẢO VỆ (BẮT ĐẦU) ==================
      // Lọc lại thủ công, phòng trường hợp API trả về thừa dữ liệu
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0); // Đặt về 00:00:00 của ngày bắt đầu

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // Đặt về 23:59:59 của ngày kết thúc
      
      const orders = ordersRaw.filter(order => {
        // Dùng 'orderDate' (đã xác nhận từ API response)
        const orderDateStr = order.orderDate; 
        
        if (!orderDateStr) return false; // Bỏ qua nếu không có ngày
        
        const orderDateTime = new Date(orderDateStr);
        
        // Kiểm tra xem ngày của đơn hàng có nằm trong khoảng ngày của tháng đã chọn không
        return orderDateTime >= startDateTime && orderDateTime <= endDateTime;
      });
      // ================== BƯỚC LỌC BẢO VỆ (KẾT THÚC) ==================


      // Xử lý tổng hợp sản phẩm (logic phức tạp)
      const productMap = new Map();
      
      // Dùng 'orders' (đã được lọc thủ công) thay vì 'ordersRaw'
      for (const order of orders) { 
        if (!order.orderItems) continue;
        for (const item of order.orderItems) {
          const name = item.productName || "Sản phẩm không tên";
          const price = (item.price || 0) * (item.quantity || 0); // Doanh thu từ item này
          const quantity = item.quantity || 0;

          if (productMap.has(name)) {
            const existing = productMap.get(name);
            existing.price += price; // 'price' ở đây là tổng doanh thu
            existing.quantity += quantity;
          } else {
            productMap.set(name, {
              name: name,
              price: price, // 'price' là tổng doanh thu
              quantity: quantity,
            });
          }
        }
      }

      // Gán màu và chuyển thành mảng
      const aggregatedProducts = Array.from(productMap.values()).map(
        (prod, index) => ({
          ...prod,
          color: PIE_COLORS[index % PIE_COLORS.length],
        })
      );
      
      // Sắp xếp từ cao đến thấp
      aggregatedProducts.sort((a, b) => b.price - a.price);

      // Tính tổng doanh thu từ các sản phẩm đã lọc (chỉ DELIVERED)
      const filteredTotalRevenue = aggregatedProducts.reduce((sum, prod) => sum + prod.price, 0);

      setSelectedMonth({
        month: data.month,
        // CẬP NHẬT: Dùng tổng doanh thu vừa tính từ các đơn DELIVERED
        revenue: filteredTotalRevenue, 
        products: aggregatedProducts, // Dữ liệu vừa tổng hợp
      });

    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết sản phẩm:", error);
      alert("Không thể tải chi tiết sản phẩm cho tháng này.");
      setView("revenue"); // Trả lại view cũ nếu lỗi
    } finally {
      setPieLoading(false);
    }
  };

  // Hàm xử lý khi nhấn nút quay lại
  const handleBackClick = () => {
    setView("revenue");
    setSelectedMonth(null);
  };

  // Hiển thị loading toàn trang
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="ml-4 text-xl text-gray-600">Đang tải dữ liệu Dashboard...</p>
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto bg-gray-50 min-h-screen">
      <UserProfileButton />

      {/* ==== DASHBOARD SUMMARY (Dữ liệu thật) ==== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          {
            icon: <DollarSign size={24} />,
            color: "bg-blue-500",
            title: `Tổng doanh thu năm ${CURRENT_YEAR}`,
            value: formatCurrency(summaryStats.total),
          },
          {
            icon: <CalendarDays size={24} />,
            color: "bg-green-500",
            title: "Tháng có doanh thu",
            value: summaryStats.count.toString(),
          },
          {
            icon: <TrendingUp size={24} />,
            color: "bg-purple-500",
            title: "Tháng doanh thu cao nhất",
            value: summaryStats.highest === "-" ? "-" : `Tháng ${summaryStats.highest}`,
          },
          {
            icon: <Calculator size={24} />,
            color: "bg-pink-500",
            title: "Doanh thu trung bình/tháng",
            value: formatCurrency(summaryStats.avg),
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`${item.color} text-white p-5 rounded-xl shadow-lg flex items-center`}
          >
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              {item.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold opacity-90">
                {item.title}
              </h3>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ==== THỐNG KÊ THỜI GIAN THỰC (Dữ liệu thật) ==== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white w-full p-6 md:p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Thống kê thời gian thực
        </h2>
        <p className="text-sm text-gray-500 mb-6">Cập nhật khi tải trang</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            icon={<Users size={20} />}
            title="Khách hàng online"
            value={realTimeStats.online.toString()}
            note="Đang hoạt động"
            colorClass="text-purple-600 bg-purple-100"
          />
          <StatCard
            icon={<DollarSign size={20} />}
            title="Doanh thu hôm nay"
            value={formatCurrency(realTimeStats.todayRevenue)}
            note="Hôm nay"
            colorClass="text-green-600 bg-green-100"
          />
          <StatCard
            icon={<Package size={20} />}
            title="Sản phẩm bán hôm nay"
            value={realTimeStats.todayProducts.toString()}
            note="Đã bán (đã thanh toán)" // Cập nhật ghi chú cho rõ
            colorClass="text-yellow-600 bg-yellow-100"
          />
          <StatCard
            icon={<ClipboardList size={20} />}
            title="Đơn hàng chờ xử lý"
            value={realTimeStats.pending.toString()}
            note="Trong năm 2025" // Cập nhật ghi chú cho rõ
            colorClass="text-red-600 bg-red-100"
          />
        </div>
      </motion.section>

      {/* ==== KHU VỰC BIỂU ĐỒ (Chuyển đổi giữa các view) ==== */}
      <div className="space-y-8">
        {view === "revenue" ? (
          <>
            {/* Biểu đồ Doanh thu tháng (Cột + Đường) */}
            <MonthlyRevenueChart data={chartData} onBarClick={handleBarClick} />

            {/* Biểu đồ Tích lũy */}
            <CumulativeRevenueChart data={cumulativeData} />
          </>
        ) : (
          selectedMonth && (
            /* Biểu đồ Chi tiết Sản phẩm (Tròn) */
            <ProductSalesChart
              monthData={selectedMonth}
              onBack={handleBackClick}
              loading={pieLoading}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Home;