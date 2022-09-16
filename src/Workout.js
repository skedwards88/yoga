import React from "react";
import { Statuses } from "./statuses";

function ProgressBar({ progressWidth, progressColor }) {
  return (
    <div className="progressBar">
      <div
        className="progress"
        style={{
          width: `${progressWidth}%`,
          backgroundColor: progressColor,
        }}
      ></div>
    </div>
  );
}

export default function Workout({
  setShowSettings,
  dispatchWorkoutState,
  workoutState,
}) {
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

  // time elapsed within the current intermission+interval
  //   const baseSec =
  //     workoutState.elapsedSec %
  //     (workoutState.intervalSec + workoutState.intermissionSec);

  //   const progressWidth = ((baseSec - workoutState.intermissionSec + 1) /
  //   workoutState.intervalSec) *
  // 100;
  //   const progressSec = baseSec - workoutState.intermissionSec + 1;;

  return (
    <div id="workout">
      <div id="exercise_info">
        <div>{workoutState.currentPose.english}</div>
        <div>{workoutState.currentPose.sanskrit}</div>
        <div>
          {workoutState.currentPose.side
            ? `${workoutState.currentPose.side} side`
            : ""}
        </div>
      </div>

      {/* <div className="progress-group">
        <div className="progress-label">{progressSec}</div>
        <ProgressBar
          progressColor="green"
          progressWidth={progressWidth}
        ></ProgressBar>
      </div> */}

      <div className="progress-group">
        {/* todo change to show min:sec. also make option to hide time? <div className="progress-label">{`${currentInterval} / ${totalIntervals}`}</div> */}
        <ProgressBar
          progressColor="green"
          progressWidth={
            100 * (workoutState.elapsedSec / workoutState.totalSec)
          }
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
