import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';
import {mean, median, standardDeviation} from 'simple-statistics'
import VerticalBar from "../../components/VerticalBar"

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

const Results = () => {  

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  if (snapshots.length > 1) {
    let items = snapshots[0].val()
    return(
      <div>
        { snapshots.length > 0 &&
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
            return <div key={weighed_average}>
              <a
                target="_blank"
                href={ item.link }
              >
                <h2> { item.description } </h2>
              </a>
              <h3>Weighed Average: { weighed_average}</h3>
              <h3>Mean: { mean(scores) }</h3>
              <h3> Median: { median(scores) }</h3>
              <h3> SD: { standardDeviation(scores) }</h3>
              <VerticalBar scores={scores} />
            </div>
          })
        } 
      </div>
    )
  } else {
    return(
      <h1>Loading...</h1>
    )
  }
}
export default Results;