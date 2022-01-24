import { useState, useEffect } from "react";

import firebase from "firebase"
import { useList } from 'react-firebase-hooks/database';

const Portfolio = (props) => {

  const [snapshots, loading, error] = useList(firebase.database().ref('/schelling/'));

  if (snapshots.length > 1) {
    const items = snapshots[0].val()
    let bets = []
    let i = 0
    props.activeMarkets.map((key) => {
      const prior_bet = Object.values(items[key].current_bids).filter(bid => bid.user === props.user)
      let component = ""
      if (prior_bet.length > 0) {
        component = <tr key={i}>
          <td
            onClick={ () => {
              changeView(items[key].name)
              newItem(Object.keys(items).indexOf(key))
            }}
          >
            <a href="#">
              { items[key].name }
            </a>              </td>
          <td>{ parseFloat(prior_bet[0].score) * 100 }%</td>
          <td>{ parseFloat(prior_bet[0].stake) * 100 }%</td>
        </tr>
      } else {
        component = <tr key={i}>
          <td>
            <a href="#">
              { items[key].name }
            </a>
          </td>
          <td> -- </td>
          <td> -- </td>
        </tr>
      }
      bets.push(component)
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
        <h5>${ snapshots[1].val()[props.user].capital } available</h5>
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