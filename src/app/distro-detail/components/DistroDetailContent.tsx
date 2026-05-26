'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Star,
  ExternalLink,
  Share2,
  BookmarkPlus,
  Calendar,
  Package,
  Cpu,
  MemoryStick,
  HardDrive,
  Users,
  Shield,
  Terminal,
  ChevronRight,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  CheckSquare,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { ALL_DISTROS, USE_CASE_CONFIG, Distro, UseCase } from '../../components/distroData';
import Badge from '@/components/ui/Badge';
import DistroRadarChart from './DistroRadarChart';
import RatingBreakdownChart from './RatingBreakdownChart';
import Icon from '@/components/ui/AppIcon';


const DISTRO = ALL_DISTROS.find((d) => d.id === 'distro-001') as Distro;
const SIMILAR_DISTROS = ALL_DISTROS.filter((d) =>
  ['distro-004', 'distro-006', 'distro-002', 'distro-010'].includes(d.id)
);

const TABS = ['Overview', 'Specifications', 'Reviews', 'Versions', 'Similar'] as const;
type Tab = (typeof TABS)[number];

function ramLabel(mb: number) {
  return mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={`star-${s}`}
          size={size}
          className={
            s <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400' :'text-muted-foreground/25'
          }
        />
      ))}
    </div>
  );
}

function compatColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 65) return 'text-warning';
  return 'text-danger';
}

