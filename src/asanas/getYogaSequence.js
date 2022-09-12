import sunSalutations from "./sunSalutations.json";
import standingPoses from "./standing.json"
import sittingPoses from "./sitting.json"
import recliningPoses from "./reclining.json"
import armBalancePoses from "./armBalance.json"

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

  const selectedPoses = []
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

function getYogaSequence(totalMinutes, poseSeconds, sunSalutationSeconds, includeArmBalances) {
  //
  // Sun salutations
  //

  // One sun salutation for every 5 min
  // But at least one and no more than 5
  const numSalutations = Math.min(Math.max(Math.floor(totalMinutes / 5), 1), 5);
  const selectedSunSalutations = getPoses(numSalutations, PoseTypes.sunSalutations);

  const sunSalutationMinutes = selectedSunSalutations.flatMap(i=>i).length * sunSalutationSeconds;


  //
  // Closing
  //

  // 0.5 min closing poses for every 5 min, up to 5 min max
  const closingMinutes = Math.min(((totalMinutes / 5) * 0.5), 5);
  const numClosingPoses = Math.round((closingMinutes * 60) / poseSeconds); // todo plus remaining time if not enought time for full standing set

  const closingPoses = [] // todo

  //
  // Shavasana
  //

  // 0.3 min closing poses for every 5 min, up to 3 min max
  const shavasanaMinutes = Math.min(((totalMinutes / 5) * 0.3), 3)

  //
  // Standing
  //

  // Sets of standing poses fills the remaining time
  const maxStandingMinutes = totalMinutes - sunSalutationMinutes - closingMinutes - shavasanaMinutes;

  // todo handle case where this is <= 0?

  // A set consists of 5 poses, repeated twice
  // Calculate how much time a set will take based on how long each pose will last
  const posesPerSet = 5;
  const setMinutes = (posesPerSet * 2 * poseSeconds) / 60;
  const numSets = Math.floor(maxStandingMinutes / setMinutes);
  const standingSequence = []
  for (let index = 0; index < numSets; index++) {
    let set = getPoses(posesPerSet, PoseTypes.standing)
    const setA = set.map(pose => ({...pose, side: pose.bilateral ? "right" : ""}))
    const setB = set.map(pose => ({...pose, side: pose.bilateral ? "left" : ""}))
    standingSequence = [...standingSequence, ...setA, ...setB]
  }

  // todo handle case where not even time for one set


  return [
    [2,"standing"],
    [4,"forward fold"],
    [6,"lunge right"],
    [10,"down dog"],
    [12,"lunge left"],
  ]
  return {
    sunSalutations: [
      ["chair", "plank"],
      ["down dog", "plank"],
    ],
    standingSequence: [
      ["warrior", "cat", "dancer"],
      ["warrior", "cat", "dancer"],
      ["triangle", "pyramid", "monkey"],
      ["triangle", "pyramid", "monkey"],
    ],
    closing: ["seated twist", "bridge", "plow"],
    shavasanaMinutes: shavasanaMinutes,
  }

  return {
    sunSalutations: selectedSunSalutations, // go through poses, poselen/5 per
    standingSequence: standingSequence, // play as is, pose len per, alt right/left
    shavasanaMinutes: shavasanaMinutes, // play for time

  }
}
