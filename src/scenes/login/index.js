import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginTest.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { loginApi } from "../../api/usersApi";
import { registerApi } from "../../api/registerApi";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "./formValidation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { LoginSocialFacebook } from "reactjs-social-login";
import { FacebookLoginButton } from "react-social-login-buttons";
import { FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase.js"

const Login = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [fullNameValidation, setFullNameValidation] = useState({
    isValid: true,
    message: "",
  });
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: "",
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isValid: true,
    message: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    const addActiveClass = () => container.classList.add("active");
    const removeActiveClass = () => container.classList.remove("active");

    if (registerBtn && loginBtn) {
      registerBtn.addEventListener("click", addActiveClass);
      loginBtn.addEventListener("click", removeActiveClass);
    }

    return () => {
      if (registerBtn && loginBtn) {
        registerBtn.removeEventListener("click", addActiveClass);
        loginBtn.removeEventListener("click", removeActiveClass);
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        toast.error("Email/Password is required!");
        return;
    }

    setLoading(true);
    try {
        const res = await loginApi(email, password);
        console.log(res); // In phản hồi từ API ra console để kiểm tra

        if (res && res.token) {
            localStorage.setItem("token", res.token);

            // Decode token để lấy thông tin role
            const decodedToken = JSON.parse(atob(res.token.split('.')[1]));
            const userRole = decodedToken.role;
            localStorage.setItem("userRole", userRole);

            toast.success("Login successful!");

            // Điều hướng dựa trên vai trò của người dùng
            if (userRole === 'Admin') {
                navigate("/dashboard");
            } else if (userRole === 'Staff') {
                navigate("/staff");
            } else {
                navigate("/login");
                toast.error("Unauthorized role");
            }
        } else if (res && res.status === 401) {
            toast.error(res.error || "Unauthorized");
            setMessage("Login failed!");
            setMessageType("error");
        } else {
            toast.error("Login failed!");
            setMessage("Login failed!");
            setMessageType("error");
        }
    } catch (error) {
        console.error("Login error: ", error); // In ra chi tiết lỗi
        toast.error("Login failed!");
        setMessage("Login failed!");
        setMessageType("error");
    } finally {
        setLoading(false);
    }
};

  

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const fullNameValidation = validateFullName(fullName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(
      password,
      confirmPassword
    );
  
    setFullNameValidation(fullNameValidation);
    setEmailValidation(emailValidation);
    setPasswordValidation(passwordValidation);
    setConfirmPasswordValidation(confirmPasswordValidation);
  
    if (
      !fullNameValidation.isValid ||
      !emailValidation.isValid ||
      !passwordValidation.isValid ||
      !confirmPasswordValidation.isValid
    ) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        "https://courtcaller.azurewebsites.net/api/authentication/register",
        {
          fullName: fullName,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }
      );
      toast.success("Registration successful!");
      setMessage("SIGN UP SUCCESSFULLY - LOG IN NOW !");
      setMessageType("success");
      setIsLogin(true);  // Chuyển sang form đăng nhập
  
      // Kiểm tra và điều hướng dựa trên fullName
      if (fullName.startsWith("Staff")) {
        navigate("/login?role=staff");
      } else if (fullName.startsWith("Admin")) {
        navigate("/login?role=admin");
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Registration failed");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  const loginGoogle = async (response) => {
    var token = response.credential; // Token này là một phần của response trả về từ Google sau khi đăng nhập thành công
    console.log("Google Token:", token);

    try {
      const res = await fetch(
        "https://courtcaller.azurewebsites.net/api/authentication/google-login?token=" +
          token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // body: { token }, 
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", token);
        toast.success("Login Successfully");
        navigate("/Users");
       
      } else {
        console.error("Backend error:", data);
        toast.error("Login Failed");
        throw new Error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login Failed");
    }
  };

  
  const loginFacebook = async (response) => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
  
      // Extract the access token from Firebase's stsTokenManager
      const accessToken = result.user.stsTokenManager.accessToken;
  
      // Log the user info and token
      console.log('Login successfully', result.user);
      console.log('Access Token:', accessToken);
  
      // Send the access token to the back-end
      const res = await fetch("https://courtcaller.azurewebsites.net/api/authentication/facebook-login?token=" + accessToken, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ token: accessToken }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", accessToken);
        toast.success("Login Successfully");
        navigate("/Users");
      } else {
        console.error("Backend error:", data);
        toast.error("Login Failed");
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error('Facebook login failed');
    }
  };

  return (
    <div className="login-component">
      <div className={`container ${!isLogin ? "active" : ""}`} id="container">
        {isLogin ? (
          <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
              <h1>LOG IN</h1>
              <div className="social-icons">
                <GoogleLogin
                  onSuccess={loginGoogle}
                  onError={() => {
                    console.log("Login Failed");
                    toast.error("Google login failed");
                  }}
                />
                
                <a onClick={loginFacebook} className="icon" style={{ color: "blue" }}>
                  <FaFacebookF />
                </a> 
              </div>
              <span>or use your account for login</span>
              <input
                type="text"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <a href="#">Forgot Password</a>
              <button type="submit" className="signInBtn">
                {loading && <i className="fas fa-sync fa-spin"></i>}
                Sign In
              </button>
              {message && (
                <p className={messageType === "error" ? "error-message" : ""}>
                  {message}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <div className="social-icons">
                <a href="#" className="icon" style={{ color: "red" }}>
                  <FaGoogle />
                </a>
                <a href="#" className="icon" style={{ color: "blue" }}>
                  <FaFacebookF />
                </a>
              </div>
              <span>or use your email for registration</span>
              <input
                type="text"
                value={fullName}
                placeholder="FullName"
                onChange={(e) => setFullName(e.target.value)}
                required
                className={fullNameValidation.isValid ? "" : "error-input"}
              />
              {fullNameValidation.message && (
                <p className="errorVal">{fullNameValidation.message}</p>
              )}
              <input
                type="text"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailValidation.isValid ? "" : "error-input"}
              />
              {emailValidation.message && (
                <p className="errorVal">{emailValidation.message}</p>
              )}
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className={passwordValidation.isValid ? "" : "error-input"}
              />
              {passwordValidation.message && (
                <p className="errorVal">{passwordValidation.message}</p>
              )}
              <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={
                  confirmPasswordValidation.isValid ? "" : "error-input"
                }
              />
              {confirmPasswordValidation.message && (
                <p className="errorVal">{confirmPasswordValidation.message}</p>
              )}
              <button type="submit" className="signUpBtn">
                {loading && <i className="fas fa-sync fa-spin"></i>}
                Sign Up
              </button>
              {message && (
                <p className={messageType === "error" ? "error-message" : ""}>
                  {message}
                </p>
              )}
            </form>
          </div>
        )}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>badminton is joy</h1>
              <p>Enter your userFullName password to schedule now!!</p>
              <button
                className="hidden"
                id="login"
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>badminton is life</h1>
              <p>
                Register with your personal details to use all of the site
                features!!
              </p>
              <button
                className="hidden"
                id="register"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;