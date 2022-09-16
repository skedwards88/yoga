// import sunSalutations from "./sunSalutations.json";
// import standingPoses from "./standing.json"
// import sittingPoses from "./sitting.json"
// import recliningPoses from "./reclining.json"
// import armBalancePoses from "./armBalance.json"

const sunSalutations = [
  ["sun1", "sun11"],
  ["sun2", "sun22"],
];
const standingPoses = ["stand1", "stand2", "stand3"];
const sittingPoses = ["sit1", "sit2", "sit3"];
const recliningPoses = ["lay1", "lay2", "lay3"];
const armBalancePoses = ["arm1", "arm2", "arm3"];

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

function getYogaSequence({
  totalSeconds,
  poseDurationSeconds,
  sunSalutationDurationSeconds,
}) {
  // todo arm balances

  // One sun salutation for every 5 min,
  // but at least one and no more than 5
  const numSalutations = Math.min(
    Math.max(Math.floor(totalSeconds / (5 * 60)), 1),
    5
  );
  const selectedSunSalutations = getPoses(
    numSalutations,
    PoseTypes.sunSalutations
  );
  const unseparatedSunSalutations = selectedSunSalutations.flatMap((i) => i);
  const sunSalutationSeconds =
    unseparatedSunSalutations.length * sunSalutationDurationSeconds;

  // 30 sec closing poses for every 5 min, up to 5 min max
  const minClosingSeconds = Math.min((totalSeconds / (5 * 60)) * 30, 5 * 60);

  // 20 sec shavasana for every 5 min, up to 3 min max
  const shavasanaSeconds = Math.min((totalSeconds / (5 * 60)) * 20, 3 * 60);

  // Sets of standing poses fills the remaining time
  const maxStandingSeconds =
    totalSeconds - sunSalutationSeconds - minClosingSeconds - shavasanaSeconds;
  // todo handle case where this is <= 0?

  // A set consists of 5 poses, repeated twice
  // Calculate how much time a set will take based on how long each pose will last
  // todo handle case where not even time for one set
  const posesPerSet = 5;
  const standingSeconds = posesPerSet * 2 * poseDurationSeconds;
  const numSets = Math.floor(maxStandingSeconds / standingSeconds);
  let standingSequence = [];
  for (let index = 0; index < numSets; index++) {
    let set = getPoses(posesPerSet, PoseTypes.standing);
    const setA = set.map((pose) => ({
      pose,
      side: pose.bilateral ? "right" : "",
    }));
    const setB = set.map((pose) => ({
      pose,
      side: pose.bilateral ? "left" : "",
    }));
    standingSequence = [...standingSequence, ...setA, ...setB];
  }

  // Fill the remaining time with seated and reclining poses
  const closingSeconds =
    totalSeconds - sunSalutationSeconds - shavasanaSeconds - standingSeconds;
  const numClosingPoses = Math.round(closingSeconds / poseDurationSeconds);
  const numSeatedPoses = Math.floor(numClosingPoses);
  const numRecliningPoses = Math.ceil(numClosingPoses);
  const seatedPoses = getPoses(numSeatedPoses, PoseTypes.sitting);
  const recliningPoses = getPoses(numRecliningPoses, PoseTypes.reclining);

  // Assemble the selected poses into a timed list
  let fullSequence = [];
  let nextSecondsMark = 0;

  // Sun salutations
  for (let index = 0; index < unseparatedSunSalutations.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecondsMark,
        pose: unseparatedSunSalutations[index],
      },
    ];
    nextSecondsMark += sunSalutationDurationSeconds;
  }

  // Standing
  for (let index = 0; index < standingSequence.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecondsMark,
        pose: standingSequence[index],
      },
    ];
    nextSecondsMark += poseDurationSeconds;
  }

  // Seated
  for (let index = 0; index < seatedPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecondsMark,
        pose: seatedPoses[index],
      },
    ];
    nextSecondsMark += poseDurationSeconds;
  }

  // Reclining
  for (let index = 0; index < recliningPoses.length; index++) {
    fullSequence = [
      ...fullSequence,
      {
        time: nextSecondsMark,
        pose: recliningPoses[index],
      },
    ];
    nextSecondsMark += poseDurationSeconds;
  }

  // Shavasana
  fullSequence = [
    ...fullSequence,
    {
      time: nextSecondsMark,
      pose: {
        sanskrit: "Shavasana",
        english: "Corpse",
        type: "Reclining",
        spine: "",
        bilateral: false,
      },
    },
    {
      time: nextSecondsMark + shavasanaSeconds,
      pose: undefined, //todo is this how to end? maybe namaste instead?
    },
  ];

  console.log(JSON.stringify(fullSequence));
  return fullSequence;
}

getYogaSequence({
  totalSeconds: 15 * 60,
  poseDurationSeconds: 30,
  sunSalutationDurationSeconds: 2,
});
