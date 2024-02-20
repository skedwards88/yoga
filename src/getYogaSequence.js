import allSunSalutations from "./asanas/sunSalutations.json";
import vinyasaPoses from "./asanas/vinyasa.json";
import allStandingPoses from "./asanas/standing.json";
import allSittingPoses from "./asanas/sitting.json";
import allFloorFrontPoses from "./asanas/floorFront.json";
import allRecliningPoses from "./asanas/reclining.json";
import allArmBalancePoses from "./asanas/armBalance.json";
import shuffleArray from "./shuffleArray";
import {PoseTypes} from "./PoseTypes";

function getPoses({count, poseType, matchSides = false}) {
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
      console.error("Pose type not found");
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
        {...pose, side: "first"},
        {...pose, side: "second"},
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
  if (numSunSalutations === "auto") {
    numSunSalutations = Math.min(
      Math.max(Math.floor(totalClassSec / (5 * 60)), 1),
      5,
    );
  }

  const selectedSunSalutations = getPoses({
    count: numSunSalutations,
    poseType: PoseTypes.sunSalutations,
  });

  const unseparatedSunSalutations = selectedSunSalutations.flatMap((i) => i);

  return unseparatedSunSalutations;
}

function getStandingPoses(maxSec, poseDurationSec, vinyasaDuration) {
  function partitionArray(array, partitionSize) {
    let partitioned = [];
    for (let i = 0; i < array.length; i += partitionSize) {
      partitioned.push(array.slice(i, i + partitionSize));
    }
    return partitioned;
  }

  // figure out how many poses we have time for, divided by 2 since we will repeat
  // one set is 5 poses/side + vinyasana
  const setLength = poseDurationSec * 2 * 5 + vinyasaDuration;
  const numCompleteSets = Math.floor(maxSec / setLength);
  const remainingTime = maxSec % setLength;
  // If we have enough time remaining for 4 more poses + vinyasana, add them
  let numFillerPoses = 0;
  if (remainingTime - vinyasaDuration > poseDurationSec * 4) {
    numFillerPoses =
      Math.floor(
        Math.floor((remainingTime - vinyasaDuration) / poseDurationSec) / 2,
      ) * 2;
    if (numFillerPoses < 4) {
      numFillerPoses = 0;
    }
  }
  // Divide the number of poses by 2 since we will repeat
  const numPoses = (numCompleteSets * 10 + numFillerPoses) / 2;

  // if we don't really have time for any poses, return early
  if (numPoses < 2) return [];

  const poses = getPoses({count: numPoses, poseType: PoseTypes.standing});

  // divide the poses into sets of 5 (or as close as possible)
  const posesPerSet = 5;
  let partitionedPoses = partitionArray(poses, posesPerSet);
  // If the last set of poses is only one pose, omit it
  partitionedPoses =
    partitionedPoses[partitionedPoses.length - 1].length === 1
      ? partitionedPoses.slice(0, partitionedPoses.length - 1)
      : partitionedPoses;

  let standingSequence = [];
  for (let setIndex = 0; setIndex < partitionedPoses.length; setIndex++) {
    const setA = partitionedPoses[setIndex].map((pose) => ({
      ...pose,
      side: pose.bilateral ? "first" : "",
    }));
    const setB = partitionedPoses[setIndex].map((pose) => ({
      ...pose,
      side: pose.bilateral ? "second" : "",
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
  includeVinyasas = true,
}) {
  const sunSalutations = getSunSalutations(numSunSalutations, totalSec);
  const sunSalutationSec = sunSalutations.length * sunSalutationDurationSec;

  // 20 sec shavasana for every 5 min, up to 3 min max
  const shavasanaSec = includeShavasana
    ? Math.min((totalSec / (5 * 60)) * 20, 3 * 60)
    : 0;

  // 20% of time is closing poses
  const minFloorSec = Math.floor(totalSec * 0.2);

  // Sets of standing poses fills the remaining time
  const maxStandingSec = Math.max(
    0,
    totalSec - sunSalutationSec - minFloorSec - shavasanaSec,
  );

  const vinyasaDuration = includeVinyasas ? sunSalutationDurationSec * 4 : 0;

  const standingSequence =
    maxStandingSec > 0
      ? getStandingPoses(maxStandingSec, poseDurationSec, vinyasaDuration)
      : [];

  // Fill the remaining time with floor poses (seated, floor front, reclining)
  const floorSec =
    totalSec -
    sunSalutationSec -
    shavasanaSec -
    standingSequence.length * poseDurationSec -
    Math.ceil(standingSequence.length / 10) * vinyasaDuration;
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

  // Sun salutations
  for (let index = 0; index < sunSalutations.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        pose: sunSalutations[index],
        type: PoseTypes.sunSalutations,
        duration: sunSalutationDurationSec,
      },
    ];
  }

  // Standing
  for (let index = 0; index < standingSequence.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        pose: standingSequence[index],
        type: PoseTypes.standing,
        duration: poseDurationSec,
      },
    ];
    // If at end of set (index 9 multiple) or last index, insert vinyasa if requested
    if (
      includeVinyasas &&
      (index % 10 === 9 || index === standingSequence.length - 1)
    ) {
      for (
        let vinyasaIndex = 0;
        vinyasaIndex < vinyasaPoses.length;
        vinyasaIndex++
      ) {
        fullSequence = [
          ...fullSequence,
          {
            pose: vinyasaPoses[vinyasaIndex],
            type: PoseTypes.standing,
            duration: sunSalutationDurationSec,
          },
        ];
      }
    }
  }

  // Seated
  for (let index = 0; index < seatedPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        pose: seatedPoses[index],
        type: PoseTypes.allFloor,
        duration: poseDurationSec,
      },
    ];
  }

  // Floor front
  for (let index = 0; index < floorFrontPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        pose: floorFrontPoses[index],
        type: PoseTypes.allFloor,
        duration: poseDurationSec,
      },
    ];
  }

  // Reclining
  for (let index = 0; index < recliningPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        pose: recliningPoses[index],
        type: PoseTypes.allFloor,
        duration: poseDurationSec,
      },
    ];
  }

  // Shavasana
  fullSequence = includeShavasana
    ? [
        ...fullSequence,
        {
          pose: {
            sanskrit: "Shavasana",
            english: "Corpse",
            type: "Reclining",
            spine: "",
            bilateral: false,
          },
          type: "shavasana",
          duration: shavasanaSec,
        },
      ]
    : fullSequence;

  return fullSequence;
}
