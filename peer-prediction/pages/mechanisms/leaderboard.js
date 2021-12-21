import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import {mean, median, standardDeviation, zScore} from 'simple-statistics'

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Leaderboard = () => {  

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  const rank = () => {
    let items = snapshots[0].val()
    let users = snapshots[1].val()

    let players = {}
    Object.values(users).map((user) => {
      players[user.user_id] = 0
    })

    Object.values(items).map((item) => {

      let scores = []
      let overall_stakes = 0
      let weighed_average = 0

      Object.values(item.current_bids).map((bid) => {
        overall_stakes += parseFloat(bid.stake)
      })

      Object.values(item.current_bids).map((bid) => {
        let raw_score = parseFloat(bid.score) * 100 
        let weighed_score = raw_score * (bid.stake / overall_stakes)
        scores.push(raw_score)
        weighed_average += weighed_score
      })

      let sd = standardDeviation(scores)

      Object.values(item.current_bids).map((bid) => {
        let performance = Math.abs(zScore(parseFloat(bid.score) * 100, weighed_average, sd))
        try {
          players[users[bid.user].user_name] += performance
        } catch {
          console.log("skipping ", bid)
        }
      })
    })

    //shoutout to this stackoverflow answer on how to reverse sort this https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
    let sorted_players = Object.keys(players).sort((a,b) => {
      return players[a]-players[b]
    })

    return sorted_players
  }

  if (snapshots.length > 1) {
    let players = []
    let sorted_players = rank()
    let i = 1
    sorted_players.map((player) => {
      let component = <tr><td>{ i }</td><td>{ player }</td></tr>
      players.push(component)
      i += 1
    })
    return(
      <div className="container">
        <div className="row">
          <h2>Ranking</h2>
        </div>
        <div className="row">
          <table 
            className="responsive-table striped"
          >
            <thead>
              <tr>
                  <th>Rank</th>
                  <th>Player ID</th>
              </tr>
            </thead>
            <tbody>
              { players }
            </tbody>
          </table>
        </div>
      </div>
    )
  } else {
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Leaderboard;