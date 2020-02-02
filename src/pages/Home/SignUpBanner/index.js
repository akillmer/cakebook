import React from "react";
import SignUpForm from "../../../components/SignUpForm";
import "./SignUpBanner.scss";

const HeroSignUp = props => (
  <div className="sign-up-banner">
    <div className="container">
      <h2>
        Join an unknown number of members that can't ever be found on Cakebook.
      </h2>
      <SignUpForm />
    </div>
  </div>
);

export default HeroSignUp;
