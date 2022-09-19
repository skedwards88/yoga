import sunSalutations from "./asanas/sunSalutations.json";
import standingPoses from "./asanas/standing.json";
import sittingPoses from "./asanas/sitting.json";
import recliningPoses from "./asanas/reclining.json";
import armBalancePoses from "./asanas/armBalance.json";
import shuffleArray from "./shuffleArray";

const PoseTypes = {
  sunSalutations: "sunSalutations",
  standing: "standing",
  sitting: "sitting",
  reclining: "reclining",
  armBalance: "armBalance",
};

function getPoses({ count, poseType, matchSides = false }) {
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
  let selectionList = shuffleArray(JSON.parse(JSON.stringify(allPoses)));
  let selectionIndex = 0;

  for (let index = 0; index < count; index++) {
    let pose;
    // if this is the last pose, don't use a bilateral pose
    // otherwise, we will have too many poses since we would repeat to do both sides
    if (index === count - 1) {
      pose = [
        ...selectionList.slice(selectionIndex, selectionList.length),
        ...selectionList.slice(0, selectionIndex),
      ].find((i) => !i.bilateral);
    } else {
      pose = selectionList[selectionIndex];
      selectionIndex = (selectionIndex + 1) % selectionList.length;
    }

    if (matchSides && pose.bilateral) {
      selectedPoses = [
        ...selectedPoses,
        { ...pose, side: "right" },
        { ...pose, side: "left" },
      ];
      index++;
    } else {
      selectedPoses = [...selectedPoses, pose];
    }
  }
  return selectedPoses;
}

export function getYogaSequence({
  totalSec,
  poseDurationSec,
  sunSalutationDurationSec,
}) {
  // One sun salutation for every 5 min,
  // but at least one and no more than 5
  const numSalutations = Math.min(
    Math.max(Math.floor(totalSec / (5 * 60)), 1),
    5
  );
  const selectedSunSalutations = getPoses({
    count: numSalutations,
    poseType: PoseTypes.sunSalutations,
  });
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
  const standingSecPerSet = posesPerSet * 2 * poseDurationSec;
  const numSets = Math.floor(maxStandingSec / standingSecPerSet);
  let standingSequence = [];
  for (let index = 0; index < numSets; index++) {
    let set = getPoses({ count: posesPerSet, poseType: PoseTypes.standing });
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

  // Fill the remaining time with seated and reclining poses
  const closingSec =
    totalSec -
    sunSalutationSec -
    shavasanaSec -
    standingSequence.length * poseDurationSec;
  const numClosingPoses = Math.round(closingSec / poseDurationSec);
  const numSeatedPoses = Math.floor(numClosingPoses / 2);
  const numRecliningPoses = Math.ceil(numClosingPoses / 2);
  const seatedPoses = getPoses({
    count: numSeatedPoses,
    poseType: PoseTypes.sitting,
    matchSides: true,
  });
  const recliningPoses = getPoses({
    count: numRecliningPoses,
    poseType: PoseTypes.reclining,
    matchSides: true,
  });

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
  ];

  return fullSequence;
}