export default function DistroDetailContent() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 py-4 text-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Distro Finder
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/50" />
        <span className="text-foreground font-semibold">{DISTRO.name}</span>
      </div>

      {/* Hero Header */}
      <div className="bg-card rounded-2xl border border-border card-shadow-md mb-6 overflow-hidden">
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(90deg, ${DISTRO.logoColor}, ${DISTRO.logoColor}55)`,
          }}
        />
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-5 flex-1">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0 card-shadow-md"
                style={{ backgroundColor: DISTRO.logoColor }}
              >
                {DISTRO.logoInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-foreground">{DISTRO.name}</h1>
                  <Badge variant="success">{DISTRO.releaseModel}</Badge>
                  {DISTRO.isPopular && <Badge variant="primary">Popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{DISTRO.tagline}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Package size={13} />
                    <span className="font-mono font-semibold text-foreground">
                      v{DISTRO.latestVersion}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Released {DISTRO.releaseDate}</span>
                  </div>
                  {DISTRO.basedOn && (
                    <div className="flex items-center gap-1.5">
                      <Terminal size={13} />
                      <span>
                        Based on{' '}
                        <span className="font-semibold text-foreground">{DISTRO.basedOn}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users size={13} />
                    <span>{DISTRO.reviewCount.toLocaleString()} reviews</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              <div className="bg-muted/50 rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-3xl font-extrabold text-foreground tabular-nums mb-1">
                  {DISTRO.communityRating.toFixed(1)}
                </div>
                <StarRating rating={DISTRO.communityRating} size={12} />
                <p className="text-2xs text-muted-foreground mt-1">Community rating</p>
              </div>
              <div className="bg-success-light rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-3xl font-extrabold text-success tabular-nums mb-1">
                  {DISTRO.compatibilityScore}%
                </div>
                <p className="text-2xs text-success/80 font-semibold">Compatibility</p>
                <p className="text-2xs text-success/60 mt-0.5">score</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
            {DISTRO.useCases.map((uc) => {
              const cfg = USE_CASE_CONFIG[uc];
              return (
                <span
                  key={`hero-uc-${uc}`}
                  className={`badge-use-case ${cfg.bg} ${cfg.color} text-sm`}
                >
                  {cfg.label}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a href="#" className="btn-primary gap-2">
              <Download size={15} />
              Download {DISTRO.name}
            </a>
            <a href="#" className="btn-secondary gap-2">
              <ExternalLink size={15} />
              Official Website
            </a>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`btn-ghost gap-2 ${bookmarked ? 'text-primary' : ''}`}
            >
              <BookmarkPlus size={15} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button className="btn-ghost gap-2">
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border px-6 lg:px-8 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-0">
            {TABS.map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`tab-item relative ${
                  activeTab === tab ? 'tab-item-active' : 'tab-item-inactive'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in pb-10">
        {activeTab === 'Overview' && <OverviewTab />}
        {activeTab === 'Specifications' && <SpecificationsTab />}
        {activeTab === 'Reviews' && <ReviewsTab />}
        {activeTab === 'Versions' && <VersionsTab />}
        {activeTab === 'Similar' && <SimilarTab />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─────────────────────────────────────────── */
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 card-shadow">
          <h2 className="text-base font-semibold text-foreground mb-3">About {DISTRO.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{DISTRO.description}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 card-shadow">
          <h2 className="text-base font-semibold text-foreground mb-1">Distribution Profile</h2>
          <p className="text-xs text-muted-foreground mb-4">
            How {DISTRO.name} scores across key attributes
          </p>
          <DistroRadarChart distro={DISTRO} />
        </div>

        <div className="bg-card rounded-xl border border-border p-6 card-shadow">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Available Desktop Environments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DISTRO.desktopEnvironments.map((de, idx) => (
              <div
                key={`de-${de}`}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  idx === 0
                    ? 'border-primary/30 bg-primary-light/50' :'border-border bg-muted/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    idx === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Terminal size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{de}</p>
                  {idx === 0 && <p className="text-2xs text-primary">Default</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attribute Scores</h3>
          <div className="space-y-3">
            {[
              { label: 'Ease of Use', value: DISTRO.easeOfUse, icon: Users },
              { label: 'Hardware Efficiency', value: DISTRO.hardwareEfficiency, icon: Cpu },
              { label: 'Stability', value: DISTRO.stabilityScore, icon: Shield },
              { label: 'Community Size', value: DISTRO.communitySize, icon: Users },
              { label: 'Documentation', value: DISTRO.documentationScore, icon: BookmarkPlus },
            ].map(({ label, value, icon: Icon }) => (
              <div key={`score-${label}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon size={11} />
                    {label}
                  </div>
                  <span className="text-xs font-bold tabular-nums text-foreground">{value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      background:
                        value >= 85
                          ? 'var(--success)'
                          : value >= 65
                          ? 'var(--primary)'
                          : 'var(--warning)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Info</h3>
          <div className="space-y-3">
            {[
              {
                label: 'Package Manager',
                value: DISTRO.packageManager.join(', '),
                mono: true,
              },
              { label: 'Release Model', value: DISTRO.releaseModel, mono: false },
              {
                label: 'Base System',
                value: DISTRO.basedOn ?? 'Independent',
                mono: false,
              },
              {
                label: 'Architectures',
                value: DISTRO.architectures.join(', '),
                mono: true,
              },
              { label: 'Latest Version', value: DISTRO.latestVersion, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={`info-${label}`} className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span
                  className={`text-xs font-semibold text-foreground text-right ${
                    mono ? 'font-mono' : ''
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pros & Considerations</h3>
          <div className="space-y-2">
            {[
              { text: 'Excellent hardware support out of the box', positive: true },
              { text: 'Massive community and documentation', positive: true },
              { text: 'Long-term support releases available', positive: true },
              { text: 'GNOME 46 modern desktop experience', positive: true },
              { text: 'Snap packages load slowly', positive: false },
              { text: 'Higher RAM usage than lightweight alternatives', positive: false },
            ].map(({ text, positive }, i) => (
              <div key={`pro-${i + 1}`} className="flex items-start gap-2">
                {positive ? (
                  <CheckCircle size={13} className="text-success mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={13} className="text-warning mt-0.5 shrink-0" />
                )}
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Specifications Tab ──────────────────────────────────── */
function SpecificationsTab() {
  const ALL_USE_CASES: UseCase[] = [
    'Beginner-Friendly',
    'Gaming',
    'Development',
    'Privacy',
    'Server',
    'Education',
    'Multimedia',
    'Lightweight',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hardware Requirements */}
      <div className="bg-card rounded-xl border border-border p-6 card-shadow">
        <h2 className="text-base font-semibold text-foreground mb-5">Hardware Requirements</h2>
        <div className="space-y-4">
          {[
            {
              icon: MemoryStick,
              label: 'RAM',
              min: ramLabel(DISTRO.minRamMb),
              recommended: ramLabel(DISTRO.recommendedRamMb),
              minOk: DISTRO.minRamMb <= 2048,
            },
            {
              icon: HardDrive,
              label: 'Storage',
              min: `${DISTRO.minStorageGb}GB`,
              recommended: `${DISTRO.recommendedStorageGb}GB`,
              minOk: DISTRO.minStorageGb <= 25,
            },
            {
              icon: Cpu,
              label: 'CPU Cores',
              min: `${DISTRO.minCpuCores} core${DISTRO.minCpuCores > 1 ? 's' : ''}`,
              recommended: '4 cores',
              minOk: DISTRO.minCpuCores <= 2,
            },
          ].map(({ icon: Icon, label, min, recommended, minOk }) => (
            <div
              key={`spec-${label}`}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xs text-muted-foreground mb-0.5">Minimum</p>
                    <p
                      className={`text-sm font-bold font-mono tabular-nums ${
                        minOk ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {min}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-muted-foreground mb-0.5">Recommended</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-foreground">
                      {recommended}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Managers */}
      <div className="bg-card rounded-xl border border-border p-6 card-shadow">
        <h2 className="text-base font-semibold text-foreground mb-5">Package Management</h2>
        <div className="space-y-3">
          {DISTRO.packageManager.map((pm) => (
            <div
              key={`pm-${pm}`}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Terminal size={14} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold font-mono text-foreground">{pm}</p>
                  <p className="text-2xs text-muted-foreground">
                    {pm === 'apt' ?'Advanced Package Tool'
                      : pm === 'flatpak' ?'Universal package format'
                      : pm === 'dnf' ?'Dandified YUM'
                      : pm === 'pacman' ?'Arch package manager'
                      : pm === 'zypper' ?'openSUSE package manager'
                      : pm === 'nix' ?'Declarative package manager'
                      : pm}
                  </p>
                </div>
              </div>
              {pm === DISTRO.packageManager[0] && (
                <Badge variant="primary" size="sm">
                  Primary
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Supported Architectures
          </h3>
          <div className="flex flex-wrap gap-2">
            {DISTRO.architectures.map((arch) => (
              <span
                key={`arch-detail-${arch}`}
                className="px-3 py-1.5 bg-muted rounded-lg text-xs font-bold font-mono text-foreground"
              >
                {arch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Compatibility Matrix */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 card-shadow">
        <h2 className="text-base font-semibold text-foreground mb-2">
          Use Case Compatibility Matrix
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          How well {DISTRO.name} supports each common use case
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_USE_CASES.map((uc) => {
            const cfg = USE_CASE_CONFIG[uc];
            const supported = DISTRO.useCases.includes(uc);
            const partial =
              !supported &&
              (uc === 'Lightweight' ||
                (uc === 'Server' && DISTRO.id === 'distro-001') ||
                (uc === 'Privacy' && DISTRO.id === 'distro-001'));
            return (
              <div
                key={`matrix-${uc}`}
                className={`p-4 rounded-xl border text-center ${
                  supported
                    ? 'border-success/30 bg-success-light'
                    : partial
                    ? 'border-warning/30 bg-warning-light' :'border-border bg-muted/20'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {supported ? (
                    <CheckSquare size={18} className="text-success" />
                  ) : partial ? (
                    <MinusCircle size={18} className="text-warning" />
                  ) : (
                    <XCircle size={18} className="text-muted-foreground/40" />
                  )}
                </div>
                <p
                  className={`text-xs font-semibold ${
                    supported
                      ? 'text-success'
                      : partial
                      ? 'text-warning' :'text-muted-foreground/60'
                  }`}
                >
                  {cfg.label}
                </p>
                <p
                  className={`text-2xs mt-0.5 ${
                    supported
                      ? 'text-success/70'
                      : partial
                      ? 'text-warning/70' :'text-muted-foreground/40'
                  }`}
                >
                  {supported ? 'Supported' : partial ? 'Partial' : 'Not ideal'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Reviews Tab ─────────────────────────────────────────── */
function ReviewsTab() {
  const [helpfulClicked, setHelpfulClicked] = useState<string[]>([]);

  const ratingDistribution = [
    { stars: 5, count: 1623, pct: 57 },
    { stars: 4, count: 796, pct: 28 },
    { stars: 3, count: 256, pct: 9 },
    { stars: 2, count: 114, pct: 4 },
    { stars: 1, count: 58, pct: 2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Summary + Chart */}
      <div className="space-y-5">
        <div className="bg-card rounded-xl border border-border p-6 card-shadow">
          <h2 className="text-base font-semibold text-foreground mb-4">Rating Summary</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-foreground tabular-nums leading-none mb-1">
                {DISTRO.communityRating.toFixed(1)}
              </div>
              <StarRating rating={DISTRO.communityRating} size={16} />
              <p className="text-xs text-muted-foreground mt-1.5">
                {DISTRO.reviewCount.toLocaleString()} reviews
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingDistribution.map(({ stars, count, pct }) => (
                <div key={`rating-bar-${stars}`} className="flex items-center gap-2">
                  <span className="text-2xs text-muted-foreground w-3 tabular-nums text-right">
                    {stars}
                  </span>
                  <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-2xs text-muted-foreground tabular-nums w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <RatingBreakdownChart data={ratingDistribution} />
        </div>

        {/* Write Review CTA */}
        <div className="bg-primary-light rounded-xl border border-primary/20 p-5">
          <h3 className="text-sm font-semibold text-primary mb-1.5">Share your experience</h3>
          <p className="text-xs text-primary/70 mb-4">
            Have you used {DISTRO.name}? Help others by writing a review.
          </p>
          <Link href="/sign-up-login" className="btn-primary w-full justify-center text-xs">
            Write a Review
          </Link>
        </div>
      </div>

      {/* Right: Review Cards */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filter by:</span>
          {(['All', 'Beginner-Friendly', 'Development', 'Gaming', 'Privacy'] as const).map(
            (f) => (
              <button
                key={`review-filter-${f}`}
                className="filter-chip filter-chip-inactive text-xs px-2.5 py-1"
              >
                {f}
              </button>
            )
          )}
        </div>

        {DISTRO.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-md transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: review.avatarColor }}
                >
                  {review.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="flex items-center gap-0.5 text-2xs text-success font-semibold">
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={review.rating} size={11} />
                    <span className="text-2xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
              <span
                className={`badge-use-case text-2xs ${USE_CASE_CONFIG[review.useCase].bg} ${USE_CASE_CONFIG[review.useCase].color}`}
              >
                {USE_CASE_CONFIG[review.useCase].label}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-foreground mb-1.5">{review.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.body}</p>

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Was this helpful?</span>
              <button
                onClick={() =>
                  setHelpfulClicked((prev) =>
                    prev.includes(review.id)
                      ? prev.filter((id) => id !== review.id)
                      : [...prev, review.id]
                  )
                }
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 ${
                  helpfulClicked.includes(review.id)
                    ? 'bg-primary-light text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ThumbsUp size={12} />
                {review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}

        {/* Additional mock reviews */}
        {[
          {
            id: 'rev-extra-001',
            author: 'Tomás Herrera',
            avatarInitials: 'TH',
            avatarColor: '#8B5CF6',
            rating: 4,
            date: 'Apr 15, 2026',
            title: 'Rock solid for web development',
            body: 'Running Ubuntu 24.04 on my Dell XPS 15. Node 20, Python 3.12, PostgreSQL 16 all installed via apt without issues. VS Code integration is seamless. The only friction is occasionally outdated packages in the repos — but PPAs solve that.',
            helpful: 67,
            verified: true,
            useCase: 'Development' as UseCase,
          },
          {
            id: 'rev-extra-002',
            author: 'Fatima Al-Rashid',
            avatarInitials: 'FA',
            avatarColor: '#F59E0B',
            rating: 5,
            date: 'Mar 28, 2026',
            title: 'Perfect for my university coursework',
            body: 'Ubuntu comes pre-loaded on university lab machines. Having the same environment at home eliminates "works on my machine" problems. LibreOffice handles all my documents, and LaTeX setup was painless. Zero cost is a huge bonus as a student.',
            helpful: 112,
            verified: false,
            useCase: 'Education' as UseCase,
          },
          {
            id: 'rev-extra-003',
            author: 'Wei Chen',
            avatarInitials: 'WC',
            avatarColor: '#0EA5E9',
            rating: 3,
            date: 'Mar 12, 2026',
            title: 'Good but gaming support is inconsistent',
            body: 'Ubuntu works great for most things but gaming via Steam Proton is hit or miss. Some titles run perfectly, others crash. I ended up installing Pop!_OS alongside for gaming. For development and everyday tasks Ubuntu is still my recommendation for newcomers.',
            helpful: 45,
            verified: true,
            useCase: 'Gaming' as UseCase,
          },
        ].map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-md transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: review.avatarColor }}
                >
                  {review.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="flex items-center gap-0.5 text-2xs text-success font-semibold">
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={review.rating} size={11} />
                    <span className="text-2xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
              <span
                className={`badge-use-case text-2xs ${USE_CASE_CONFIG[review.useCase].bg} ${USE_CASE_CONFIG[review.useCase].color}`}
              >
                {USE_CASE_CONFIG[review.useCase].label}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1.5">{review.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.body}</p>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Was this helpful?</span>
              <button
                onClick={() =>
                  setHelpfulClicked((prev) =>
                    prev.includes(review.id)
                      ? prev.filter((id) => id !== review.id)
                      : [...prev, review.id]
                  )
                }
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 ${
                  helpfulClicked.includes(review.id)
                    ? 'bg-primary-light text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ThumbsUp size={12} />
                {review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Versions Tab ────────────────────────────────────────── */
function VersionsTab() {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-6 card-shadow">
        <h2 className="text-base font-semibold text-foreground mb-5">Release History</h2>
        <div className="space-y-4">
          {DISTRO.versions.map((ver) => (
            <div
              key={ver.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${
                ver.isLatest
                  ? 'border-primary/30 bg-primary-light/30' :'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    ver.isLatest ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Package size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold font-mono text-foreground">
                      {ver.version}
                    </span>
                    {ver.codename && (
                      <span className="text-xs text-muted-foreground italic">
                        &ldquo;{ver.codename}&rdquo;
                      </span>
                    )}
                    {ver.isLatest && <Badge variant="primary" size="sm">Latest</Badge>}
                    {ver.isLTS && <Badge variant="success" size="sm">LTS</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Released {ver.releaseDate}</span>
                    {ver.supportUntil && (
                      <>
                        <span>·</span>
                        <span>Support until {ver.supportUntil}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="font-mono">{ver.sizeGb}GB ISO</span>
                  </div>
                </div>
              </div>
              <a
                href={ver.downloadUrl}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 shrink-0 ${
                  ver.isLatest
                    ? 'btn-primary' :'btn-secondary'
                }`}
              >
                <Download size={13} />
                Download
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-warning-light border border-warning/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning mb-1">
              Use the latest LTS for stability
            </p>
            <p className="text-xs text-warning/80">
              Non-LTS releases reach end of life after 9 months. For production systems and daily
              drivers, Ubuntu 24.04 LTS is recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Similar Tab ─────────────────────────────────────────── */
function SimilarTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Similar Distributions</h2>
        <p className="text-sm text-muted-foreground">
          Based on {DISTRO.name}&apos;s use cases and base system, you might also like:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {SIMILAR_DISTROS.map((d) => (
          <div
            key={`similar-${d.id}`}
            className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: d.logoColor }}
              >
                {d.logoInitials}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground font-mono">v{d.latestVersion}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{d.tagline}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {d.useCases.slice(0, 2).map((uc) => {
                const cfg = USE_CASE_CONFIG[uc];
                return (
                  <span
                    key={`similar-uc-${d.id}-${uc}`}
                    className={`badge-use-case ${cfg.bg} ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold tabular-nums">
                  {d.communityRating.toFixed(1)}
                </span>
              </div>
              <Link href="/distro-detail" className="btn-outline text-xs px-2.5 py-1.5">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}