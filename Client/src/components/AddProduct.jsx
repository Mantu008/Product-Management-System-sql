import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

const AddProducts = () => {
  const navigate = useNavigate();
  const nameRef = useRef();
  const productCodeRef = useRef();
  const hsnRef = useRef();
  const selesPriceRef = useRef();
  const purchasePriceRef = useRef();
  const [error, setError] = useState({
    name: false,
    productCode: false,
    hsn: false,
    selesPrice: false,
    purchasePrice: false,
  });

  const handleAddProduct = async () => {
    const name = nameRef.current.value.trim();
    const productCode = productCodeRef.current.value.trim();
    const hsn = hsnRef.current.value.trim();
    const selesPrice = selesPriceRef.current.value.trim();
    const purchasePrice = purchasePriceRef.current.value.trim();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = JSON.parse(localStorage.getItem("token"));

    if (!user || !token) {
      alert("User not logged in or token not found");
      return;
    }

    const newError = {
      name: !name,
      productCode: !productCode,
      hsn: !hsn,
      selesPrice: !selesPrice,
      purchasePrice: !purchasePrice,
    };

    setError(newError);

    if (Object.values(newError).some((err) => err)) {
      return; // Exit early if there's any error
    }

    try {
      const response = await fetch("http://localhost:2000/create-product", {
        method: "POST",
        body: JSON.stringify({
          username: JSON.parse(localStorage.getItem("user")).data.user.username,
          name,
          productCode,
          hsn,
          selesPrice,
          purchasePrice,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      alert("Item added successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Add Products</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          ref={nameRef}
          className={`w-full px-4 py-2 mb-3 border ${
            error.name ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          placeholder="Enter Product Name"
        />
        {error.name && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Name
          </span>
        )}
        <input
          type="text"
          ref={productCodeRef}
          className={`w-full px-4 py-2 mb-3 border ${
            error.productCode ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          placeholder="Enter Product Code"
        />
        {error.productCode && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Code
          </span>
        )}
        <input
          type="text"
          ref={hsnRef}
          className={`w-full px-4 py-2 mb-3 border ${
            error.hsn ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          placeholder="Enter Product HSN Number"
        />
        {error.hsn && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid HSN Number
          </span>
        )}
        <input
          type="text"
          ref={selesPriceRef}
          className={`w-full px-4 py-2 mb-3 border ${
            error.selesPrice ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          placeholder="Enter Product Sales Price"
        />
        {error.selesPrice && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Sales Price
          </span>
        )}
        <input
          type="text"
          ref={purchasePriceRef}
          className={`w-full px-4 py-2 mb-3 border ${
            error.purchasePrice ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          placeholder="Enter Product Purchase Price"
        />
        {error.purchasePrice && (
          <span className="text-red-500 text-sm mb-3 block">
            Enter Valid Purchase Price
          </span>
        )}
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
          onClick={handleAddProduct}
        >
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddProducts;
