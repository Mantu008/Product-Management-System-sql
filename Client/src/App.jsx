import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import Signup from "./components/Signup";
import Home from "./components/Home";
import AddProducts from "./components/AddProduct";
import DeleteProduct from "./components/DeleteProduct";
import UpdateProduct from "./components/UpdateProduct";
import UpdateView from "./components/UpdateView";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [isLogIn, setIsLogIn] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const route = useNavigate();

  const handleSignout = () => {
    localStorage.removeItem("user");
    alert("User LoggedOut Sucessfully....");
    setIsLogIn(false);
    setAdmin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    route("/");
  };

  return (
    <>
      {/* navBar */}
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center"></div>
                  <div className="hidden sm:ml-6 sm:block">
                    {localStorage.getItem("user") ? (
                      <div className="flex space-x-4">
                        <Link
                          to="/"
                          className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white bg-slate-500"
                        >
                          All Products
                        </Link>

                        {JSON.parse(localStorage.getItem("user")).data.user
                          .role === "admin" && (
                          <>
                            <Link
                              to="/addProduct"
                              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white bg-slate-500"
                            >
                              Add Product
                            </Link>

                            <Link
                              to="/deleteProduct"
                              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white bg-slate-500"
                            >
                              Delete Product
                            </Link>

                            <Link
                              to="/updateProduct"
                              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white bg-slate-500"
                            >
                              Update Products
                            </Link>
                          </>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                {/* Login/Signup Button */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {!localStorage.getItem("user") ? (
                    <Link
                      className="ml-3 text-white bg-blue-800 p-1 rounded-sm hover:bg-blue-900 text-md font-semibold"
                      to="/signup"
                    >
                      Login/Signup
                    </Link>
                  ) : (
                    <Menu as="div" className="relative ml-3">
                      <div className="flex flex-row gap-2 items-center justify-center">
                        <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <CgProfile
                            className="bg-white rounded-3xl"
                            size={"2.5rem"}
                          />
                        </MenuButton>
                        <p className="text-xl font-bold text-white">
                          {JSON.parse(
                            localStorage.getItem("user")
                          ).data.user.name.slice(0, 6)}
                        </p>
                      </div>
                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                      >
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={handleSignout}
                            >
                              Sign out
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>

      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem("user") ? <Home /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/signup"
          element={
            localStorage.getItem("user") ? <Navigate to="/" /> : <Signup />
          }
        />
        <Route
          path="/login"
          element={
            localStorage.getItem("user") ? <Navigate to="/" /> : <Signup />
          }
        />
        <Route
          path="/addProduct"
          element={
            localStorage.getItem("user") ? <AddProducts /> : <Navigate to="/" />
          }
        />

        <Route
          path="/deleteProduct"
          element={
            localStorage.getItem("user") ? (
              <DeleteProduct />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/updateProduct"
          element={
            localStorage.getItem("user") ? (
              <UpdateProduct />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/updateProduct/:id"
          element={
            localStorage.getItem("user") ? (
              <UpdateView />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />

        {/* Assume this signs out */}
        <Route path="*" element={<>Page Not Found</>} />
      </Routes>
    </>
  );
}
