import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import Link from 'next/link'

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

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  const [user_id, changeUser] = useState("default")

  const [hasVoted, updateVote] = useState(false)

  const vote = () => {
    alert("voted")
  }

  const registerUser = () => {
    let user = {}
    user["id"] = Math.random().toString().split(".")[1]
    user["capital"] = 1
    user["status"] = "started"

    firebase
      .database()
      .ref("/dmi/")
      .child("users")
      .push(user)
      .then((snapshot) => {
        changeUser(snapshot.key)
      })  
  }

  if (snapshots.length > 1) {
    if (hasVoted) {
      return(
        <h1>Here is your code: { user_id }</h1>
      )
    } else {
      
      return (
        <div>
          <h1>Determinant-based Mutual Information</h1>
        </div>
      )
    }
  } else {
    registerUser()
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Home;