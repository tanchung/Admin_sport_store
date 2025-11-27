import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X, // Thêm icon X
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import UserProfileButton from "../components/UserProfileButton";

export default function Voucher() {
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(10);
  const [sortDir, setSortDir] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // Tách hàm gọi API (nhận searchTerm làm tham số)
  const fetchVouchers = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null); 
      let content = [];
      let totalPagesData = 1;

      if (searchTerm && searchTerm.trim() !== "") {
        try {
          // ================== SỬA API CALL THEO YÊU CẦU ==================
          // Gọi API với {code} trong URL VÀ ?code=... trong params
          const res = await axiosClient.get(
            `/voucher/findByCode/{code}`, // 1. Phần URL cố định
            { params: { code: searchTerm.trim() } } // 2. Thêm ?code=...
          );
          // =============================================================

          if (res.data?.result) {
            content = [res.data.result]; // API này trả về 1 object trong 'result'
            totalPagesData = 1;
          } else {
            content = [];
            totalPagesData = 0;
          }
        } catch (err) {
          console.warn("❌ Không tìm thấy voucher theo mã:", err);
          if (err.response?.status === 404) {
             setVouchers([]);
          } else if (err.response?.status === 401 || err.response?.status === 403) {
             setError("Bạn không có quyền tìm kiếm voucher này.");
          }
          content = [];
          totalPagesData = 0;
        }
      } else {
        // Không có search thì lấy danh sách phân trang
        const params = new URLSearchParams({
          pageNumber,
          pageSize,
          sortDir,
        });

        const res = await axiosClient.get(`/voucher/getAll?${params.toString()}`);
        content = res.data?.result?.content || [];
        totalPagesData = res.data?.result?.page?.totalPages || 1;
      }

      setVouchers(content);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error("❌ Lỗi tải voucher:", error);
      // Xử lý lỗi 401/403 (không văng ra)
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Bạn không có quyền xem voucher. Vui lòng liên hệ quản trị viên.");
      } else if (error.code !== "ERR_CANCELED") { 
        setError("Không thể tải danh sách voucher.");
      }
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, sortDir]); // Đã xóa [search]

  // Tải dữ liệu ban đầu (và khi phân trang/sort)
  useEffect(() => {
    // Chỉ tải khi không có tìm kiếm
    if (search.trim() === "") {
        fetchVouchers(null);
    }
  }, [fetchVouchers, pageNumber, pageSize, sortDir, search]);

  // 🗑 Xóa voucher
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa voucher này không?")) {
      try {
        await axiosClient.delete(`/voucher/delete/${id}`);
        fetchVouchers(search.trim() !== "" ? search : null); // Tải lại danh sách
      } catch (err) {
        console.error("❌ Lỗi khi xóa:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Bạn không có quyền xóa voucher này.");
        } else {
          alert("Xóa voucher thất bại!");
        }
      }
    }
  };
  
  // 🧭 Reset page khi tìm kiếm hoặc đổi thứ tự
  useEffect(() => {
    if (pageNumber !== 0) setPageNumber(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortDir]);

  // Hàm xử lý khi bấm nút "Tìm"
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(0); // Reset về trang 1
    fetchVouchers(search); // Gọi API với từ khóa tìm kiếm
  };

  // Hàm xử lý khi bấm nút "X"
  const handleClearSearch = () => {
    setSearch("");
    setPageNumber(0); // Reset về trang 1
    // fetchVouchers(null) sẽ tự động được gọi bởi useEffect ở trên
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6">
      <UserProfileButton />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Quản lý Voucher</h2>
          <p className="text-sm text-blue-100">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>
        <button
          onClick={() => navigate("/edit-voucher")}
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50"
        >
          <Plus size={16} /> Thêm Voucher
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="ml-4 text-xl text-gray-600">Đang tải voucher...</p>
        </div>
      )}

      {/* Lỗi */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="p-6 bg-red-100 text-red-800 rounded-lg shadow-md max-w-lg text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle size={48} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Nội dung chính (chỉ hiển thị khi không lỗi và không loading) */}
      {!loading && !error && (
        <>
          {/* Bộ lọc với nút tìm kiếm */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow mb-4 justify-between">
            <form onSubmit={handleSearchSubmit} className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-full max-w-md relative">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm mã voucher..."
                className="flex-1 outline-none text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button" 
                  onClick={handleClearSearch}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
               {/* Nút tìm kiếm (GIỐNG HỆT CATEGORYS) */}
               <button
                type="submit"
                className="ml-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-all"
              >
                Tìm
              </button>
            </form>
            
            <button
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={search.trim() !== ""} // Tắt sort khi đang search
            >
              <ArrowUpDown size={16} />
              {sortDir === "asc" ? "Tăng dần" : "Giảm dần"}
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            {vouchers.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                 {search.trim() !== ""
                  ? `Không tìm thấy voucher nào với mã "${search}".`
                  : "Không có voucher nào."
                }
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Mã</th>
                    <th className="p-3">% Giảm giá / Số tiền</th>
                    <th className="p-3">Điểm yêu cầu</th>
                    <th className="p-3">Thời gian</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-gray-600">{v.id}</td>
                      <td className="p-3 text-blue-600 font-medium">
                        {v.code}
                      </td>
                      <td className="p-3">
                        {v.percentTage
                          ? `${v.discountAmount}%`
                          : `${v.discountAmount?.toLocaleString()}đ`}
                      </td>
                      <td className="p-3">{v.pointRequired ?? "-"}</td>
                      <td className="p-3">
                        {v.startDate?.slice(0, 10)} ➜ {v.endDate?.slice(0, 10)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            v.active
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {v.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button
                          onClick={() => navigate("/edit-voucher", { state: v })}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Phân trang (chỉ hiển thị nếu không search và có voucher) */}
            {search.trim() === "" && vouchers.length > 0 && (
              <div className="p-4 flex justify-between text-sm text-gray-500">
                <span>
                  Trang {totalPages === 0 ? 0 : pageNumber + 1} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pageNumber === 0}
                    onClick={() => setPageNumber(pageNumber - 1)}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} /> Trước
                  </button>
                  <button
                    disabled={pageNumber + 1 >= totalPages}
                    onClick={() => setPageNumber(pageNumber + 1)}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    Sau <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}