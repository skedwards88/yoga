import React from "react";
import { Statuses } from "./statuses";

const TimeSettings = ["countUp","countDown","noTime"];

function Time({elapsedSec, totalSec, timeSetting}) {

  if (TimeSettings[timeSetting] === "noTime") {
    return <></>
  }

  if (TimeSettings[timeSetting] === "countUp") {
    const min = Math.floor(elapsedSec / 60)
    const sec = elapsedSec % 60;
    return <div id="time">{`${min}:${sec < 10 ? "0" : ""}${sec}`}</div>
  }

  if (TimeSettings[timeSetting] === "countDown") {
    const min = Math.floor((totalSec - elapsedSec) / 60);
    const sec = (totalSec - elapsedSec) % 60;
    return <div id="time">{`${min}:${sec < 10 ? "0" : ""}${sec}`}</div>
  }
}

function ProgressBar({ progressWidth, progressColor, tickMarks = [] }) {
  const ticks = tickMarks.map((tick, i) => (
    <div
      key={i}
      className="progressTick"
      style={{
        width: `${tick}%`,
      }}
    ></div>
  ));
  return (
    <div className="progressBar">
      <div
        className="progress"
        style={{
          width: `${progressWidth}%`,
          backgroundColor: progressColor,
        }}
      ></div>
      {ticks}
    </div>
  );
}

export default function Workout({
  setShowSettings,
  dispatchWorkoutState,
  workoutState,
}) {
  const [timeSetting, setTimeSetting] = React.useState(0);

  React.useEffect(() => {
    let timerID;
    if (
      workoutState.status === Statuses.running &&
      workoutState.elapsedSec < workoutState.totalSec
    ) {
      timerID = setInterval(
        () => dispatchWorkoutState({ action: "increment" }),
        1000
      );
    }
    return () => clearInterval(timerID);
  }, [workoutState.status]);

  const currentPoseIndex = workoutState.currentPoseIndex;
  const elapsedPose =
    workoutState.elapsedSec - workoutState.yogaSequence[currentPoseIndex].time;
  const totalPose =
    workoutState.yogaSequence[currentPoseIndex + 1].time -
    workoutState.yogaSequence[currentPoseIndex].time; // todo will fail on last
  const currentPoseInfo = workoutState.yogaSequence[currentPoseIndex].pose;

  let prevType = workoutState.yogaSequence[0].type;
  let ticks = [];
  for (let index = 0; index < workoutState.yogaSequence.length; index++) {
    const type = workoutState.yogaSequence[index].type;
    if (type !== prevType) {
      // todo total sec is not actually total sec...? use actual total sec instead
      const newTick =
        (workoutState.yogaSequence[index].time / workoutState.totalSec) * 100;
      ticks = [...ticks, newTick];
      prevType = type;
    }
  }

  return (
    <div id="workout">
      <div id="exercise_info">
        <div>{currentPoseInfo.english}</div>
        <div>{currentPoseInfo.sanskrit}</div>
        <div>{currentPoseInfo.side ? `${currentPoseInfo.side} side` : ""}</div>
      </div>
      <Time elapsedSec={workoutState.elapsedSec} totalSec={workoutState.totalSec} timeSetting={timeSetting}></Time>

      <div className="progress-group">
        <ProgressBar
          progressColor="purple"
          progressWidth={((elapsedPose ) / (totalPose - 1)) * 100}
        ></ProgressBar>
      </div>

      <div className="progress-group">
        {/* todo change to show min:sec. also make option to hide time? <div className="progress-label">{`${currentInterval} / ${totalIntervals}`}</div> */}
        <ProgressBar
          progressColor="purple"
          progressWidth={
            100 * (workoutState.elapsedSec / workoutState.totalSec)
          }
          tickMarks={ticks}
        ></ProgressBar>
      </div>

      <div id="workoutControls" className="button-group">
        {workoutState.status === Statuses.running ? (
          <button
            id="pauseButton"
            onClick={() => dispatchWorkoutState({ action: "pause" })}
          ></button>
        ) : (
          <button
            id="playButton"
            onClick={() => dispatchWorkoutState({ action: "play" })}
          ></button>
        )}
        {workoutState.muted ? (
          <button
            id="unmuteButton"
            onClick={() => dispatchWorkoutState({ action: "unmute" })}
          ></button>
        ) : (
          <button
            id="muteButton"
            onClick={() => dispatchWorkoutState({ action: "mute" })}
          ></button>
        )}
        <button
          id="timeButton"
          className={TimeSettings[(timeSetting + 1) % TimeSettings.length]}
          onClick={() => setTimeSetting((timeSetting + 1) % TimeSettings.length)}
        >{timeSetting}</button>
        <button
          id="settingsButton"
          onClick={() => setShowSettings(true)}
        ></button>
        <button
          id="cancelButton"
          onClick={() => dispatchWorkoutState({ action: "cancel" })}
        ></button>
      </div>
    </div>
  );
}
