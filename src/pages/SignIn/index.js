import React from "react";
import { Link } from "react-router-dom";
import SignInForm from "../../components/SignInForm";
import "./SignIn.scss";

const SignIn = props => (
  <div className="container sign-in-page">
    <h1>Sign in to Cakebook</h1>
    <div>
      <SignInForm tokenCallback={props.tokenCallback} token={props.token} />
      <p>Forgot your password? Just make a new account.</p>
    </div>
    <div className="new-user">
      New to Cakebook? <Link to="/signup">Create an account.</Link>
    </div>
  </div>
);

export default SignIn;
