import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage.jsx";
// HOAN_THIEN: dựng bố cục trang và khai báo các route theo đề (Mục 4.1, 4.2, 4.3).
// Xoá đoạn return bên dưới khi bắt đầu làm bài.
export default function App() {
  return (
    <div>
      <header className="app-header">
        <div className="app-header-title">OfficeMart Admin</div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
        </Routes>
      </main>
    </div>
  );
}
