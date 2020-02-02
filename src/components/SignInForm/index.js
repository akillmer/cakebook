import React from "react";
import axios from "axios";
import ErrorMessage from "../../components/ErrorMessage";
import "./SignInForm.scss";
import { endpointHandleAuth } from "../../endpoints";
import { withRouter } from "react-router-dom";

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pending: false,
      error: "",
      email: "",
      password: ""
    };

    this.signIn = this.signIn.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  signIn(e) {
    this.setState({ pending: true, error: "" });
    e.preventDefault();
    axios
      .post(endpointHandleAuth, {
        email: this.state.email,
        password: this.state.password
      })
      .then(resp => {
        this.props.tokenCallback(resp.data.token);
        this.props.history.push("/profile");
      })
      .catch(error => {
        this.setState({
          pending: false,
          error: "Wrong username or password, try again."
        });
      });
  }

  render() {
    return (
      <div className="sign-in-form">
        <form>
          <label htmlFor="email">Email</label>
          <input
            name="email"
            type="text"
            autoComplete="username"
            disabled={this.state.pending}
            value={this.state.email}
            onChange={this.handleInputChange}
          />

          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={this.state.pending}
            value={this.state.password}
            onChange={this.handleInputChange}
          />

          <button onClick={this.signIn} disabled={this.state.pending}>
            Sign In
          </button>
          <ErrorMessage error={this.state.error} />
        </form>
      </div>
    );
  }
}

export default withRouter(SignInForm);
