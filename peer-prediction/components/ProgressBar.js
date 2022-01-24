import { useState, useEffect } from "react";

const ProgressBar = (props) => {

  return(
    <div id="modded">
      <div 
        className="progress blue lighten-4 tooltipped" 
        data-position="top" 
      >
        <span>Progress</span>
        <div 
          className="determinate blue" 
          style={{width: (props.progress) + "%", animation: "grow 2s;"}}
        >
          { props.progress + "%"}
        </div>
      </div>
    </div>
  )

}


export default ProgressBar;