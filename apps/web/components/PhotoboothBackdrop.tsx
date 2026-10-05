import React from 'react';
import { ViewfinderFrame } from './art/ViewfinderFrame.tsx';
import { GrainOverlay } from './GrainOverlay.tsx';

export const PhotoboothBackdrop: React.FC = () => {
  return (
    <>
      {/* Global Film Grain Filter */}
      <GrainOverlay />

      {/* 4 Clean Viewfinder Corner Marks Only */}
      <ViewfinderFrame />
    </>
  );
};
