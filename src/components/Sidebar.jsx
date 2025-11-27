import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {Home, ShoppingBag, Users, User, Shield, Package, Ticket, ChevronDown, Archive,} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const menu = [
    { name: "Trang chủ", path: "/home", icon: <Home size={18} /> },
    { name: "Đơn hàng", path: "/orders", icon: <ShoppingBag size={18} /> },
    {
      name: "Quản lý tài khoản",
      icon: <Users size={18} />,
      children: [
        { name: "Khách hàng", path: "/users", icon: <User size={16} /> },
        { name: "Quản trị viên", path: "/admins", icon: <Shield size={16} /> },
      ],
    },
    {
      name: "Quản lý sản phẩm",
      icon: <Users size={18} />,
      children: [
        { name: "Sản phẩm", path: "/products", icon: <Package size={16} /> },
        { name: "Danh mục", path: "/categorys", icon: <Archive size={16} /> },
        { name: "Bộ sưu tập", path: "/collections", icon: <Archive size={16} />},
      ],
    },
    { name: "Voucher", path: "/voucher", icon: <Ticket size={18} /> },
  ];

   return (
    <div className="h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl">
      <div className="text-2xl font-bold px-6 py-5 border-b border-slate-700 text-center tracking-wide">
        TMDT
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                {/* Nút chính */}
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 
                    ${
                      openMenu === item.name
                        ? "bg-gradient-to-r from-cyan-600/40 to-blue-700/30 text-white shadow-lg"
                        : "bg-slate-700/40 hover:bg-slate-700/70 text-gray-300"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openMenu === item.name ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {/* Menu con */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openMenu === item.name ? "max-h-40 mt-1" : "max-h-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`flex items-center px-5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === child.path
                          ? "bg-cyan-600/40 text-white shadow-inner"
                          : "text-gray-400 hover:bg-slate-700 hover:text-cyan-300"
                      }`}
                    >
                      <span className="mr-2">{child.icon}</span>
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-cyan-600/40 to-blue-700/30 text-white shadow-lg"
                    : "bg-slate-700/40 text-gray-300 hover:bg-slate-700/70"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;