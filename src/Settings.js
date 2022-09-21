import React from "react";

export default function Settings({
  setShowSettings,
  dispatchWorkoutState,
  workoutState,
}) {
  function handleNewWorkout(event) {
    event.preventDefault();

    const newTotalSec = parseInt(event.target.elements.totalSec.value);
    const newPoseDurationSec = parseInt(
      event.target.elements.poseDurationSec.value
    );
    const newSunSalutationDurationSec = parseInt(
      event.target.elements.sunSalutationDurationSec.value
    );

    dispatchWorkoutState({
      action: "newWorkout",
      totalSec: newTotalSec,
      poseDurationSec: newPoseDurationSec,
      sunSalutationDurationSec: newSunSalutationDurationSec,
    });

    setShowSettings(false);
  }

  return (
    <form id="settings" onSubmit={(event) => handleNewWorkout(event)}>
        <div >
          <div className="setting">
            <label htmlFor="totalSec">Total (min)</label>
            <select id="totalSec" defaultValue={workoutState.totalSec}>
              <option value={5 * 60}>5</option>
              <option value={10 * 60}>10</option>
              <option value={15 * 60}>15</option>
              <option value={20 * 60}>20</option>
              <option value={30 * 60}>30</option>
              <option value={45 * 60}>45</option>
              <option value={60 * 60}>60</option>
            </select>
          </div>

          <div className="setting">
            <label htmlFor="poseDurationSec">Pose duration (sec)</label>
            <select
              id="poseDurationSec"
              defaultValue={workoutState.poseDurationSec}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
            </select>
          </div>

          <div className="setting">
            <label htmlFor="sunSalutationDurationSec">
              Sun salutation pose duration (sec)
            </label>
            <select
              id="sunSalutationDurationSec"
              defaultValue={workoutState.sunSalutationDurationSec}
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>
        <div className="button-group">
          <button type="submit">Start</button>
          <button type="button" onClick={() => setShowSettings(false)}>
            Cancel
          </button>
        </div>
      </form>
  );
}
