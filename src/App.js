import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavLinkList from "./components/NavLinkList";
import SignIn from "./pages/SignIn";
import SignOut from "./pages/SignOut";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import SignUp from "./pages/SignUp";
import "./style/App.scss";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: localStorage.getItem("token") || "" };
    this.setToken = this.setToken.bind(this);
    this.revokeToken = this.revokeToken.bind(this);
  }

  setToken(token) {
    localStorage.setItem("token", token);
    this.setState({ token });
  }

  revokeToken() {
    localStorage.setItem("token", "");
    this.setState({ token: "" });
  }

  render() {
    return (
      <Router>
        <div className="app">
          <nav>
            <div className="container">
              <NavLinkList showLogo={true} signedIn={this.state.token !== ""} />
            </div>
          </nav>

          <Switch>
            <Route
              exact
              path="/"
              render={props => <Home {...props} token={this.state.token} />}
            />
            <Route
              exact
              path="/login"
              render={props => (
                <SignIn
                  {...props}
                  tokenCallback={this.setToken}
                  token={this.state.token}
                />
              )}
            />
            <Route
              exact
              path="/logout"
              render={props => (
                <SignOut {...props} signOutCallback={this.revokeToken} />
              )}
            />
            <Route exact path="/signup" component={SignUp} />
            <Route
              exact
              path="/profile"
              render={props => (
                <UserProfile
                  {...props}
                  canEdit={false}
                  token={this.state.token}
                />
              )}
            />
            <Route
              exact
              path="/profile/edit"
              render={props => (
                <UserProfile
                  {...props}
                  canEdit={true}
                  token={this.state.token}
                />
              )}
            />
            <Route component={NotFound} />
          </Switch>

          <div className="container">
            <footer>
              <NavLinkList
                showLogo={false}
                signedIn={this.state.token !== ""}
              />
            </footer>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
