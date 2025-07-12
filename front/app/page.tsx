'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { DotLoader } from '@/components/ui/dot-loader';

const loaderFrames = [
  [24], [24, 31], [24, 31, 38], [24, 31, 38, 45], [24, 31, 38, 45, 39], [24, 31, 38, 45, 39, 32],
  [24, 31, 38, 45, 39, 32, 25], [31, 38, 45, 39, 32, 25, 18], [38, 45, 39, 32, 25, 18, 11],
  [45, 39, 32, 25, 18, 11, 4], [39, 32, 25, 18, 11, 4, 3], [32, 25, 18, 11, 4, 3, 2],
  [25, 18, 11, 4, 3, 2, 1], [18, 11, 4, 3, 2, 1, 8], [11, 4, 3, 2, 1, 8, 15],
  [4, 3, 2, 1, 8, 15, 22], [3, 2, 1, 8, 15, 22, 29], [2, 1, 8, 15, 22, 29, 36],
  [1, 8, 15, 22, 29, 36, 43], [8, 15, 22, 29, 36, 43, 42], [15, 22, 29, 36, 43, 42, 41],
  [22, 29, 36, 43, 42, 41, 40], [29, 36, 43, 42, 41, 40, 33], [36, 43, 42, 41, 40, 33, 26],
  [43, 42, 41, 40, 33, 26, 19], [42, 41, 40, 33, 26, 19, 12], [41, 40, 33, 26, 19, 12, 5],
  [40, 33, 26, 19, 12, 5, 6], [33, 26, 19, 12, 5, 6, 13], [26, 19, 12, 5, 6, 13, 20],
  [19, 12, 5, 6, 13, 20, 27], [12, 5, 6, 13, 20, 27, 34], [5, 6, 13, 20, 27, 34, 41],
  [6, 13, 20, 27, 34, 41, 48], [13, 20, 27, 34, 41, 48], [20, 20, 27, 34, 41, 48],
  [27, 34, 41, 48], [34, 41, 48], [41, 48], [48], [],
];

const Loader = () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
      <DotLoader frames={loaderFrames} duration={50} />
    </div>
);

const CanvasScene = dynamic(() => import('@/components/canvas-scene'), {
  ssr: false,
  loading: () => <Loader />,
});


export const LandingPage = () => {
  const title = 'Own a Piece of the Action.';
  const subtitle = 'The RWA platform for sports & entertainment collectibles, powered by Chiliz.';

  return (
    <div className="h-svh bg-black relative">
      <div className="h-svh uppercase items-center w-full absolute z-10 pointer-events-none px-10 flex justify-center flex-col text-center">
        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-white">
          {title}
        </div>
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 text-white font-bold normal-case">
            {subtitle}
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
        <ConnectWalletButton />
      </div>


      <div className="absolute inset-0 z-0">
        <CanvasScene />
      </div>
    </div>
  );
};

export default LandingPage;

