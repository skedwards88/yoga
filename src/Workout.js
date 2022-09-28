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
          width: `${progressWidth}%`,
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

  const wakeLock = React.useRef(null);

  const getWakeLock = React.useCallback(async () => {
    console.log(`getting wakeLock`);
    if (!("wakeLock" in navigator)) {
      console.log("wakeLock not supported");
      return;
    }
    try {
      wakeLock.current = await navigator.wakeLock.request("screen");
      console.log(`2. wakeLock is ${wakeLock}`);

      wakeLock.current.addEventListener("release", () => {
        console.log("Screen Wake Lock released:");
      });
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  });

  const releaseWakeLock = React.useCallback(async () => {
    console.log("releasing wakeLock");
    if (!("wakeLock" in navigator && wakeLock.current)) {
      console.log("no wakeLock to release");
      return;
    }
    await wakeLock.current.release();
  });

  React.useEffect(() => {
    if (
      workoutState.status === Statuses.running &&
      workoutState.elapsedSec < workoutState.totalSec
    ) {
      getWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [workoutState.status]);

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
  const elapsedPose =
    workoutState.elapsedSec - workoutState.yogaSequence[currentPoseIndex].time;
  // the pose duration is either the diff between the start time of this pose and the next
  // or, if this is the last pose, the diff between it and the total time
  const totalPose =
    workoutState.yogaSequence[currentPoseIndex + 1]?.time -
      workoutState.yogaSequence[currentPoseIndex].time ||
    workoutState.totalSec - workoutState.yogaSequence[currentPoseIndex].time;
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
      <Time
        elapsedSec={workoutState.elapsedSec}
        totalSec={workoutState.totalSec}
        timeSetting={timeSetting}
      ></Time>

      <div className="progress-group">
        <ProgressBar
          progressWidth={(elapsedPose / (totalPose - 1)) * 100}
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
