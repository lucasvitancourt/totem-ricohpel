"use client";

import { useState } from 'react';
import ClientWebcamWrapper from './components/ClientWebcamWrapper';
import StartScreen from './components/StartScreen';

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <div className="fair-container">
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
      <ClientWebcamWrapper />
      )}
    </div>
  );
}
