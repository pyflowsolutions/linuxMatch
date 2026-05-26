'use client';

import React from 'react';
import Link from 'next/link';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { ALL_DISTROS } from './distroData';
import { useDistroFilter } from './useDistroFilter';

export default function CompareBar() {
  const { filters, toggleCompare, clearCompare } = useDistroFilter();
  const compareDistros = ALL_DISTROS?.filter((d) => filters?.compareIds?.includes(d?.id));

  if (compareDistros?.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up">
      <div className="bg-foreground/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <GitCompare size={16} className="text-white/70" />
              <span className="text-sm font-semibold text-white">
                Comparing {compareDistros?.length}/3
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {compareDistros?.map((d) => (
                <div
                  key={`compare-chip-${d?.id}`}
                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-2xs font-bold"
                    style={{ backgroundColor: d?.logoColor }}
                  >
                    {d?.logoInitials?.[0]}
                  </div>
                  <span className="text-sm font-semibold text-white">{d?.name}</span>
                  <button
                    onClick={() => toggleCompare(d?.id)}
                    className="text-white/50 hover:text-white transition-colors"
                    aria-label={`Remove ${d?.name} from comparison`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              {compareDistros?.length < 3 && (
                <div className="flex items-center gap-2 border border-white/20 border-dashed rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white/40">
                    + Add {3 - compareDistros?.length} more
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={clearCompare}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Clear all
              </button>
              {compareDistros?.length >= 2 && (
                <Link
                  href="/distro-detail"
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Compare Now
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}