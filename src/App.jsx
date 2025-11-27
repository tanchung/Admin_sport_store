import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";
import CreateUser from "./pages/CreateUser";
import AdminManagement from "./pages/AdminManagement";
import AdminDetail from "./pages/AdminDetail";
import AddAdmin from "./pages/AddAdmin";
import Products from "./pages/Products";
import AddProducts from "./pages/AddProduct";
import EditProducts from "./pages/EditProduct";
import EditProductSize from "./pages/EditProductSize";
import Categorys from "./pages/Categorys";
import EditCategory from "./pages/EditCategory";
import AddCategory from "./pages/AddCategory";
import Collections from "./pages/Collections";
import AddCollection from "./pages/AddCollection";
import EditCollection from "./pages/EditCollection";
import Voucher from "./pages/Voucher";
import EditVoucher from "./pages/EditVoucher";

function AppContent() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Ẩn Sidebar khi ở trang /login */}
      {!hideSidebar && <Sidebar />}

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/user-detail/:userId" element={<UserDetail />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/admins" element={<AdminManagement />} />
          <Route path="/admin-detail" element={<AdminDetail />} />
          <Route path="/add-admin" element={<AddAdmin />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProducts />} />
          <Route path="/edit-product/:id" element={<EditProducts />} />
          <Route path="/edit-product-size/:productId" element={<EditProductSize />} />
          <Route path="/categorys" element={<Categorys />} />
          <Route path="/edit-category/:id" element={<EditCategory />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/add-collection" element={<AddCollection />} />
          <Route path="/edit-collection/:id" element={<EditCollection />} />
          <Route path="/voucher" element={<Voucher />} />
          <Route path="/edit-voucher" element={<EditVoucher />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
