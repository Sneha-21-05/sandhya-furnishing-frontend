import React, { useEffect, useState } from "react";
import api from "../api";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data.products || []);
    });
  }, []);

  return (
    <table>
      <tbody>
        {products.map((p) => (
          <tr key={p._id}>
            <td>
              {p.images?.[0] && (
                <img src={`https://sandhya-furnishing-backend.onrender.com${p.images[0]}`} width="60" />
              )}
            </td>
            <td>{p.name}</td>
            <td>{p.category?.name}</td>
            <td>{p.type?.type_name}</td>
            <td>₹{p.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Products;
