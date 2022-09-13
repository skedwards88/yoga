// import sunSalutations from "./sunSalutations.json";
// import standingPoses from "./standing.json"
// import sittingPoses from "./sitting.json"
// import recliningPoses from "./reclining.json"
// import armBalancePoses from "./armBalance.json"

const sunSalutations = [["sun1","sun11"],["sun2","sun22"]]
const standingPoses = ["stand1","stand2","stand3"]
const sittingPoses = ["sit1","sit2","sit3"]
const recliningPoses = ["lay1","lay2","lay3"]
const armBalancePoses = ["arm1","arm2","arm3"]

const PoseTypes = {
  sunSalutations: "sunSalutations",
  standing: "standing",
  sitting: "sitting",
  reclining: "reclining",
  armBalance: "armBalance",
};

function getPoses(count, poseType) {
  let allPoses
  switch (poseType) {
    case PoseTypes.sunSalutations:
      allPoses = sunSalutations
      break;

    case PoseTypes.standing:
      allPoses = standingPoses
      break;

    case PoseTypes.sitting:
      allPoses = sittingPoses
      break;

    case PoseTypes.reclining:
      allPoses = recliningPoses
      break;

    case PoseTypes.armBalance:
      allPoses = armBalancePoses
      break;

    default:
      console.log('Pose type not found') // todo error?
      allPoses = [...standingPoses, ...sittingPoses, ...recliningPoses, ...armBalancePoses]
  }
  let selectedPoses = []
  let primarySelectionList = JSON.parse(JSON.stringify(allPoses)); //todo shuffle. or pick random instead of pop
  let secondarySelectionList = []
  for (let index = 0; index < count; index++) {
    if (!primarySelectionList.length) {
      primarySelectionList = secondarySelectionList;
      secondarySelectionList = []
    }
    const pose = primarySelectionList.pop()
    secondarySelectionList = [...secondarySelectionList, pose]
    selectedPoses = [...selectedPoses, pose]
  }
  return selectedPoses
}

function getYogaSequence({totalMinutes, poseSeconds, sunSalutationSeconds}) {

  // todo arm balances

  // One sun salutation for every 5 min,
  // but at least one and no more than 5
  const numSalutations = Math.min(Math.max(Math.floor(totalMinutes / 5), 1), 5);
  const selectedSunSalutations = getPoses(numSalutations, PoseTypes.sunSalutations);
  const unseparatedSunSalutations = selectedSunSalutations.flatMap(i => i)
  const sunSalutationMinutes = unseparatedSunSalutations.length * sunSalutationSeconds;

  // 0.5 min closing poses for every 5 min, up to 5 min max
  const minClosingMinutes = Math.min(((totalMinutes / 5) * 0.5), 5);

  // 0.3 min shavasana for every 5 min, up to 3 min max
  const shavasanaMinutes = Math.min(((totalMinutes / 5) * 0.3), 3)

  // Sets of standing poses fills the remaining time
  const maxStandingMinutes = totalMinutes - sunSalutationMinutes - minClosingMinutes - shavasanaMinutes;
  // todo handle case where this is <= 0?

  // A set consists of 5 poses, repeated twice
  // Calculate how much time a set will take based on how long each pose will last
  // todo handle case where not even time for one set
  const posesPerSet = 5;
  const standingMinutes = (posesPerSet * 2 * poseSeconds) / 60;
  const numSets = Math.floor(maxStandingMinutes / standingMinutes);
  const standingSequence = []
  for (let index = 0; index < numSets; index++) {
    let set = getPoses(posesPerSet, PoseTypes.standing)
    const setA = set.map(pose => ({ ...pose, side: pose.bilateral ? "right" : "" }))
    const setB = set.map(pose => ({ ...pose, side: pose.bilateral ? "left" : "" }))
    standingSequence = [...standingSequence, ...setA, ...setB]
  }

  // Fill the remaining time with seated and reclining poses
  const closingMin = totalMinutes - sunSalutationMinutes - shavasanaMinutes - standingMinutes;
  const numClosingPoses = Math.round((closingMin * 60) / poseSeconds);
  const numSeatedPoses = Math.floor(numClosingPoses);
  const numRecliningPoses = Math.ceil(numClosingPoses);
  const seatedPoses = getPoses(numSeatedPoses, PoseTypes.sitting);
  const recliningPoses = getPoses(numRecliningPoses, PoseTypes.reclining);

  // Assemble the selected poses into a timed list
  let fullSequence = []
  let nextSecondsMark = 0

  // Sun salutations
  for (let index = 0; index < unseparatedSunSalutations.length; index++) {
    fullSequence = [...fullSequence, {
      time: nextSecondsMark,
      pose: unseparatedSunSalutations[index]
    }]
    nextSecondsMark += sunSalutationSeconds
  }

  // Standing
  for (let index = 0; index < standingSequence.length; index++) {
    fullSequence = [...fullSequence, {
      time: nextSecondsMark,
      pose: standingSequence[index]
    }]
    nextSecondsMark += poseSeconds
  }

  // Seated
  for (let index = 0; index < seatedPoses.length; index++) {
    fullSequence = [...fullSequence, {
      time: nextSecondsMark,
      pose: seatedPoses[index]
    }]
    nextSecondsMark += poseSeconds
  }

  // Reclining
  for (let index = 0; index < recliningPoses.length; index++) {
    fullSequence = [...fullSequence, {
      time: nextSecondsMark,
      pose: recliningPoses[index]
    }]
    nextSecondsMark += poseSeconds
  }

  // Shavasana
  fullSequence = [...fullSequence, {
    time: nextSecondsMark,
    pose: {
      "sanskrit": "Shavasana",
      "english": "Corpse",
      "type": "Reclining",
      "spine": "",
      "bilateral": false
    }
  },
  {
    time: nextSecondsMark + shavasanaMinutes,
    pose: undefined //todo is this how to end? maybe namaste instead?
  }]

  console.log(JSON.stringify(fullSequence))
  return fullSequence
}

getYogaSequence({totalMinutes:5, poseSeconds:30, sunSalutationSeconds:2})