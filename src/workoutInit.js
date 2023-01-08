import { getYogaSequence } from "./getYogaSequence";
import { Statuses } from "./statuses";

export default function workoutInit({
  totalSec,
  poseDurationSec,
  sunSalutationDurationSec,
  startWorkout,
  muted,
  numSunSalutations,
  includeShavasana,
  includeVinyasanas,
  useSaved = true,
}) {
  const savedState = useSaved
    ? JSON.parse(localStorage.getItem("yogaBotState"))
    : undefined;

  totalSec = totalSec || savedState?.totalSec || 600;
  poseDurationSec = poseDurationSec || savedState?.poseDurationSec || 20;
  sunSalutationDurationSec =
    sunSalutationDurationSec || savedState?.sunSalutationDurationSec || 4;
  muted = muted ?? savedState?.muted ?? false;
  numSunSalutations =
    numSunSalutations ?? savedState?.numSunSalutations ?? "auto";
  includeShavasana = includeShavasana ?? savedState?.includeShavasana ?? true;
  includeVinyasanas =
    includeVinyasanas ?? savedState?.includeVinyasanas ?? true;

  const yogaSequence = getYogaSequence({
    totalSec: totalSec,
    poseDurationSec: poseDurationSec,
    sunSalutationDurationSec: sunSalutationDurationSec,
    numSunSalutations: numSunSalutations,
    includeShavasana: includeShavasana,
    includeVinyasanas: includeVinyasanas,
  });

  const actualTotalSec = yogaSequence.reduce((accumulated, nextPose) => accumulated + nextPose.duration, 0)

  return {
    yogaSequence: yogaSequence,
    totalSec: actualTotalSec,
    poseDurationSec: poseDurationSec,
    sunSalutationDurationSec: sunSalutationDurationSec,
    elapsedSec: 0,
    status: startWorkout ? Statuses.paused : Statuses.notStarted,
    muted: muted,
    currentPoseIndex: 0,
    numSunSalutations: numSunSalutations,
    includeShavasana: includeShavasana,
    includeVinyasanas: includeVinyasanas,
    elapsedTimeInPrevPoses: 0,
  };
}
