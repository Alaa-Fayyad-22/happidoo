"use client";

import { useEffect, useState } from "react";

export default function LottieHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load web component only in the browser
    import("@lottiefiles/lottie-player").then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-[300px] h-[300px] rounded-3xl bg-black/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <lottie-player
        src="https://lottie.host/3ca38634-cf13-489d-b5a2-caeee6e8896f/rqjD9eLKVC.json"
        background="transparent"
        speed="1"
        loop
        autoplay
        style={{ width: "300px", height: "300px" }}
      />
    </div>
  );
}
