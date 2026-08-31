'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { normalizeIsbnInput } from '@/lib/utils/isbn';

export default function BarcodeScanner({
  onDetected,
  onError,
}: {
  onDetected: (isbn: string) => void;
  onError: (message: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result, err, ctrl) => {
          controls = ctrl;
          if (stopped) return;
          if (result) {
            const isbn = normalizeIsbnInput(result.getText());
            if (isbn.length >= 10) {
              stopped = true;
              ctrl.stop();
              onDetected(isbn);
            }
          }
        }
      )
      .then(() => setActive(true))
      .catch((e) => {
        onError(
          e?.name === 'NotAllowedError'
            ? 'Camera permission denied. Use manual search instead.'
            : 'Could not access the camera. Use manual search instead.'
        );
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border">
      <video ref={videoRef} className="w-full" muted playsInline />
      {!active && (
        <p className="p-2 text-center text-xs text-muted-foreground">Starting camera…</p>
      )}
    </div>
  );
}
