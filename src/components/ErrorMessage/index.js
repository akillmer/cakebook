import React from "react";
import "./ErrorMessage.scss";

const ErrorMessage = props => (
  <div className="error-message">{props.error}</div>
);

export default ErrorMessage;
