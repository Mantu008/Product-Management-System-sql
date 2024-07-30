import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const UpdateProducts = () => {
  const navigate = useNavigate();
  const params = useParams();
  const nameRef = useRef();
  const productCodeRef = useRef();
  const hsnRef = useRef();
  const selesPriceRef = useRef();
  const purchasePriceRef = useRef();
  const [error, setError] = useState(false);

  useEffect(() => {
    getProductDetail();
  }, [params.id]);

  const getProductDetail = async () => {
    try {
      const result = await fetch(`http://localhost:2000/product/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          username: JSON.parse(localStorage.getItem("user")).data.user.username,
        }),
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();

      nameRef.current.value = data.product.name;
      productCodeRef.current.value = data.product.productCode;
      hsnRef.current.value = data.product.hsn;
      selesPriceRef.current.value = data.product.selesPrice;
      purchasePriceRef.current.value = data.product.purchasePrice;
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleUpdateProduct = async () => {
    const name = nameRef.current.value;
    const productCode = productCodeRef.current.value;
    const hsn = hsnRef.current.value;
    const selesPrice = selesPriceRef.current.value;
    const purchasePrice = purchasePriceRef.current.value;

    if (!name || !productCode || !hsn || !selesPrice || !purchasePrice) {
      setError(true);
      return; // Exit early if there's an error
    } else {
      setError(false); // Reset error state if all fields are valid
      try {
        let result = await fetch(`http://localhost:2000/update/${params.id}`, {
          method: "PUT",
          body: JSON.stringify({
            username: JSON.parse(localStorage.getItem("user")).data.user
              .username,
            name,
            productCode,
            hsn,
            selesPrice,
            purchasePrice,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        });

        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }

        const data = await result.json();
        console.log(data);
        alert("Item updated successfully.");
        navigate("/");
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Update Products</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          ref={nameRef}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          placeholder="Enter Product Name"
        />
        {error && !nameRef.current?.value && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Name
          </span>
        )}
        <input
          type="text"
          ref={productCodeRef}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          placeholder="Enter Product Code"
        />
        {error && !productCodeRef.current?.value && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Code
          </span>
        )}
        <input
          type="text"
          ref={hsnRef}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          placeholder="Enter Product HSN Number"
        />
        {error && !hsnRef.current?.value && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid HSN Number
          </span>
        )}
        <input
          type="text"
          ref={selesPriceRef}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          placeholder="Enter Product Sales Price"
        />
        {error && !selesPriceRef.current?.value && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Sales Price
          </span>
        )}
        <input
          type="text"
          ref={purchasePriceRef}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md"
          placeholder="Enter Product Purchase Price"
        />
        {error && !purchasePriceRef.current?.value && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Purchase Price
          </span>
        )}
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
          onClick={handleUpdateProduct}
        >
          Update Product
        </button>
      </div>
    </div>
  );
};

export default UpdateProducts;
