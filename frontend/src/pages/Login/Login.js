import "./login.css";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import logo from "../../Assets/logo.png";
import { FcGoogle } from "react-icons/fc";
import { Dialog, DialogTitle } from "@mui/material";
import axios from "axios";
import { TiTickOutline } from "react-icons/ti";
import { IoIosCloseCircleOutline } from "react-icons/io";
const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errors, setErrors] = useState({});

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse);
      setAlert(true);
    },
  });
  const handleClose = () => {
    setAlert(false);
  };
  const handleCloseLog = () => {
    setLoginError(false);
  };
  const handleInput = (e, type) => {
    if (type === "username") setUserName(e.target.value);
    else if (type === "password") setPassword(e.target.value);
  };

  const onSubmit = () => {
    if (userName !== "" && password !== "") {
      axios
        .post("http://localhost:3000/new-login", {
          userId: String(userName),
          password: password,
        })
        .then(function (response) {
          setAlert(true);
          console.log(response);
        })
        .catch(function (error) {
          setLoginError(true);
          console.log(error);
        });
    } else {
      const newErrors = validateErrors();
      setErrors(newErrors);
    }
  };
  const validateErrors = () => {
    const errors = {};
    if (userName === "") {
      errors.userName = "User name is required";
    } else if (password === "") {
      errors.password = "Please type password";
    }
    return errors;
  };
  return (
    <div className="main-wrapper">
      <div className="card">
        <div className="input-wrapper">
          <img src={logo} alt="logo" width="150px" height="50px" />
        </div>
        <div className="input-wrapper">
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="User Name"
              defaultValue={userName}
              type="text"
              required
              onChange={(e) => handleInput(e, "username")}
            />
            {errors.userName && (
              <div className="error-message">{errors.userName}</div>
            )}
          </div>
          <div className="form-heading">
            <input
              className="form-input"
              placeholder="Password"
              defaultValue={password}
              type="password"
              required
              onChange={(e) => handleInput(e, "password")}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          {/* <div className="form-heading">
            <input
              className="form-input"
              placeholder="Attach File"
              defaultValue={password}
              type="file"
              onChange={(e) => handleInput(e, "file")}
            />
          </div> */}
          <div className="button-wrapper">
            <button className="form-button" onClick={onSubmit}>
              Submit
            </button>
            {/* <GoogleLogin shape="pill"  onSuccess={responseMessage} onError={errorMessage} /> */}
            <button className="form-button" onClick={() => login()}>
              <FcGoogle size={"1.5em"} />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      {alert ? (
        <Dialog onClose={handleClose} open={alert}>
          <DialogTitle className="dialogue">
            <TiTickOutline color="green" />
            Login successfull!
          </DialogTitle>
        </Dialog>
      ) : (
        ""
      )}
      {loginError ? (
        <Dialog onClose={handleCloseLog} open={loginError}>
          <DialogTitle className="dialogue">
            <IoIosCloseCircleOutline color="red" />
            Login Unsuccessfull!
          </DialogTitle>
        </Dialog>
      ) : (
        ""
      )}
    </div>
  );
};
export default Login;
