import speak from "./speak";
import { Statuses } from "./statuses";
import workoutInit from "./workoutInit";

export default function workoutReducer(currentState, payload) {
  if (payload.action === "newWorkout") {
    return workoutInit({ ...payload, startWorkout: true });
  } else if (payload.action === "mute") {
    return { ...currentState, muted: true };
  } else if (payload.action === "unmute") {
    return { ...currentState, muted: false };
  } else if (payload.action === "increment") {
    let yogaSequence = JSON.parse(JSON.stringify(currentState.yogaSequence));
    const nextTime = yogaSequence[0].time;
    const nextPose = yogaSequence[0].pose;
    console.log(`NEXT TIME ${nextTime}`);
    console.log(JSON.stringify(nextPose));

    // Increase the time by 1 second
    const newElapsedSec = currentState.elapsedSec + 1;
    // If the new time is >= the next time in the sequence
    // then remove the next sequence info from the list and make that the current info
    if (newElapsedSec >= nextTime) {
      if (!currentState.muted) {
        speak(`${nextPose.english}`); // todo language
      }
      return {
        ...currentState,
        elapsedSec: newElapsedSec,
        currentPose: nextPose,
        yogaSequence: yogaSequence.slice(1, yogaSequence.length),
      };
    } else {
      return {
        ...currentState,
        elapsedSec: newElapsedSec,
      };
    }
  } else if (payload.action === "play") {
    return { ...currentState, status: Statuses.running };
  } else if (payload.action === "pause") {
    return { ...currentState, status: Statuses.paused };
  } else if (payload.action === "cancel") {
    return { ...currentState, status: Statuses.notStarted };
  } else {
    console.log(`unknown ${console.log(JSON.stringify(payload))}`);
    return { ...currentState };
  }
}
