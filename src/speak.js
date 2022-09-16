export default function speak(text) {
  let speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
}
