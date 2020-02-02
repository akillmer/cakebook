import React from "react";
import "./SignOut.scss";

class SignOut extends React.Component {
  componentDidMount() {
    this.props.signOutCallback();
  }

  render() {
    return (
      <div className="container sign-out-page">
        <h2>You've been signed out.</h2>
      </div>
    );
  }
}

export default SignOut;
