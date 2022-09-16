import React from "react";

export default function Home({ setShowSettings }) {
  const homeScreenPhrases = [
    // todo add more?
    "Mindfulness takes practice",
  ];

  return (
    <div id="home">
      <div>
        {
          homeScreenPhrases[
            Math.floor(Math.random() * homeScreenPhrases.length)
          ]
        }
      </div>
      <div id="mascot"></div>
      <button
        onClick={() => {
          // ios won't speak unless the user clicks something first that directly causes speech
          // so do this hack of saying nothing
          let speech = new SpeechSynthesisUtterance("");
          window.speechSynthesis.speak(speech);

          setShowSettings(true);
        }}
      >
        Begin
      </button>
    </div>
  );
}
