import { categoryNames } from "../data/sample.js";
export default function ProductRow({ product }) {
  const categoryName = categoryNames[product.category] || product.category;
  const status = product.status === "active" ? "Đang bán" : "Ngừng bán";
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.sku}</td>
      <td>{categoryName}</td>
      <td>{product.price.toLocaleString("vi-VN")} ₫</td>
      <td>{product.stock}</td>
      <td>{status}</td>
      <td style={{ display: "flex", gap: "10px" }}>
        <button
          className="btn btn-outline-secondary btm-sm"
          type="button"
          onClick={() => onEdit && onEdit(product)}
        >
          Sửa
        </button>
        <button
          className="btn btn-outline-danger btm-sm"
          type="button"
          onClick={() => onDelete && onDelete(product.id)}
        >
          Xoá
        </button>
      </td>
    </tr>
  );
}
