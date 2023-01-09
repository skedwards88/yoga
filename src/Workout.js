import React from "react";
import { Statuses } from "./statuses";

const TimeSettings = ["countUp", "countDown", "noTime"];

function Time({ elapsedSec, totalSec, timeSetting }) {
  if (TimeSettings[timeSetting] === "noTime") {
    return <></>;
  }

  if (TimeSettings[timeSetting] === "countUp") {
    const min = Math.floor(elapsedSec / 60);
    const sec = elapsedSec % 60;
    return <div id="time">{`${min}:${sec < 10 ? "0" : ""}${sec}`}</div>;
  }

  if (TimeSettings[timeSetting] === "countDown") {
    const min = Math.floor((totalSec - elapsedSec) / 60);
    const sec = (totalSec - elapsedSec) % 60;
    return <div id="time">{`${min}:${sec < 10 ? "0" : ""}${sec}`}</div>;
  }
}

function ProgressBar({ progressWidth, tickMarks = [] }) {
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
          width: `${Math.min(progressWidth, 100)}%`,
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

  function handleVisibilityChange() {
    // Pause the timer if the page is hidden
    if (
      (document.hidden || document.msHidden || document.webkitHidden) &&
      workoutState.status === Statuses.running
    ) {
      dispatchWorkoutState({ action: "pause" });
    }
  }

  React.useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      removeEventListener("visibilitychange", handleVisibilityChange);
  });

  const currentPoseIndex = workoutState.currentPoseIndex;
  const elapsedTimeInCurrentPose =
    workoutState.elapsedSec - workoutState.elapsedTimeInPrevPoses;
  const totalPoseDuration =
    workoutState.yogaSequence[currentPoseIndex]?.duration;
  const currentPoseInfo = workoutState.yogaSequence[currentPoseIndex].pose;

  let prevType = workoutState.yogaSequence[0].type;
  let ticks = [];
  let timeAccumulator = 0;
  for (let index = 0; index < workoutState.yogaSequence.length; index++) {
    const type = workoutState.yogaSequence[index].type;
    const duration = workoutState.yogaSequence[index].duration;
    if (type !== prevType) {
      const newTick = (timeAccumulator / workoutState.totalSec) * 100;
      ticks = [...ticks, newTick];
      prevType = type;
    }
    timeAccumulator += duration;
  }

  return (
    <div id="workout">
      <div id="exercise_info">
        <div>{currentPoseInfo.english}</div>
        <div>{currentPoseInfo.sanskrit}</div>
        <div>{currentPoseInfo.side ? `${currentPoseInfo.side} side` : ""}</div>
      </div>
      <Time
        elapsedSec={workoutState.elapsedSec}
        totalSec={workoutState.totalSec}
        timeSetting={timeSetting}
      ></Time>

      <div className="progress-group">
        <ProgressBar
          progressWidth={
            (elapsedTimeInCurrentPose / (totalPoseDuration - 1)) * 100
          }
        ></ProgressBar>
      </div>

      <div className="progress-group">
        <ProgressBar
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
          onClick={() =>
            setTimeSetting((timeSetting + 1) % TimeSettings.length)
          }
        ></button>
        <button
          id="settingsButton"
          onClick={() => {
            dispatchWorkoutState({ action: "pause" });
            setShowSettings(true);
          }}
        ></button>
        <button
          id="cancelButton"
          onClick={() => dispatchWorkoutState({ action: "cancel" })}
        ></button>
      </div>
    </div>
  );
}
