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
    // increment the time by 1 second
    const newElapsedSec = currentState.elapsedSec + 1;

    // If class is over
    if (newElapsedSec >= currentState.totalSec) {
      if (!currentState.muted) {
        speak("Namaste");
      }
      return {
        ...currentState,
        elapsedSec: newElapsedSec,
        status: Statuses.complete,
      };
    }

    // If time is > than elapsedTimeInPrevPoses + duration of current pose
    // then move to next pose
    const yogaSequence = currentState.yogaSequence;
    const currentPoseIndex = currentState.currentPoseIndex;
    const currentPoseDuration = yogaSequence[currentPoseIndex]?.duration;
    const elapsedTimeInPrevPoses = currentState.elapsedTimeInPrevPoses;
    if (newElapsedSec >= currentPoseDuration + elapsedTimeInPrevPoses) {
      if (!currentState.muted) {
        speak(
          `${yogaSequence[currentPoseIndex + 1].pose.english}${
            yogaSequence[currentPoseIndex + 1].pose.side
              ? `. ${yogaSequence[currentPoseIndex + 1].pose.side} side`
              : ""
          }`
        ); // todo language
      }
      return {
        ...currentState,
        elapsedSec: newElapsedSec,
        currentPoseIndex: currentState.currentPoseIndex + 1,
        elapsedTimeInPrevPoses: elapsedTimeInPrevPoses + currentPoseDuration,
      };
    }
    // otherwise, just return the incremented time
    else {
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
