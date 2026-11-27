import ProductRow from "./ProductRow.jsx";

/** Hiển thị bảng sản phẩm gồm 7 cột và dùng ProductRow cho từng dòng. */
export default function ProductTable({
  products = [],
  categoryMap,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="table align-middle mb-0" data-testid="product-table">
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">SKU</th>
              <th scope="col">Danh mục</th>
              <th scope="col">Giá</th>
              <th scope="col">Tồn kho</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                categoryMap={categoryMap}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
