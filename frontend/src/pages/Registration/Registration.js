import "./registration.css";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../Assets/logo.png";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleInput = (e, type) => {
    // if (type === "name") setName(e.target.value);
    // else if(type==='email') setEmail(e.target.value);
    // else if(type==='phone') setPhone(e.target.value);
    // else if (type === "password") setPassword(e.target.value);
    // else if (type === "cfmpassword") setConfirmPassword(e.target.value);
    setFormData({
      ...formData,
      [type]: e.target.value,
    });
  };
  const onSubmit = async() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    console.log(newErrors);
    if (Object.keys(newErrors).length === 0) {
      axios
        .post("http://localhost:3000/new-user", {
          userId: formData.name,
          password: formData.password,
        })
        .then(function (response) {
          console.log(response);
          navigate("/login");
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    console.log(formData, "userpass");
  };
  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    } else if (data.name.length > 8) {
      errors.name = "Username must not be greater than 8 characters long";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length > 16) {
      errors.password = "Password must not be greater than 16 characters long";
    }
    if (!data.confirmPassword) {
      errors.confirmPassword = "Please type password again";
    }

    if (data.confirmPassword !== data.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  return (
    <div className="main-wrapper">
      <div className="cards">
        <div className="input-wrapper">
          <img src={logo} alt="logo" width="150px" height="50px" />
        </div>
        <div className="input-wrapper">
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="User Name*"
              defaultValue={formData.name}
              type="text"
              required
              onChange={(e) => handleInput(e, "name")}
            />
            {errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="Email*"
              defaultValue={formData.email}
              type="email"
              required
              onChange={(e) => handleInput(e, "email")}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="Phone"
              defaultValue={formData.phone}
              type="phone"
              required
              onChange={(e) => handleInput(e, "phone")}
            />
            {errors.phone && (
              <div className="error-message">{errors.phone}</div>
            )}
          </div>
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="Password*"
              defaultValue={formData.password}
              type="password"
              required
              onChange={(e) => handleInput(e, "password")}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="Confirm Password*"
              defaultValue={formData.confirmPassword}
              type="password"
              required
              onChange={(e) => handleInput(e, "confirmPassword")}
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="button-wrapper">
            <button className="form-button" onClick={onSubmit}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Registration;
