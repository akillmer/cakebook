import React from "react";
import SignUpForm from "../../components/SignUpForm";
import "./SignUp.scss";

const SignUp = props => (
  <div className="container sign-up-page">
    <p>Join Cakebook</p>
    <h1>Start your profile</h1>
    <div>
      <SignUpForm />
    </div>
    <p>You will complete your profile after signing in.</p>
  </div>
);

export default SignUp;
