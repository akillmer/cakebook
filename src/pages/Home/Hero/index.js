import React from "react";
import SignUpForm from "../../../components/SignUpForm";
import "./Hero.scss";

const Hero = props => (
  <div className="hero">
    <div className="container">
      <h1>
        <div className="wrap-group">The social network</div>{" "}
        <div className="wrap-group">that we need</div>
      </h1>
      <div className="subtitle">
        <div className="wrap-group">Cakebook is so private,</div>{" "}
        <div className="wrap-group">your friends don't even know.</div>
      </div>
      <div className="hero-sign-up">
        <SignUpForm />
      </div>
    </div>
  </div>
);

export default Hero;
