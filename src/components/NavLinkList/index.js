import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Branding } from "../../assets/cakebook.svg";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import "./NavLinkList.scss";

class NavLinkList extends React.Component {
  render() {
    const signInOrOut = this.props.signedIn ? (
      <Link to="/logout">Sign out</Link>
    ) : (
      <Link to="/login">Sign in</Link>
    );

    const signUpOrProfile = this.props.signedIn ? (
      <Link to="/profile">
        <div className="signup">My Profile</div>
      </Link>
    ) : (
      <Link to="/signup">
        <div className="signup">Sign Up</div>
      </Link>
    );

    return (
      <ul className="nav-links">
        <li>
          <Link to="/">
            {this.props.showLogo && <Logo className="logo" />}
            <Branding className="branding" />
          </Link>
        </li>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>{signInOrOut}</li>
        <li>{signUpOrProfile}</li>
      </ul>
    );
  }
}

export default NavLinkList;
