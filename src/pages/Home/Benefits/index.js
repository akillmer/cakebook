import React from "react";
import "./Benefits.scss";
import { ReactComponent as PrivacyIcon } from "./icon_privacy.svg";
import { ReactComponent as AlarmIcon } from "./icon_alarm.svg";
import { ReactComponent as HelpIcon } from "./icon_help.svg";

const Benefits = props => (
  <div className="benefits">
    <div className="panel">
      <div className="copy">
        <h2>Stay incognito, no matter what</h2>
        <p>
          Your profile and will always remain private and can’t be viewed by
          anyone else.
        </p>
        <p>That's the Cakebook promise.</p>
      </div>
      <div className="all-icons">
        <div className="icon">
          <PrivacyIcon />
          <p>Always Private</p>
        </div>
        <div className="icon">
          <AlarmIcon />
          <p>No Notifications</p>
        </div>
        <div className="icon">
          <HelpIcon />
          <p>Zero Support</p>
        </div>
      </div>
    </div>
  </div>
);

export default Benefits;
