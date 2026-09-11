import React, { Suspense, lazy } from 'react';
import { LoaderCircle } from 'lucide-react';

const LazyImmersiveWorld = lazy(() =>
  import('../components/3d/immersive/ImmersiveWorld').then((m) => ({ default: m.ImmersiveWorld }))
);

/**
 * HomePage — True Immersive 3D Engineering Portfolio
 * 
 * The 3D world is the primary discovery interface.
 * Scroll choreography moves the visitor through the continuous engineering world.
 */
export const HomePage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fbfaf7] space-y-4 z-50">
          <LoaderCircle className="w-8 h-8 animate-spin text-stone-400" />
          <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">
            INITIALIZING 3D WORLD ARCHITECTURE...
          </span>
        </div>
      }
    >
      <LazyImmersiveWorld />
    </Suspense>
  );
};
