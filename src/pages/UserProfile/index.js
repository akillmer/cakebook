import React from "react";
import axios from "axios";
import { endpointHandleUser } from "../../endpoints";
import { ReactComponent as UploadIcon } from "./icon_photo.svg";
import SelectCountry from "./SelectCountry";
import SelectQuestion from "./SelectQuestion";
import ErrorMessage from "../../components/ErrorMessage";
import "./UserProfile.scss";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      error: ""
    };

    this.saveProfile = this.saveProfile.bind(this);
    this.editProfile = this.editProfile.bind(this);
    this.validateProfile = this.validateProfile.bind(this);
    this.previewPhoto = this.previewPhoto.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSecurityChange = this.handleSecurityChange.bind(this);
  }

  componentDidMount() {
    axios
      .get(endpointHandleUser, {
        headers: {
          Authorization: "Bearer " + this.props.token
        }
      })
      .then(resp => {
        let userData = resp.data;

        if (!this.validateProfile(userData)) {
          this.props.history.push("/profile/edit#complete");
          window.scrollTo(0, 0);
        }

        if (userData.security === null) {
          userData.security = [
            {
              question: "",
              answer: ""
            },
            {
              question: "",
              answer: ""
            },
            {
              question: "",
              answer: ""
            }
          ];
        }

        this.setState({ userData });
      })
      .catch(error => this.props.history.push("/logout"));
  }

  previewPhoto(e) {
    let reader = new FileReader();
    reader.onload = e => {
      let userData = this.state.userData;
      userData.photo = e.target.result;
      this.setState({ userData });
    };
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
  }

  saveProfile() {
    axios
      .patch(endpointHandleUser, this.state.userData, {
        headers: {
          Authorization: "Bearer " + this.props.token
        }
      })
      .then(resp => {
        this.props.history.push("/profile");
        window.scrollTo(0, 0);
      })
      .catch(error => this.setState({ error: error.response.data }));
  }

  editProfile() {
    this.props.history.push("/profile/edit");
    window.scrollTo(0, 0);
  }

  validateProfile(data) {
    for (const [key, value] of Object.entries(data)) {
      if (key === "password" || key === "streetOptional") {
        continue;
      }
      if (value === null || value === "") {
        return false;
      }
      if (typeof value === "object") {
        if (!this.validateProfile(data[key])) {
          return false;
        }
      }
    }
    return true;
  }

  handleInputChange(e, parentKey) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    let userData = this.state.userData;

    if (parentKey) userData[parentKey][name] = value;
    else userData[name] = value;

    this.setState({ userData });
  }

  handleSecurityChange(e, index, key) {
    const target = e.target;
    const value = target.value;

    let userData = this.state.userData;

    userData["security"][index][key] = value;
    this.setState({ userData });
  }

  dobDaySelect() {
    let days = [<option value="" key={0}></option>];
    for (let i = 1; i <= 31; i++) {
      let value = i < 10 ? "0" + i : i;
      days.push(
        <option key={i} value={value}>
          {i}
        </option>
      );
    }
    return days;
  }

  render() {
    if (!this.state.userData) return null;

    const validProfile = this.validateProfile(this.state.userData);
    const canEdit = this.props.canEdit || !validProfile;
    const isDisabled = !canEdit;
    const formAction = canEdit ? "" : "/profile/edit";
    const dobDaySelect = this.dobDaySelect();

    let pageTitle = "";

    if (!validProfile || this.props.location.hash === "#complete") {
      pageTitle = "Please complete your profile";
    } else if (canEdit) {
      pageTitle = "Edit your profile";
    } else {
      pageTitle = "Your profile";
    }

    const photoStyle =
      this.state.userData.photo === ""
        ? {}
        : { backgroundImage: `url(${this.state.userData.photo})` };

    const photoLabel =
      this.state.userData.photo === "" ? (
        <label htmlFor="profilePhoto" className="upload-new">
          <UploadIcon />
        </label>
      ) : (
        <label htmlFor="profilePhoto" className="upload-edit">
          <UploadIcon />
        </label>
      );

    const profilePhoto = (
      <div className={this.state.userData.photo === "" ? "photo-required" : ""}>
        <div className="profile-photo" style={photoStyle}>
          <input
            type="file"
            id="profilePhoto"
            name="profilePhoto"
            accept="image/png, image/jpeg, image/jpg"
            onChange={this.previewPhoto}
          />
          {canEdit && photoLabel}
        </div>
      </div>
    );

    const profileFields = (
      <div className="profile-fields" action={formAction}>
        <h3>Your account</h3>
        <div className="field-group mobile-break">
          <div
            className={this.state.userData.email === "" ? "required-field" : ""}
          >
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              disabled={isDisabled}
              defaultValue={this.state.userData.email}
              onChange={this.handleInputChange}
            />
          </div>
          {canEdit && (
            <div>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                name="password"
                disabled={isDisabled}
                onChange={this.handleInputChange}
              />
            </div>
          )}
        </div>

        <h3>Date of birth</h3>
        <div className="field-group">
          <div
            className={
              this.state.userData.dob.month === "" ? "required-field" : ""
            }
          >
            <label htmlFor="month">Month</label>
            <select
              name="month"
              disabled={isDisabled}
              defaultValue={this.state.userData.dob.month}
              onChange={e => this.handleInputChange(e, "dob")}
            >
              <option value=""></option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div
            className={
              this.state.userData.dob.day === "" ? "required-field" : ""
            }
          >
            <label htmlFor="day">Day</label>
            <select
              name="day"
              disabled={isDisabled}
              defaultValue={this.state.userData.dob.day}
              onChange={e => this.handleInputChange(e, "dob")}
            >
              {dobDaySelect}
            </select>
          </div>

          <div
            className={
              this.state.userData.dob.year === "" ? "required-field" : ""
            }
          >
            <label htmlFor="year">Year</label>
            <input
              type="number"
              name="year"
              disabled={isDisabled}
              defaultValue={this.state.userData.dob.year}
              onChange={e => this.handleInputChange(e, "dob")}
            />
          </div>
        </div>

        <h3>Phone number</h3>
        <div className="field-group">
          <div
            className={this.state.userData.phone === "" ? "required-field" : ""}
          >
            <label htmlFor="phone">Primary tel.</label>
            <input
              type="tel"
              name="phone"
              disabled={isDisabled}
              defaultValue={this.state.userData.phone}
              onChange={this.handleInputChange}
            />
          </div>
        </div>

        <h3>Mailing address</h3>
        <div className="field-group mobile-break">
          <div
            className={
              this.state.userData.address.street === "" ? "required-field" : ""
            }
          >
            <label htmlFor="street">Address</label>
            <input
              type="text"
              name="street"
              disabled={isDisabled}
              defaultValue={this.state.userData.address.street}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>

          <div>
            <label htmlFor="streetOptional">Apt/Suite/Other</label>
            <input
              type="text"
              name="streetOptional"
              disabled={isDisabled}
              defaultValue={this.state.userData.address.streetOptional}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>
        </div>

        <div className="field-group">
          <div
            className={
              this.state.userData.address.city === "" ? "required-field" : ""
            }
          >
            <label htmlFor="city">City</label>
            <input
              type="text"
              name="city"
              disabled={isDisabled}
              defaultValue={this.state.userData.address.city}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>

          <div
            className={
              this.state.userData.address.state === "" ? "required-field" : ""
            }
          >
            <label htmlFor="state">State</label>
            <input
              type="text"
              name="state"
              disabled={isDisabled}
              defaultValue={this.state.userData.address.state}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>
        </div>

        <div className="field-group">
          <div
            className={
              this.state.userData.address.zipcode === "" ? "required-field" : ""
            }
          >
            <label htmlFor="zipcode">Postal Code</label>
            <input
              type="number"
              pattern="[0-9]{5}"
              name="zipcode"
              disabled={isDisabled}
              defaultValue={this.state.userData.address.zipcode}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>

          <div
            className={
              this.state.userData.address.country === "" ? "required-field" : ""
            }
          >
            <label htmlFor="country">Country</label>
            <SelectCountry
              disabled={isDisabled}
              defaultValue={this.state.userData.address.country}
              onChange={e => this.handleInputChange(e, "address")}
            />
          </div>
        </div>

        <h3>Security</h3>

        {[0, 1, 2].map(v => (
          <div className="field-group" key={`security_${v}`}>
            <div className="security">
              <div
                className={
                  this.state.userData.security[v].question === ""
                    ? "required-field"
                    : ""
                }
              >
                <label htmlFor={`security_question_${v}`}>
                  Security Question #{v + 1}
                </label>
                <SelectQuestion
                  name={`security_question_${v}`}
                  disabled={isDisabled}
                  defaultValue={this.state.userData.security[v].question}
                  onChange={e => this.handleSecurityChange(e, v, "question")}
                />
              </div>
              <div
                className={
                  this.state.userData.security[v].answer === ""
                    ? "required-field"
                    : ""
                }
              >
                <label htmlFor={`security_answer_${v}`}>Answer</label>
                <input
                  type="text"
                  name={`security_answer_${v}`}
                  disabled={isDisabled}
                  defaultValue={this.state.userData.security[v].answer}
                  onChange={e => this.handleSecurityChange(e, v, "answer")}
                />
              </div>
            </div>
          </div>
        ))}

        {canEdit && (
          <button
            className="save-changes"
            onClick={this.saveProfile}
            disabled={!validProfile}
          >
            Save changes
          </button>
        )}
        {!canEdit && <button onClick={this.editProfile}>Edit profile</button>}
        <ErrorMessage error={this.state.error} />
      </div>
    );

    return (
      <div className="container">
        <h1>{pageTitle}</h1>
        <div className="user-profile-page">
          <div className="photo">{profilePhoto}</div>
          <div className="fields">{profileFields}</div>
        </div>
      </div>
    );
  }
}

export default UserProfile;
