import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsLogin(!isLogin);
    if (!isLogin) {
      navigate("/login");
    } else {
      navigate("/signup");
    }
  };

  const handleSubmit = async () => {
    if (isLogin) {
      if (email && password) {
        try {
          let response = await fetch("http://localhost:2000/login", {
            method: "POST",
            body: JSON.stringify({ username: email, password: password }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            let data = await response.json();
            alert("User Logged in Successfully.");
            localStorage.setItem(
              "user",
              JSON.stringify({
                loggedIn: true,
                data,
              })
            );
            localStorage.setItem("token", JSON.stringify(data.auth));
            navigate("/");
          } else {
            alert("Invalid username or password");
          }
        } catch (error) {
          alert("Server problem");
        }
      } else {
        alert("Please enter email and password.");
        setError(true);
      }
    } else {
      if (email && password && fullName) {
        try {
          let response = await fetch("http://localhost:2000/register", {
            method: "POST",
            body: JSON.stringify({
              name: fullName,
              username: email,
              password: password,
              role: "user",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            let data = await response.json();
            alert("User registered successfully. Please log in.");
            localStorage.setItem("token", JSON.stringify(data.auth));
          } else {
            alert("Something went wrong. Please try again.");
          }
        } catch (error) {
          alert("Server problem");
        }
      } else {
        alert("Please fill out all fields.");
        setError(true);
      }
    }

    setFullName("");
    setEmail("");
    setPassword("");
    setError(false);
  };

  return (
    <div>
      <div className="flex items-center justify-center p-10 text-white">
        <div className="bg-black absolute z-10 mt-[90%] md:mt-[35%] outline-none p-[30px] w-[400px] rounded-md flex flex-col items-center justify-center gap-6 opacity-85">
          <p className="text-white text-3xl font-bold p-3">
            {isLogin ? "Login" : "Signup"}
          </p>

          {error && (
            <p className="text-red-600 text-md font-semibold">
              Fill all Input Fields
            </p>
          )}

          {!isLogin && (
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="p-3 w-[300px] border-none rounded-sm text-black text-md font-semibold"
              placeholder="Full Name"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 w-[300px] border-none rounded-sm text-black text-md font-semibold"
            placeholder="Email"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 w-[300px] border-none rounded-sm text-black text-md font-semibold"
            placeholder="Password"
          />

          <p className=" w-[299px] font-semibold text-md">
            {!isLogin ? "Already Have an Account?" : "New to Netflix?"}
            <span
              className="text-blue-500 text-[1.2rem] hover:cursor-pointer"
              onClick={handleClick}
            >
              {!isLogin ? "Login" : "Signup"}
            </span>
          </p>

          <button
            type="submit"
            className="border border-none bg-red-800 p-3 rounded-sm w-[100px] text-[1.1rem] font-semibold"
            onClick={handleSubmit}
          >
            {!isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
