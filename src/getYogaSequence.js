import allSunSalutations from "./asanas/sunSalutations.json";
import allStandingPoses from "./asanas/standing.json";
import allSittingPoses from "./asanas/sitting.json";
import allFloorFrontPoses from "./asanas/floorFront.json";
import allRecliningPoses from "./asanas/reclining.json";
import allArmBalancePoses from "./asanas/armBalance.json";
import shuffleArray from "./shuffleArray";
import { PoseTypes } from "./PoseTypes";

function getPoses({ count, poseType, matchSides = false }) {
  let allPoses;
  switch (poseType) {
    case PoseTypes.sunSalutations:
      allPoses = allSunSalutations;
      break;

    case PoseTypes.standing:
      allPoses = allStandingPoses;
      break;

    case PoseTypes.sitting:
      allPoses = allSittingPoses;
      break;

    case PoseTypes.floorFront:
      allPoses = allFloorFrontPoses;
      break;

    case PoseTypes.reclining:
      allPoses = allRecliningPoses;
      break;

    case PoseTypes.armBalance:
      allPoses = allArmBalancePoses;
      break;

    default: // todo error?
      console.log("Pose type not found");
      allPoses = [
        ...allStandingPoses,
        ...allSittingPoses,
        ...allFloorFrontPoses,
        ...allRecliningPoses,
        ...allArmBalancePoses,
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

function getSunSalutations(numSunSalutations, totalClassSec) {
  // One sun salutation for every 5 min,
  // but at least one and no more than 5
  // todo handle case of minimal selection

  if (numSunSalutations === "auto") {
    numSunSalutations = Math.min(
      Math.max(Math.floor(totalClassSec / (5 * 60)), 1),
      5
    );
  }

  const selectedSunSalutations = getPoses({
    count: numSunSalutations,
    poseType: PoseTypes.sunSalutations,
  });

  const unseparatedSunSalutations = selectedSunSalutations.flatMap((i) => i);

  return unseparatedSunSalutations;
}

function getStandingPoses(maxSec, poseDurationSec) {
  function partitionArray(array, partitionSize) {
    let partitioned = [];
    for (let i = 0; i < array.length; i += partitionSize) {
      partitioned.push(array.slice(i, i + partitionSize));
    }
    return partitioned;
  }

  // figure out how many poses we have time for, divided by 2 since we will repeat
  // todo handle cases where not even time for one?
  const numPoses = Math.floor(maxSec / poseDurationSec / 2);
  const poses = getPoses({ count: numPoses, poseType: PoseTypes.standing });

  // divide the poses into sets of 5 (or as close as possible)
  const posesPerSet = 5;
  const partitionedPoses = partitionArray(poses, posesPerSet);
  let standingSequence = [];
  for (let setIndex = 0; setIndex < partitionedPoses.length; setIndex++) {
    const setA = partitionedPoses[setIndex].map((pose) => ({
      ...pose,
      side: pose.bilateral ? "right" : "",
    }));
    const setB = partitionedPoses[setIndex].map((pose) => ({
      ...pose,
      side: pose.bilateral ? "left" : "",
    }));
    standingSequence = [...standingSequence, ...setA, ...setB];
  }

  return standingSequence;
}

export function getYogaSequence({
  totalSec,
  poseDurationSec,
  sunSalutationDurationSec,
  numSunSalutations,
  includeShavasana = true,
}) {
  const sunSalutations = getSunSalutations(numSunSalutations, totalSec);
  const sunSalutationSec = sunSalutations.length * sunSalutationDurationSec;

  // 20 sec shavasana for every 5 min, up to 3 min max
  // todo handle case of minimal selection
  const shavasanaSec = includeShavasana
    ? Math.min((totalSec / (5 * 60)) * 20, 3 * 60)
    : 0;

  // 30 sec closing poses for every 5 min, up to 5 min max
  const minFloorSec = Math.min((totalSec / (5 * 60)) * 30, 5 * 60);

  // Sets of standing poses fills the remaining time
  // todo handle case where this is <= 0?
  const maxStandingSec =
    totalSec - sunSalutationSec - minFloorSec - shavasanaSec;

  const standingSequence = getStandingPoses(maxStandingSec, poseDurationSec);

  // Fill the remaining time with floor poses (seated, floor front, reclining)
  const floorSec =
    totalSec -
    sunSalutationSec -
    shavasanaSec -
    standingSequence.length * poseDurationSec;
  const numClosingPoses = Math.round(floorSec / poseDurationSec);
  const numSeatedPoses = Math.floor(numClosingPoses / 3);
  const numFloorFrontPoses = Math.floor(numClosingPoses / 3);
  const numRecliningPoses = Math.ceil(numClosingPoses / 3);
  const seatedPoses = getPoses({
    count: numSeatedPoses,
    poseType: PoseTypes.sitting,
    matchSides: true,
  });
  const floorFrontPoses = getPoses({
    count: numFloorFrontPoses,
    poseType: PoseTypes.floorFront,
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
  for (let index = 0; index < sunSalutations.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: sunSalutations[index],
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
        type: PoseTypes.allFloor,
      },
    ];
    nextSecMark += poseDurationSec;
  }

  // Floor front
  for (let index = 0; index < floorFrontPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecMark,
        pose: floorFrontPoses[index],
        type: PoseTypes.allFloor,
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
        type: PoseTypes.allFloor,
      },
    ];
    nextSecMark += poseDurationSec;
  }

  // Shavasana
  fullSequence = includeShavasana
    ? [
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
      ]
    : fullSequence;

  return fullSequence;
}
