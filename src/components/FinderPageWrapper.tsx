'use client';

import React from 'react';
import { FilterProvider } from './useDistroFilter';
import FilterSidebar from './FilterSidebar';
import DistroResultsPanel from './DistroResultsPanel';
import CompareBar from './CompareBar';

export default function FinderPageWrapper() {
  return (
    <FilterProvider>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1.5">
            Find Your Linux Distribution
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Filter by your hardware specs and use case to discover which Linux
            distributions are compatible with your machine. Compare up to 3
            distros side-by-side.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 pb-20">
          <FilterSidebar />
          <DistroResultsPanel />
        </div>
        <CompareBar />
      </div>
    </FilterProvider>
  );
}