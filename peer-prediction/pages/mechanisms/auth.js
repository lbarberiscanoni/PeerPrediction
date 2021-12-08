import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import { useAuthState } from 'react-firebase-hooks/auth';

import 'materialize-css/dist/css/materialize.css';

const firebaseConfig = {

  apiKey: "AIzaSyBZoNhqhzSk8w4Quz2od8O6biJ66fO7K-w",

  authDomain: "peerprediction.firebaseapp.com",

  projectId: "peerprediction",

  storageBucket: "peerprediction.appspot.com",

  messagingSenderId: "760612678240",

  appId: "1:760612678240:web:f61b545fc6f3d5cdd73105",

  measurementId: "G-Z7W2E2K6T5"

};


// Initialize Firebase
//have to wait for loading for some reason
let app
let auth
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth()
}

const Auth = () => {  

  const [snapshots, db_loading, db_error] = useList(firebase.database().ref('/schelling/'));

  const [user, user_loading, user_error] = useAuthState(firebase.auth());

  const login = (phoneNumber) => { 
    const applicationVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    auth.signInWithPhoneNumber(phoneNumber, applicationVerifier)
      .then((confirmationResult) => {
        const verificationCode = window.prompt('Please enter the verification ' + 'code that was sent to your mobile device.');
        confirmationResult.confirm(verificationCode)
        applicationVerifier.clear()
        return true
      })
      .catch((error) => {
        console.log("error")
      });
  }

  const logout = () => {
    auth.signOut()
  }

  if (snapshots.length > 1) {
    // login("+1 1234567890")
    return(
      <div>
        <h1>Here</h1>
        <div id="recaptcha-container"></div>
        <button 
          onClick={ () => {
            login("+1 1234567890")
          }}
        >
          Login 
        </button>
        <button 
          onClick={ () => {
            logout()
          }}
        >
          Logout 
        </button>
        <h5>{ user ? user.uid : "none"}</h5>
      </div>
    )
  } else {
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Auth;