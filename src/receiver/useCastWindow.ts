import { useEffect } from 'react';
import { receiverClient } from './receiverClient';

/** Full screen while casting, and the screen stays on while a Mac is connected. */
export function useCastWindow(casting: boolean, connected: boolean) {
  useEffect(() => {
    receiverClient.setImmersive(casting);
  }, [casting]);

  useEffect(() => {
    receiverClient.setKeepAwake(connected);
  }, [connected]);
}
