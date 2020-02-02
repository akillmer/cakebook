import React from "react";
import axios from "axios";
import ErrorMessage from "../../components/ErrorMessage";
import { endpointHandleUser } from "../../endpoints";
import { withRouter } from "react-router-dom";
import "./SignUpForm.scss";

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pending: false,
      error: "",
      email: "",
      password: ""
    };

    this.signUp = this.signUp.bind(this);
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

  signUp(e) {
    this.setState({ pending: true });
    e.preventDefault();

    axios
      .post(endpointHandleUser, {
        email: this.state.email,
        password: this.state.password
      })
      .then(resp => {
        this.props.history.push("/login");
      })
      .catch(error => {
        this.setState({ pending: false, error: "Email is already in use." });
      });
  }

  render() {
    return (
      <div className="sign-up-form">
        <form>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              autoComplete="username"
              disabled={this.state.pending}
              value={this.state.email}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="email">Password</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              disabled={this.state.pending}
              value={this.state.password}
              onChange={this.handleInputChange}
            />
            <p>Make it hard to remember, for reasons</p>
          </div>
          <ErrorMessage error={this.state.error} />
          <div>
            <button onClick={this.signUp} disabled={this.state.pending}>
              Start Your Profile
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(SignUpForm);
