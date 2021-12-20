import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';

const Portfolio = (props) => {

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  if (snapshots.length > 1) {
    const items = snapshots[0].val()
    let bets = []
    Object.keys(items).map((key) => {
      const prior_bets_made_by_user = Object.values(items[key].current_bids).filter(bid => bid.user === props.user)
      console.log(prior_bets_made_by_user)
      prior_bets_made_by_user.map((prior_bet) => {
        let component = <tr><td>{ items[key].name }</td><td>{ parseFloat(prior_bet.score) * 100 }%</td><td>{ parseFloat(prior_bet.stake) * 100 }%</td></tr>
        bets.push(component)
      })
    })
    return(
      <div>
        <h3>Portfolio</h3>
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Probability</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            { bets }
          </tbody>
        </table>
        <h5>${ snapshots[1].val()[props.user].capital * (1 - props.stake) } available</h5>
      </div>
    )
  } else {
    return(
      <div>
        <h1>Portfolio</h1>
        <h5>Loading...</h5>
      </div>
    )
  }

}


export default Portfolio;