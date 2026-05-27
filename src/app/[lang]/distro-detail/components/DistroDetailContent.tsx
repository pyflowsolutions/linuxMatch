'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; // <-- Importamos el cliente de Supabase
import { USE_CASE_CONFIG, Distro } from '@/components/distroData';
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
} from 'lucide-react';

import Badge from '@/components/ui/Badge';
import DistroRadarChart from './DistroRadarChart';
import RatingBreakdownChart from './RatingBreakdownChart';

interface DistroDetailContentProps {
  distroId: string;
  lang: string;
}

const TABS = ['Overview', 'Specifications', 'Reviews', 'Versions', 'Similar'] as const;
type Tab = (typeof TABS)[number];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={`star-${s}`}
          size={size}
          className={
            s <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground/25'
          }
        />
      ))}
    </div>
  );
}

export default function DistroDetailContent({ distroId, lang }: DistroDetailContentProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [bookmarked, setBookmarked] = useState(false);
  
  // Estados para controlar la carga asíncrona de Supabase
  const [distro, setDistro] = useState<Distro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDistroDetails() {
      try {
        setLoading(true);

        // 1. Normalizamos el ID de la URL eliminando caracteres especiales conflictivos (como el !)
        const cleanId = distroId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

        // 2. Traemos las distribuciones directamente desde la base de datos
        const { data, error } = await supabase.from('distributions').select('*');

        if (error) throw error;

        // 3. Evaluamos coincidencias tanto con el ID limpio como con la cadena exacta
        const matchingRecord = data?.find((item) => {
          const cleanDbId = item.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
          return cleanDbId === cleanId || item.id.trim().toLowerCase() === distroId.trim().toLowerCase();
        });

        if (matchingRecord) {
          // 4. Adaptamos el formato snake_case de Supabase al camelCase esperado por tus gráficos y componentes
          const mappedDistro: Distro = {
            id: matchingRecord.id,
            name: matchingRecord.name,
            tagline: matchingRecord.tagline || '',
            logoInitials: matchingRecord.logo_initials || matchingRecord.name?.substring(0, 3).toUpperCase(),
            logoColor: matchingRecord.logo_color || '#3b82f6',
            minRam: matchingRecord.min_ram || 2,
            minStorage: matchingRecord.min_storage || 20,
            minCpuCores: matchingRecord.min_cpu_cores || 2,
            releaseModel: matchingRecord.release_model || 'LTS',
            cpuArchitecture: matchingRecord.cpu_architecture || 'AMD64 / x86-64',
            useCases: matchingRecord.use_cases || ['General'],
            descriptionEs: matchingRecord.description_es || matchingRecord.tagline || '',
            descriptionEn: matchingRecord.description_en || matchingRecord.tagline || '',
            latestVersion: matchingRecord.latest_version || '1.0.0',
            releaseDate: matchingRecord.release_date || 'Reciente',
            basedOn: matchingRecord.based_on || 'Independent',
            reviewCount: matchingRecord.review_count || 0,
            communityRating: Number(matchingRecord.community_rating) || 4.5,
            compatibilityScore: matchingRecord.compatibility_score || 90,
            easeOfUse: matchingRecord.ease_of_use || 80,
            hardwareEfficiency: matchingRecord.hardware_efficiency || 80,
            stabilityScore: matchingRecord.stability_score || 80,
            isPopular: matchingRecord.review_count > 50, // Flag dinámico basado en popularidad
            reviews: matchingRecord.reviews || []
          };
          setDistro(mappedDistro);
        } else {
          setDistro(null);
        }
      } catch (err) {
        console.error('Error sincronizando la ficha técnica:', err);
        setDistro(null);
      } finally {
        setLoading(false);
      }
    }

    if (distroId) {
      loadDistroDetails();
    }
  }, [distroId, supabase]);

  // Pantalla de carga estética mientras consulta Supabase
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground animate-pulse">Sincronizando ficha técnica...</p>
      </div>
    );
  }

  // Cláusula de salvaguarda reactiva si el ID no existe en Supabase
  if (!distro) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-card p-8 rounded-2xl border border-border max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {lang === 'es' ? 'Distribución no encontrada' : 'Distribution not found'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {lang === 'es' 
              ? `No hemos podido cargar los detalles para el identificador "${distroId}".` 
              : `We could not load the details for the identifier "${distroId}".`}
          </p>
          <Link 
            href={`/${lang}`} 
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 text-sm"
          >
            {lang === 'es' ? 'Volver al buscador' : 'Back to finder'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 py-4 text-sm">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Distro Finder
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/50" />
        <span className="text-foreground font-semibold">{distro.name}</span>
      </div>

      {/* Hero Header */}
      <div className="bg-card rounded-2xl border border-border shadow-sm mb-6 overflow-hidden">
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(90deg, ${distro.logoColor}, ${distro.logoColor}55)`,
          }}
        />
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-5 flex-1">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0 shadow-sm"
                style={{ backgroundColor: distro.logoColor }}
              >
                {distro.logoInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-foreground">{distro.name}</h1>
                  <Badge variant="success">{distro.releaseModel}</Badge>
                  {distro.isPopular && <Badge variant="primary">Popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{distro.tagline}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Package size={13} />
                    <span className="font-mono font-semibold text-foreground">
                      v{distro.latestVersion}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Released {distro.releaseDate}</span>
                  </div>
                  {distro.basedOn && (
                    <div className="flex items-center gap-1.5">
                      <Terminal size={13} />
                      <span>
                        Based on{' '}
                        <span className="font-semibold text-foreground">{distro.basedOn}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users size={13} />
                    <span>{distro.reviewCount.toLocaleString()} reviews</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              <div className="bg-muted/50 rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-3xl font-extrabold text-foreground tabular-nums mb-1">
                  {distro.communityRating.toFixed(1)}
                </div>
                <StarRating rating={distro.communityRating} size={12} />
                <p className="text-[10px] text-muted-foreground mt-1">Community rating</p>
              </div>
              <div className="bg-success/10 rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-3xl font-extrabold text-success tabular-nums mb-1">
                  {distro.compatibilityScore}%
                </div>
                <p className="text-[10px] text-success/80 font-semibold">Compatibility</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
            {distro.useCases?.map((uc) => {
              const cfg = USE_CASE_CONFIG[uc] || { bg: 'bg-muted', color: 'text-muted-foreground', label: uc };
              return (
                <span
                  key={`hero-uc-${uc}`}
                  className={`px-2.5 py-1 rounded-md font-medium text-xs ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a href="#" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Download size={15} />
              Download {distro.name}
            </a>
            <a href="#" className="px-4 py-2 border border-border bg-card text-foreground font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-muted transition-colors">
              <ExternalLink size={15} />
              Official Website
            </a>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BookmarkPlus size={15} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-xs font-bold relative transition-colors ${
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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

      {/* Tab Content Components */}
      <div className="pb-10">
        {activeTab === 'Overview' && <OverviewTab DISTRO={distro} />}
        {activeTab === 'Specifications' && <SpecificationsTab DISTRO={distro} />}
        {activeTab === 'Reviews' && <ReviewsTab DISTRO={distro} />}
        {activeTab === 'Versions' && <div className="text-sm text-muted-foreground bg-card p-6 rounded-xl border border-border">Version history log coming soon...</div>}
        {activeTab === 'Similar' && <div className="text-sm text-muted-foreground bg-card p-6 rounded-xl border border-border">Similar distributions suggestion system...</div>}
      </div>
    </div>
  );
}

/* ─── Overview Tab Sub-component ─────────────────────────── */
function OverviewTab({ DISTRO }: { DISTRO: Distro }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-3">About {DISTRO.name}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{DISTRO.descriptionEs || DISTRO.descriptionEn || DISTRO.tagline}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Distribution Profile</h2>
          <p className="text-[11px] text-muted-foreground mb-4">How {DISTRO.name} scores across key attributes</p>
          <DistroRadarChart distro={DISTRO} />
        </div>
      </div>

      {/* Sidebar de atributos */}
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Attribute Scores</h3>
          <div className="space-y-3">
            {[
              { label: 'Ease of Use', value: DISTRO.easeOfUse, icon: Users },
              { label: 'Hardware Efficiency', value: DISTRO.hardwareEfficiency, icon: Cpu },
              { label: 'Stability', value: DISTRO.stabilityScore, icon: Shield },
            ].map(({ label, value, icon: IconComponent }) => (
              <div key={`score-${label}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconComponent size={12} />
                    {label}
                  </div>
                  <span className="text-xs font-bold text-foreground">{value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Specifications Tab Sub-component ────────────────────── */
function SpecificationsTab({ DISTRO }: { DISTRO: Distro }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-5">Minimum Requirements</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <MemoryStick size={18} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">Memory RAM</p>
              <p className="text-sm font-mono font-bold text-success">{DISTRO.minRam} GB</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <HardDrive size={18} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">Storage Disk space</p>
              <p className="text-sm font-mono font-bold text-success">{DISTRO.minStorage} GB</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <Cpu size={18} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">Processor Cores</p>
              <p className="text-sm font-mono font-bold text-success">{DISTRO.minCpuCores} CPU Cores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reviews Tab Sub-component ──────────────────────────── */
function ReviewsTab({ DISTRO }: { DISTRO: Distro }) {
  const [helpfulClicked, setHelpfulClicked] = useState<string[]>([]);
  const ratingDistribution = [
    { stars: 5, count: 120, pct: 60 },
    { stars: 4, count: 50, pct: 25 },
    { stars: 3, count: 20, pct: 10 },
    { stars: 2, count: 8, pct: 4 },
    { stars: 1, count: 2, pct: 1 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4">Rating Summary</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="text-center">
            <div className="text-4xl font-black text-foreground mb-1">{DISTRO.communityRating.toFixed(1)}</div>
            <StarRating rating={DISTRO.communityRating} size={14} />
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ stars, pct }) => (
              <div key={`star-bar-${stars}`} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-2 font-bold">{stars}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <RatingBreakdownChart data={ratingDistribution} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {DISTRO.reviews && DISTRO.reviews.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-xl border border-border text-xs text-muted-foreground">
            No reviews submitted yet for this distribution.
          </div>
        ) : (
          DISTRO.reviews?.map((review) => (
            <div key={review.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between dynamic-review-header mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{review.author}</span>
                  {review.verified && <span className="text-[10px] bg-success/10 text-success font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckCircle size={10}/> Verified</span>}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${USE_CASE_CONFIG[review.useCase]?.bg || 'bg-muted'} ${USE_CASE_CONFIG[review.useCase]?.color || 'text-foreground'}`}>
                  {USE_CASE_CONFIG[review.useCase]?.label || review.useCase}
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">{review.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{review.body}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button 
                  onClick={() => setHelpfulClicked((prev) => prev.includes(review.id) ? prev.filter((id) => id !== review.id) : [...prev, review.id])}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${helpfulClicked.includes(review.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <ThumbsUp size={12} />
                  {review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
