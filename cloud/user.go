package cloud

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"cloud.google.com/go/firestore"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

// User profile for the website
type User struct {
	UID      string `json:"uid"`
	Email    string `json:"email"`
	Password string `json:"password"`
	DOB      struct {
		Month string `json:"month"`
		Day   string `json:"day"`
		Year  string `json:"year"`
	} `json:"dob"`
	Phone   string `json:"phone"`
	Address struct {
		Street         string `json:"street"`
		StreetOptional string `json:"streetOptional"`
		City           string `json:"city"`
		State          string `json:"state"`
		ZipCode        string `json:"zipcode"`
		Country        string `json:"country"`
	} `json:"address"`
	Security []struct {
		Question string `json:"question"`
		Answer   string `json:"answer"`
	} `json:"security"`
	Photo string `json:"photo"`
}

// UserClaim is encoded into a JWT
type UserClaim struct {
	UID   string `json:"uid"`
	Email string `json:"email"`
	jwt.StandardClaims
}

// UserAuth based by email and password before issuing a Token or for initiating sign up
type UserAuth struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	UID      string `json:"uid,omitempty"`
}

// TokenResp to be used by the client
type TokenResp struct {
	Token string `json:"token"`
}

var (
	// ErrDecodingRequest indicates the request's body failed to marshal
	ErrDecodingRequest = errors.New("Failed to decode request")
	// ErrBadEmail indicates an email address is already in use
	ErrBadEmail = errors.New("Email is already registered")
	// ErrUnknownUser indicates a user document couldn't be found by key/value
	ErrUnknownUser = errors.New("User by that key does not exist")
	// ErrBadMethod indicates an unsupported API method
	ErrBadMethod = errors.New("Method is not supported")

	// the key used to create tokens
	jwtKey = []byte(os.Getenv("JWT_KEY"))
	// project ID for Google Cloud (Firestore, Storage)
	projectID = os.Getenv("PROJECT_ID")
	// the name of the storage bucket holding user photos
	photoBucket = os.Getenv("PHOTO_BUCKET")
)

// helper method to respond to requests with a status code and error message
func errorResponse(w http.ResponseWriter, status int, err error) {
	w.WriteHeader(status)
	w.Write([]byte(err.Error()))
}

func handleCORS(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

// HandleAuth endpoint: https://us-central1-mixplate.cloudfunctions.net/jetcakeHandleAuth
// Only accepts POST methods so users can authenticate by email/password, gets a JWT on success
func HandleAuth(w http.ResponseWriter, r *http.Request) {
	handleCORS(w, r)

	if r.Method != http.MethodPost {
		errorResponse(w, http.StatusMethodNotAllowed, ErrBadMethod)
		return
	}

	token, err := signInUser(r)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err)
		return
	}

	err = json.NewEncoder(w).Encode(token)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, err)
		return
	}
}

// HandleUser endpoint: https://us-central1-mixplate.cloudfunctions.net/jetcakeHandleUser
// New users can start a profile with POST. Verified users can use PATCH/GET.
func HandleUser(w http.ResponseWriter, r *http.Request) {
	handleCORS(w, r)

	switch r.Method {
	// Post -> initiate a new account
	case http.MethodPost:
		// if the user is already verified then you can't create a new profile
		if _, err := verifyUser(r); err == nil {
			errorResponse(w, http.StatusMethodNotAllowed, err)
			return
		}

		if err := createUser(r); err != nil {
			errorResponse(w, http.StatusBadRequest, err)
			return
		}

		w.WriteHeader(http.StatusCreated)

	// Patch -> user updating themselves
	case http.MethodPatch:
		claim, err := verifyUser(r)
		if err != nil {
			errorResponse(w, http.StatusUnauthorized, err)
			return
		}

		if err := patchUser(r, claim.UID); err != nil {
			errorResponse(w, http.StatusBadRequest, err)
			return
		}

		w.WriteHeader(http.StatusOK)

	// Get -> user is requesting their own data
	case http.MethodGet:
		claim, err := verifyUser(r)
		if err != nil {
			errorResponse(w, http.StatusUnauthorized, err)
			return
		}

		user, err := getUser("UID", claim.UID)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, err)
			return
		}

		user.Password = ""

		if err := json.NewEncoder(w).Encode(user); err != nil {
			errorResponse(w, http.StatusInternalServerError, err)
			return
		}

	default:
		errorResponse(w, http.StatusMethodNotAllowed, ErrBadMethod)
		return
	}
}

// Get a user where path == value, e.g. getUser("Email", user.Email)
func getUser(path, value string) (*User, error) {
	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	var user User

	matchedUsers, err := client.Collection("Users").
		Where(path, "==", value).
		Limit(1).Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	if matchedUsers == nil || len(matchedUsers) != 1 {
		return nil, fmt.Errorf("User where `%v == %v` does not exist", path, value)
	}

	if err := matchedUsers[0].DataTo(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// create a new user profile with just authentication information
func createUser(r *http.Request) error {
	var user UserAuth
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return ErrDecodingRequest
	}

	// make sure the new user's email isn't registered
	if _, err := getUser("Email", user.Email); err == nil {
		return ErrBadEmail
	}

	passbuf, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.MinCost)
	if err != nil {
		return err
	}
	user.Password = string(passbuf)

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return err
	}
	defer client.Close()

	doc := client.Collection("Users").NewDoc()
	user.UID = doc.ID

	_, err = doc.Create(ctx, user)
	return err
}

func patchUser(r *http.Request, uid string) error {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return ErrDecodingRequest
	}

	oldUser, err := getUser("UID", uid)
	if err != nil {
		// this should really serve to help refresh your token
		return ErrUnknownUser
	}

	user.UID = uid // also the Firestore document's key

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return err
	}
	defer client.Close()

	// only allow this change if the new email is available
	if user.Email != oldUser.Email {
		if _, err := getUser("Email", user.Email); err == nil {
			return ErrBadEmail
		}
	}

	// update user's password if it's not blank
	if user.Password == "" {
		user.Password = oldUser.Password
	} else {
		passbuf, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.MinCost)
		if err != nil {
			return err
		}
		user.Password = string(passbuf)
	}

	if user.Photo == "" {
		user.Photo = oldUser.Photo
	}

	_, err = client.Collection("Users").Doc(user.UID).Set(ctx, user)
	return err
}

func signInUser(r *http.Request) (*TokenResp, error) {
	var auth UserAuth

	if err := json.NewDecoder(r.Body).Decode(&auth); err != nil {
		return nil, ErrDecodingRequest
	}

	user, err := getUser("Email", auth.Email)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(auth.Password)); err != nil {
		return nil, err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &UserClaim{UID: user.UID, Email: user.Email})
	signedToken, err := token.SignedString(jwtKey)

	if err != nil {
		return nil, err
	}

	return &TokenResp{Token: signedToken}, nil
}

// Verifies a user's jwt
func verifyUser(r *http.Request) (*UserClaim, error) {
	// get the token from the request's headers
	reqToken := strings.Split(r.Header.Get("Authorization"), "Bearer ")

	if len(reqToken) != 2 {
		return nil, errors.New("Invalid authorization")
	}

	var claim UserClaim
	token, err := jwt.ParseWithClaims(reqToken[1], &claim, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("Unexpected signing method")
		}
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("JWT token is invalid")
	}

	return &claim, nil
}
