import React from 'react';
import { Plant } from '@shared/interface';

interface LossTreeSectionProps {
  plant: Plant;
}

export function LossTreeSection({ plant }: LossTreeSectionProps) {
  return (
    <div className="p-6 bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Loss Tree Analysis</h2>
      <p className="text-gray-600">Loss tree analysis for {plant.name} - coming soon.</p>
    </div>
  );
}
