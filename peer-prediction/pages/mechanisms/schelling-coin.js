import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import { useAuthState } from 'react-firebase-hooks/auth';


import 'materialize-css/dist/css/materialize.css';
import 'react-phone-number-input/style.css'

import PhoneInput from 'react-phone-number-input';
import Portfolio from "../../components/Portfolio"


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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Home = () => {  

  const [score, updateScore] = useState(0)

  const [stake, updateStake] = useState(0)

  const [itemNum, newItem] = useState(0)

  const auth = firebase.auth()

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  const [user, user_loading, user_error] = useAuthState(firebase.auth());

  const [phoneID, changePhoneID] = useState()

  const [hasVoted, updateVote] = useState(false)

  const findUserKey = () => {
    const users = snapshots[1].val()
    const allUsersWithThisUiD = Object.keys(users).filter(key => users[key].id === user.uid)

    return allUsersWithThisUiD
  }

  const vote = () => {

    const user_id = findUserKey()[0]
    //first, check the stake of the user to see that they are not over-betting
    const available_capital = snapshots[1].val()[user_id].capital

    if (stake === 0) {
      alert("you can't bet 0% of your money: increase your stake!")
    } else if (stake > available_capital) {
      alert("you are betting more money than you have available")
    } else {

      newItem(itemNum + 1)

      let item_key = Object.keys(snapshots[0].val())[itemNum]

      //second, let's check if the user has already staked on this question, in which case we will just update the bid
      let current_bid = []

      //filter wasn't working here for some reason
      Object.keys(snapshots[0].val()[item_key].current_bids).map((key) => {
        if (snapshots[0].val()[item_key].current_bids[key]["user"] === user_id) {
          current_bid.push(key)
        }
      })

      let bid = {}
      bid["user"] = user_id
      bid["score"] = score
      bid["stake"] = stake

      const item_id = Object.keys(snapshots[0].val())[itemNum]

      if (current_bid.length > 0) {
        firebase
          .database()
          .ref("/schelling/")
          .child("items")
          .child(item_id)
          .child("current_bids")
          .child(current_bid[0])
          .update(bid)
      } else {
        firebase
          .database()
          .ref("/schelling/")
          .child("items")
          .child(item_id)
          .child("current_bids")
          .push(bid)
      }

      let update = {}
      update["capital"] = available_capital - stake
      firebase
        .database()
        .ref("/schelling/")
        .child("users")
        .child(user_id.toString())
        .update(update)

      if (itemNum >= (Object.keys(snapshots[0].val()).length - 1)) {
        updateVote(true)
      }
    }

  }

  const login = (phoneNumber) => { 
    const applicationVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    auth.signInWithPhoneNumber(phoneNumber, applicationVerifier)
      .then((confirmationResult) => {
        const verificationCode = window.prompt('Please enter the verification ' + 'code that was sent to your mobile device.');
        confirmationResult.confirm(verificationCode)
        applicationVerifier.clear()
        return true
      })
      .then(() => {
        registerUser()
      })
      .catch((error) => {
        console.log("error", error)
      });
  }

  const logout = () => {
    auth.signOut()
  }

  const registerUser = () => {
    let new_user = {}
    new_user["capital"] = 1
    new_user["status"] = "started"
    new_user["phone"] = phoneID
    new_user["id"] = user.uid

    // check if the workerID is already in the system to avoid a sybil attack
    let matching_users = Object.values(snapshots[1].val()).filter(player => player.phone === phoneID)
    if (matching_users.length > 0) {
      alert("look like you've already played the game bc your Worker ID is in the system")
    } else {
      const name = window.prompt("loooks like you joining us for the first time: let's get you signed up! \n" + "what's your name?")
      new_user["user_name"] = name
      firebase
        .database()
        .ref("/schelling/")
        .child("users")
        .push(new_user) 
        .then((snapshot) => {
          console.log("fired")
          changeUser(snapshot.key)
        })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(phoneID)
  }

  if (snapshots.length > 1) {
    // console.log(user, user.uid, findUserKey())
    if (user == null) {
      return(
        <div className="container">
          <h1>Login</h1>
          <div id="recaptcha-container"></div>
          <form 
              onSubmit={handleSubmit}
          >
            <div className="col">
              <PhoneInput
                placeholder="Enter phone number"
                value={phoneID}
                onChange={changePhoneID}
              />
            </div>
            <div className="col">
              <button className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      )
    } else {
      if (hasVoted) {
        return(
          <div>
            <h1>Here is your code: { findUserKey()[0] }</h1>
            <h1 className="text-center">You are done!</h1>
            <h1 className="text-center">Thank you for participating</h1>
            <h3>BY THE WAY: We are recruiting for a similar experiment to what you just did but where we pay 2-3 times what we paid you here in order to have multiple people work on this simultaneously </h3>
            <h3>
              If you are interested, 
              <a href="mailto:hllbck7@gmail.com">
                email us 
              </a>
              and we will send you a scheduling form so you can sign up. Please don't spam us lol
            </h3>
            <h3>If you are not interested then that's ok too XD</h3>
          </div>
        )
      } else {
        let current_item = Object.values(snapshots[0].val())[itemNum]
        return (
          <div className="container">
            <h1 className="center-align">Conspiracy Coin</h1>
            <div className="row">
              <h5>Instructions</h5>
              <p>Beyond the minimum payment, you will get paid a big bonus based on how close your answer is to the average </p>
              <p>Read up on the theory through the link below, and feel free to do your own research before answering</p>
            </div>
            <div className="row">
              <div className="col s12 m6 l6">
                <h4 dangerouslySetInnerHTML={{ __html: current_item.description }}></h4>
                <h5>{ score * 100}%</h5>
                <div className="form-group">
                    <label
                        className="left"
                    >
                      <h6>
                        Not at all
                      </h6>
                    </label>
                    <label
                      className="right"
                    >
                      <h6>
                        Absolutely Yes
                      </h6>
                    </label>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="0" 
                      max="1" 
                      defaultValue="0" 
                      step="0.01" 
                      onChange={(e) => { updateScore(e.target.value) }} 
                    />
                </div>
                <h5>How confident are you? I.E. what % of your Reward are you willing to bet on this?</h5>
                <h5>{ stake * 100}%</h5>
                <div className="form-group">
                    <label
                        className="left"
                    >
                      <h6>
                        No Confidence
                      </h6>
                    </label>
                    <label
                      className="right"
                    >
                      <h6>
                        Absolutely Certain
                      </h6>
                    </label>
                    <input 
                      id="stake"
                      type="range" 
                      className="form-range" 
                      min="0" 
                      max="1" 
                      defaultValue="0" 
                      step="0.01" 
                      onChange={(e) => { updateStake(e.target.value) }} 
                    />
                </div>
                <button
                  className="btn-large"
                  onClick={
                    () => vote()
                  }
                  >
                    Submit
                </button>
              </div>
              <div className="col s12 m6 l6">
              {
                user === null ? 
                <Portfolio 
                  user={ findUserKey()[0] }
                  stake={ stake }
                />
                :
                <p>Couldn't load the Portfolio</p>

              }
                
                <button 
                  onClick={ () => {
                    logout()
                  }}
                >
                  Logout 
                </button>
              </div>
            </div>
          </div>
        )
      }
    }
  } else {
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Home;

