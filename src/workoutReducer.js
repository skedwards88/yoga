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
    const yogaSequence = currentState.yogaSequence;
    const currentPoseIndex = currentState.currentPoseIndex;
    const nextTime = yogaSequence[currentPoseIndex + 1]?.time;

    // Increase the time by 1 second
    const newElapsedSec = currentState.elapsedSec + 1;
    // If the new time is >= the next time in the sequence, then move to the next pose
    if (newElapsedSec >= nextTime) {
      if (!currentState.muted) {
        speak(`${yogaSequence[currentPoseIndex + 1].pose.english}`); // todo language
      }
      return {
        ...currentState,
        elapsedSec: newElapsedSec,
        currentPoseIndex: currentState.currentPoseIndex + 1,
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
