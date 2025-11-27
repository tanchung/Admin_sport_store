import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Edit3,
  Trash2,
  Plus,
  Search,
  X,
  Image as ImageIcon,
  DollarSign,
  Archive,
  Tag,
  Ruler,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

// --- HÀM HỖ TRỢ: Định dạng tiền tệ ---
const formatCurrency = (amount) => {
  if (typeof amount !== "number") {
    return "N/A";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function Products() {
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE CHO FILTER, SORT, VÀ PAGINATION ---
  const [page, setPage] = useState(0); // Trang hiện tại, bắt đầu từ 0
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang từ API
  const [sortDir, setSortDir] = useState("asc"); // Chiều sắp xếp
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm đã áp dụng
  const [searchInput, setSearchInput] = useState(""); // Từ khóa đang gõ trong input
  const [refetch, setRefetch] = useState(0); // State để trigger tải lại dữ liệu khi xóa

  // --- HÀM TẢI DỮ LIỆU SẢN PHẨM TỪ API (ĐÃ NÂNG CẤP) ---
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    // Xây dựng các tham số truy vấn
    const params = new URLSearchParams();

    // <<< BẮT ĐẦU SỬA LỖI >>>
    
    // Mặc định dùng API "get-products"
    let endpoint = "/products/get-products";

    // NẾU có từ khóa tìm kiếm (searchTerm), CHUYỂN sang API tìm kiếm
    if (searchTerm) {
      endpoint = "/products/product/name";
      params.set("name", searchTerm); // API tìm kiếm CHỈ dùng 'name'
    } else {
      // API lấy danh sách (không tìm kiếm) MỚI dùng phân trang/sắp xếp
      params.set("pageNumber", page.toString());
      params.set("pageSize", "10");
      params.set("sortDir", sortDir);
    }
    
    // <<< KẾT THÚC SỬA LỖI >>>

    try {
      // Dùng endpoint đã được chọn (hoặc get-products hoặc product/name)
      const res = await axiosClient.get(endpoint, { params });

      // DEBUG: In ra để kiểm tra cấu trúc API
      // console.log("API Response:", res.data);

      let apiData = [];
      let pages = 0;

      // Xử lý response từ API (có thể là res.data.result.content hoặc res.data.content)
      const result = res.data?.result;

      if (result && Array.isArray(result.content)) {
        // 1. Cấu trúc { result: { content: [...] } } (cho /get-products)
        apiData = result.content;
        // *** FIX: Đọc totalPages từ object 'page' lồng bên trong ***
        pages = result.page?.totalPages || 0;
      } else if (result && Array.isArray(result)) {
        // <<< THÊM MỚI: Xử lý response từ API /product/name (trả về mảng) >>>
        apiData = result;
        pages = 1; // API tìm kiếm không có phân trang, coi là 1 trang
      } else if (res.data && Array.isArray(res.data.content)) {
        // 2. Cấu trúc { content: [...] } (Dự phòng)
        apiData = res.data.content;
        // *** FIX: Đọc totalPages từ object 'page' lồng bên trong ***
        pages = res.data.page?.totalPages || 0;
      } else {
        // <<< SỬA LỖI: In ra JSON cụ thể để debug
        console.error(
          "CẤU TRÚC API KHÔNG NHẬN DẠNG ĐƯỢC:",
          JSON.stringify(res.data, null, 2)
        );
      }

      setProducts(apiData);
      setTotalPages(pages);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      if (err.response && err.response.status === 404) {
        // Nếu tìm kiếm mà không thấy (404)
        if (searchTerm) {
           setError(`Không tìm thấy sản phẩm với tên "${searchTerm}".`);
        } else {
           setError("Không tìm thấy sản phẩm (Lỗi 404).");
        }
        setProducts([]);
        setTotalPages(0); // Reset phân trang nếu 404
      } else if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert(
          "Bạn không có quyền truy cập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại."
        );
        setError("Bạn không có quyền truy cập.");
      } else {
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
        setProducts([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GỌI API KHI FILTERS THAY ĐỔI ---
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortDir, searchTerm, refetch]); // Tải lại khi trang, sắp xếp, tìm kiếm thay đổi

  // --- HÀM XỬ LÝ XÓA SẢN PHẨM ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await axiosClient.delete(`/products/delete/${id}`);
        alert("Xóa sản phẩm thành công!");
        // Tải lại trang hiện tại
        setRefetch((prev) => prev + 1);
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          alert("Xóa thất bại. Vui lòng thử lại.");
        }
      }
    }
  };

  // --- HÀM XỬ LÝ GỬI TÌM KIẾM ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // Reset về trang đầu khi tìm kiếm
    setSearchTerm(searchInput);
  };

  // --- HÀM XỬ LÝ XÓA TÌM KIẾM ---
  const handleClearSearch = () => {
    setSearchInput("");
    setPage(0);
    setSearchTerm("");
  };

  // --- CÁC HÀM XỬ LÝ MỚI ---
  const handleSortToggle = () => {
    setPage(0); // Reset về trang đầu
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      {/* Header */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Quản lý Sản phẩm</h2>
          <p className="text-sm text-blue-100">Quản lý kho sản phẩm</p>
        </div>
        <button
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all"
          onClick={() => navigate("/add-product")}
        >
          <Plus size={16} /> Thêm Sản phẩm
        </button>
      </div>

      {/* Ô tìm kiếm và Sắp xếp */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Nút sắp xếp */}
        <button
          onClick={handleSortToggle}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          {sortDir === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          Sắp xếp {sortDir === "asc" ? "A-Z" : "Z-A"}
          <span className="text-gray-400">(theo tên)</span>
        </button>

        {/* Form tìm kiếm */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border rounded-lg px-3 py-2 w-full sm:max-w-md relative"
        >
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            className="flex-1 outline-none text-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="ml-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <th className="p-3 align-middle w-20">Hình ảnh</th>
              <th className="p-3 align-middle">Tên Sản phẩm</th>
              <th className="p-3 align-middle">Thương hiệu</th>
              <th className="p-3 align-middle">Danh mục</th>
              <th className="p-3 align-middle">Giá</th>
              <th className="p-3 align-middle w-24">Tồn kho</th>
              <th className="p-3 w-32 text-right align-middle">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* --- XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR --- */}
            {loading && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Đang tải sản phẩm...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && products.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  {searchTerm
                    ? `Không tìm thấy sản phẩm nào với tên "${searchTerm}".`
                    : "Không tìm thấy sản phẩm nào."}
                </td>
              </tr>
            )}

            {/* --- HIỂN THỊ DỮ LIỆU TỪ STATE 'products' --- */}
            {!loading &&
              !error &&
              products.map((product, index) => (
                <tr
                  key={product.id || index}
                  className="border-b hover:bg-gray-50 transition-all align-middle"
                >
                  {/* 1. HÌNH ẢNH */}
                  <td className="p-3 align-middle">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].downloadUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://placehold.co/100x100/EEE/31343C?text=Lỗi")
                        }
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>

                  {/* 2. TÊN SẢN PHẨM */}
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Package
                        size={16}
                        className="text-indigo-600 flex-shrink-0"
                      />
                      <span
                        className="font-medium truncate"
                        title={product.name}
                      >
                        {product.name || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* 3. THƯƠNG HIỆU */}
                  <td
                    className="p-3 align-middle truncate"
                    title={product.brand}
                  >
                    {product.brand || "N/A"}
                  </td>

                  {/* 4. DANH MỤC */}
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-blue-500 flex-shrink-0" />
                      <span className="truncate" title={product.category?.name}>
                        {product.category?.name || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* 5. GIÁ */}
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <DollarSign
                        size={14}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-green-700 font-medium">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </td>

                  {/* 6. TỒN KHO */}
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Archive
                        size={14}
                        className="text-orange-500 flex-shrink-0"
                      />
                      <span
                        className={
                          product.inventory > 0
                            ? "text-gray-700"
                            : "text-red-500 font-bold"
                        }
                      >
                        {product.inventory}
                      </span>
                    </div>
                  </td>

                  {/* 7. THAO TÁC */}
                  <td className="p-3 text-right align-middle whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 h-full">
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                        onClick={() =>
                          navigate(`/edit-product-size/${product.id}`, {
                            state: { productName: product.name },
                          })
                        }
                        aria-label={`Quản lý size ${product.name}`}
                        title="Quản lý Size"
                      >
                        <Ruler size={16} />
                      </button>
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        onClick={() =>
                          navigate(`/edit-product/${product.id}`, {
                            state: product,
                          })
                        }
                        aria-label={`Sửa ${product.name}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                        onClick={() => handleDelete(product.id)}
                        aria-label={`Xóa ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Footer và Phân trang */}
        <div className="text-sm text-gray-500 mt-3 px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>
            Hiển thị {products.length} sản phẩm (Trang{" "}
            <span className="font-medium">{page + 1}</span> /{" "}
            <span className="font-medium">{totalPages || 1}</span>)
          </span>

          {/* Controls Phân trang */}
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 0 || loading}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>

            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1 || totalPages === 0 || loading}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




