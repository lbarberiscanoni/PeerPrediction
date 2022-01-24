import { useState, useEffect } from "react";

const FinalMessage = (props) => {

    return(
      <div className="container">
        <div className="row">
          <h5 className="text-center">You are done! Thank you for participating</h5>
          <h5>Wanna see where you are on the leaderboard? 
            <a href="https://peer-prediction.vercel.app/mechanisms/leaderboard">
               Click Here
            </a>
          </h5>
        </div>
        <div className="row">
          <h5>If you are coming from Amazon Mechanical Turk or Prolific, here is your code: { props.code }</h5>
        </div>
        <div className="row">
          <h5>BY THE WAY: We are recruiting for a similar experiment to what you just did but where we pay 2-3 times what we paid you here in order to have multiple people work on this simultaneously </h5>
          <h5>
            If you are interested, 
            <a href="mailto:hllbck7@gmail.com">
              email us 
            </a>
            and we will send you a scheduling form so you can sign up. Please don't spam us lol
          </h5>
          <h5>If you are not interested then that's ok too XD</h5>
        </div>
      </div>
    )
}


export default FinalMessage;