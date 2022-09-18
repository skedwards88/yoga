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
  console.log(
    `input: totalSec ${totalSec} poseDurationSec ${poseDurationSec} sunSalutationDurationSec ${sunSalutationDurationSec}`
  );
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
  console.log(`numSalutations ${numSalutations}`);
  console.log(`sunSalutationSec: ${sunSalutationSec}`);
  // 30 sec closing poses for every 5 min, up to 5 min max
  const minClosingSec = Math.min((totalSec / (5 * 60)) * 30, 5 * 60);

  // 20 sec shavasana for every 5 min, up to 3 min max
  const shavasanaSec = Math.min((totalSec / (5 * 60)) * 20, 3 * 60);

  // Sets of standing poses fills the remaining time
  const maxStandingSec =
    totalSec - sunSalutationSec - minClosingSec - shavasanaSec;
  // todo handle case where this is <= 0?
  console.log(`maxStandingSec ${maxStandingSec}`);
  // A set consists of 5 poses, repeated twice
  // Calculate how much time a set will take based on how long each pose will last
  // todo handle case where not even time for one set
  const posesPerSet = 5;
  const standingSecPerSet = posesPerSet * 2 * poseDurationSec;
  const numSets = Math.floor(maxStandingSec / standingSecPerSet);
  console.log(`numSets ${numSets}`);
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

  console.log(
    `act standingSequence time: ${standingSequence.length * poseDurationSec}`
  );

  // Fill the remaining time with seated and reclining poses
  const closingSec =
    totalSec -
    sunSalutationSec -
    shavasanaSec -
    standingSequence.length * poseDurationSec;
  console.log(`shavasanaSec ${shavasanaSec}`);
  console.log(`closingSec ${closingSec}`);
  const numClosingPoses = Math.round(closingSec / poseDurationSec);
  const numSeatedPoses = Math.floor(numClosingPoses / 2);
  const numRecliningPoses = Math.ceil(numClosingPoses / 2);
  const seatedPoses = getPoses(numSeatedPoses, PoseTypes.sitting);
  const recliningPoses = getPoses(numRecliningPoses, PoseTypes.reclining);
  console.log(
    `act seated sec: ${numClosingPoses} => ${numSeatedPoses * poseDurationSec}`
  );
  console.log(`act reclining sec ${numRecliningPoses * poseDurationSec}`);
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
        type: PoseTypes.sunSalutations,
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
        type: PoseTypes.standing,
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
        type: PoseTypes.sitting,
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
        type: PoseTypes.reclining,
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
      type: "shavasana",
    },
    {
      time: nextSecMark + shavasanaSec,
      pose: {
        sanskrit: "Namaste",
        english: "Gratitude",
        type: "Reclining",
        spine: "",
        bilateral: false,
      }, //todo is this how to end? maybe namaste instead?
      type: "shavasana",
    },
  ];

  return fullSequence;
}
