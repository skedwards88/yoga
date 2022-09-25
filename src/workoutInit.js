import { getYogaSequence } from "./getYogaSequence";
import { Statuses } from "./statuses";

export default function workoutInit({
  totalSec,
  poseDurationSec,
  sunSalutationDurationSec,
  startWorkout,
  muted,
  includeSunSalutations,
  includeStanding,
  includeFloor,
  includeShavasana,
  useSaved = true,
}) {

  console.log(`initial includeSunSalutations ${includeSunSalutations}`)
  const savedState = useSaved
    ? JSON.parse(localStorage.getItem("workoutState"))
    : undefined;

  totalSec = totalSec || savedState?.totalSec || 600;
  poseDurationSec = poseDurationSec || savedState?.poseDurationSec || 20;
  sunSalutationDurationSec =
    sunSalutationDurationSec || savedState?.sunSalutationDurationSec || 4;
  console.log(`muted input was ${muted}`);
  console.log(JSON.stringify(muted));
  muted = muted ?? savedState?.muted ?? false;
  includeSunSalutations = includeSunSalutations ?? savedState?.includeSunSalutations ?? true;
  includeStanding = includeStanding ?? savedState?.includeStanding ?? true;
  includeFloor = includeFloor ?? savedState?.includeFloor ?? true;
  includeShavasana = includeShavasana ?? savedState?.includeShavasana ?? true;

  console.log(`resolved includeSunSalutations ${includeSunSalutations}`)

  const yogaSequence = getYogaSequence({
    totalSec: totalSec,
    poseDurationSec: poseDurationSec,
    sunSalutationDurationSec: sunSalutationDurationSec,
    includeSunSalutations: includeSunSalutations,
    includeStanding: includeStanding,
    includeFloor: includeFloor,
    includeShavasana: includeShavasana,
  });

  return {
    yogaSequence: yogaSequence,
    totalSec: totalSec,
    poseDurationSec: poseDurationSec,
    sunSalutationDurationSec: sunSalutationDurationSec,
    elapsedSec: 0,
    status: startWorkout ? Statuses.paused : Statuses.notStarted, //todo can derive this from the time list...but do need to know whether running or paused
    muted: muted,
    currentPoseIndex: 0,
    includeSunSalutations: includeSunSalutations,
    includeStanding: includeStanding,
    includeFloor: includeFloor,
    includeShavasana: includeShavasana,
  };
}
