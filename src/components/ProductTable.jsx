import ProductRow from "./ProductRow.jsx";

export default function ProductTable({ products = [] }) {
  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
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
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

