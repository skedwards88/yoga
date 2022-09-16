import sunSalutations from "./asanas/sunSalutations.json";
import standingPoses from "./asanas/standing.json";
import sittingPoses from "./asanas/sitting.json";
import recliningPoses from "./asanas/reclining.json";
import armBalancePoses from "./asanas/armBalance.json";

const PoseTypes = {
  sunSalutations: "sunSalutations",
  standing: "standing",
  sitting: "sitting",
  reclining: "reclining",
  armBalance: "armBalance",
};

function getPoses(count, poseType) {
  let allPoses;
  switch (poseType) {
    case PoseTypes.sunSalutations:
      allPoses = sunSalutations;
      break;

    case PoseTypes.standing:
      allPoses = standingPoses;
      break;

    case PoseTypes.sitting:
      allPoses = sittingPoses;
      break;

    case PoseTypes.reclining:
      allPoses = recliningPoses;
      break;

    case PoseTypes.armBalance:
      allPoses = armBalancePoses;
      break;

    default: // todo error?
      console.log("Pose type not found");
      allPoses = [
        ...standingPoses,
        ...sittingPoses,
        ...recliningPoses,
        ...armBalancePoses,
      ];
  }
  let selectedPoses = [];
  let primarySelectionList = JSON.parse(JSON.stringify(allPoses)); //todo shuffle. or pick random instead of pop
  let secondarySelectionList = [];
  for (let index = 0; index < count; index++) {
    if (!primarySelectionList.length) {
      primarySelectionList = secondarySelectionList;
      secondarySelectionList = [];
    }
    const pose = primarySelectionList.pop();
    secondarySelectionList = [...secondarySelectionList, pose];
    selectedPoses = [...selectedPoses, pose];
  }
  return selectedPoses;
}

export function getYogaSequence({
  totalSec,
  poseDurationSec,
  sunSalutationDurationSec,
}) {
  // todo arm balances

  // One sun salutation for every 5 min,
  // but at least one and no more than 5
  const numSalutations = Math.min(
    Math.max(Math.floor(totalSec / (5 * 60)), 1),
    5
  );
  const selectedSunSalutations = getPoses(
    numSalutations,
    PoseTypes.sunSalutations
  );
  const unseparatedSunSalutations = selectedSunSalutations.flatMap((i) => i);
  const sunSalutationSec =
    unseparatedSunSalutations.length * sunSalutationDurationSec;

  // 30 sec closing poses for every 5 min, up to 5 min max
  const minClosingSec = Math.min((totalSec / (5 * 60)) * 30, 5 * 60);

  // 20 sec shavasana for every 5 min, up to 3 min max
  const shavasanaSec = Math.min((totalSec / (5 * 60)) * 20, 3 * 60);

  // Sets of standing poses fills the remaining time
  const maxStandingSec =
    totalSec - sunSalutationSec - minClosingSec - shavasanaSec;
  // todo handle case where this is <= 0?

  // A set consists of 5 poses, repeated twice
  // Calculate how much time a set will take based on how long each pose will last
  // todo handle case where not even time for one set
  const posesPerSet = 5;
  const standingSec = posesPerSet * 2 * poseDurationSec;
  const numSets = Math.floor(maxStandingSec / standingSec);
  let standingSequence = [];
  for (let index = 0; index < numSets; index++) {
    let set = getPoses(posesPerSet, PoseTypes.standing);
    const setA = set.map((pose) => ({
      ...pose,
      side: pose.bilateral ? "right" : "",
    }));
    const setB = set.map((pose) => ({
      ...pose,
      side: pose.bilateral ? "left" : "",
    }));
    standingSequence = [...standingSequence, ...setA, ...setB];
  }

  console.log(JSON.stringify(standingSequence));
  // Fill the remaining time with seated and reclining poses
  const closingSec = totalSec - sunSalutationSec - shavasanaSec - standingSec;
  const numClosingPoses = Math.round(closingSec / poseDurationSec);
  const numSeatedPoses = Math.floor(numClosingPoses);
  const numRecliningPoses = Math.ceil(numClosingPoses);
  const seatedPoses = getPoses(numSeatedPoses, PoseTypes.sitting);
  const recliningPoses = getPoses(numRecliningPoses, PoseTypes.reclining);

  // Assemble the selected poses into a timed list
  let fullSequence = [];
  let nextSecMark = 0;

  // Sun salutations
  for (let index = 0; index < unseparatedSunSalutations.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: unseparatedSunSalutations[index],
      },
    ];
    nextSecMark += sunSalutationDurationSec;
  }

  // Standing
  for (let index = 0; index < standingSequence.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: standingSequence[index],
      },
    ];
    nextSecMark += poseDurationSec;
  }

  // Seated
  for (let index = 0; index < seatedPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: seatedPoses[index],
      },
    ];
    nextSecMark += poseDurationSec;
  }

  // Reclining
  for (let index = 0; index < recliningPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: recliningPoses[index],
      },
    ];
    nextSecMark += poseDurationSec;
  }

  // Shavasana
  fullSequence = [
    ...fullSequence,
    {
      time: nextSecMark,
      pose: {
        sanskrit: "Shavasana",
        english: "Corpse",
        type: "Reclining",
        spine: "",
        bilateral: false,
      },
    },
    {
      time: nextSecMark + shavasanaSec,
      pose: undefined, //todo is this how to end? maybe namaste instead?
    },
  ];

  return fullSequence;
}
