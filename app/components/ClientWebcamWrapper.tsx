'use client';

import dynamic from 'next/dynamic';

const WebcamCapture = dynamic(() => import('./WebcamCapture'), {
  ssr: false
});

export default function ClientWebcamWrapper() {
  return <WebcamCapture />;
} 