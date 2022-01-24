import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import { useAuthState } from 'react-firebase-hooks/auth';


import 'materialize-css/dist/css/materialize.css';
import 'react-phone-number-input/style.css'

import PhoneInput from 'react-phone-number-input';
import Portfolio from "../../components/Portfolio";
import ProgressBar from "../../components/ProgressBar";
import FinalMessage from "../../components/FinalMessage";

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
let auth
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth()
}

const Home = () => {  

  const [score, updateScore] = useState(0)

  const [stake, updateStake] = useState(0)

  const [itemNum, newItem] = useState(0)

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  const [user, user_loading, user_error] = useAuthState(firebase.auth());

  const [user_key, changeUserKey] = useState();

  const [phoneID, changePhoneID] = useState()

  const [hasPlacedBet, updateBet] = useState(false)

  const findUserKey = () => {
    const users = snapshots[1].val()
    const allUsersWithThisUiD = Object.keys(users).filter(key => users[key].id === user.uid)

    return allUsersWithThisUiD
  }

  const getActiveMarkets = () => {
    let activeMarkets = []

    const markets = Object.keys(snapshots[0].val())

    markets.map((key) => {
      let market = snapshots[0].val()[key]

      const endDate = new Date(
        market.duration.end.split("-")[2], 
        market.duration.end.split("-")[0] - 1, 
        market.duration.end.split("-")[1])
      const startDate = new Date(
        market.duration.start.split("-")[2], 
        market.duration.start.split("-")[0] - 1, 
        market.duration.start.split("-")[1])
      const today = new Date(Date.now())

      if (startDate < today && today < endDate) {
        const prior_bets = Object.values(market.current_bids).filter(bid => bid.user === findUserKey()[0])
        if (prior_bets.length === 0) {
          activeMarkets.push(key)
        }
      }
    })

    return activeMarkets
  }

  const bet = () => {

    const user_id = findUserKey()[0]

    let item_key = getActiveMarkets()[itemNum]

    //first, let's check if the user has already staked on this question, in which case we will just update the bid
    let current_bid = []

    //filter wasn't working here for some reason
    Object.keys(snapshots[0].val()[item_key].current_bids).map((key) => {
      if (snapshots[0].val()[item_key].current_bids[key]["user"] === user_id) {
        current_bid.push(key)
      }
    })

    //second, check the stake of the user to see that they are not over-betting
    const available_capital = snapshots[1].val()[user_id].capital


      let bid = {}
      bid["user"] = user_id
      bid["score"] = score
      bid["stake"] = stake

      const item = snapshots[0].val()[item_key]


      let update = {}

      if (current_bid.length > 0) {
        const updatedCapital = available_capital + parseFloat(item.current_bids[current_bid[0]].stake) - stake

        if (updatedCapital < 0) {
          alert("you are betting more money than you have available") 
        } else {
          firebase
            .database()
            .ref("/schelling/")
            .child("items")
            .child(item_key)
            .child("current_bids")
            .child(current_bid[0])
            .update(bid)

          update["capital"] = available_capital + parseFloat(item.current_bids[current_bid[0]].stake) - stake
        }
      } else {
        if (stake > available_capital) {
          alert("you are betting more money than you have available") 
        } else {
          firebase
            .database()
            .ref("/schelling/")
            .child("items")
            .child(item_key)
            .child("current_bids")
            .push(bid)

          update["capital"] = available_capital - stake
        }
      } 

      if (Object.entries(update).length > 0) {
        firebase
          .database()
          .ref("/schelling/")
          .child("users")
          .child(user_id.toString())
          .update(update)

        if (itemNum >= (getActiveMarkets().length - 1)) {
          updateBet(true)
        } else {
          newItem(itemNum + 1)
        }
      }
      

  }

  const login = (phoneNumber) => { 
    const applicationVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    firebase.auth().signInWithPhoneNumber(phoneNumber, applicationVerifier)
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
    firebase.auth().signOut()
  }

  const registerUser = () => {
    let new_user = {}
    new_user["capital"] = 1
    new_user["status"] = "started"
    new_user["phone"] = phoneID

    // check if the workerID is already in the system to avoid a sybil attack
    let matching_users = Object.values(snapshots[1].val()).filter(player => player.phone === phoneID)
    if (matching_users.length > 0) {
      alert("look like you've already played the game bc your Worker ID is in the system")
    } else {
      const name = window.prompt("loooks like you joining us for the first time: let's get you signed up! \n" + "what's your name?")
      new_user["user_name"] = name
      new_user["id"] = ""

      firebase
        .database()
        .ref("/schelling/")
        .child("users")
        .push(new_user) 
        .then((snapshot) => {
          console.log("fired")
          changeUserKey(snapshot.key)
        })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(phoneID)
  }

  if (snapshots.length > 1) {
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
      if (findUserKey().length < 1) {
        let update = {}
        update["id"] = user.uid
        firebase
          .database()
          .ref("/schelling/")
          .child("users")
          .child(user_key)
          .update(update)
      }
      if (hasPlacedBet) {
        return(
          <FinalMessage
            code={ findUserKey()[0] }
          />
        )
      } else {
        if (getActiveMarkets().length > 0) {
          let current_item = snapshots[0].val()[getActiveMarkets()[itemNum]]
          return (
            <div className="container">
              <h1 className="center-align">Conspiracy Coin</h1>
              <div className="row">
                <div className="col s12 m6 l6">
                  <h4>
                    What is the probability that 
                    <a 
                      target="_blank"
                      href= { current_item.link }
                    >
                      { current_item.description }
                    </a>
                  </h4>
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
                      () => bet()
                    }
                    >
                      Submit
                  </button>
                </div>
                <div className="col s12 m6 l6">
                  <div className="row">
                    <h5>Instructions</h5>
                    <p>You are trying to guess the average of how everybody else answered the question</p>
                    <p>Read up on the theory through the link below, and feel free to do your own research before answering</p>
                    <p>You have get to the end to get the confirmation code that gets you paid!</p>
                    <p>Beyond the minimum payment, you will get paid a big bonus based on how close your answer is to the average </p>
                  </div>
                  <ProgressBar
                    questionsLeft={ getActiveMarkets.length - itemNum }
                    progress={ (itemNum + 1 * 1.0) / getActiveMarkets().length * 100 }
                  />
                  <h5>${ snapshots[1].val()[findUserKey()[0]].capital } available</h5>
                </div>
              </div>
            </div>
          )
        } else {
          return(
            <div className="container">
              <h3>No new conspiracies for you to bet on</h3>
              <h3>Check back later</h3>
            </div>
          )
        }
      }
    }
  } else {
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Home;

