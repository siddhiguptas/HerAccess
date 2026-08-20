import React, { useState, useEffect } from 'react';
import {
  SearchResponse,
  ResourceDetail,
  EvidenceCard
} from './types';
import { api } from './api';
import { Navbar, NavTab } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { ResourceCard } from './components/ResourceCard';
import { MapView } from './components/MapView';
import { EvidenceModal } from './components/EvidenceModal';
import { ScraperHealthCenter } from './components/ScraperHealthCenter';
import { ConflictsView } from './components/ConflictsView';
import { ChangesFeed } from './components/ChangesFeed';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { DemoControlPanel } from './components/DemoControlPanel';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import {
  Compass, ShieldCheck, Sparkles, Filter, RefreshCw, AlertCircle,
  Building2, Train, Stethoscope, Pill, Shield, HeartHandshake
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('navigator');
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceDetail | null>(null);
  const [viewingDetailResource, setViewingDetailResource] = useState<ResourceDetail | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCard | null>(null);
  const [watchedIds, setWatchedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('heraccess_watched_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [allResources, setAllResources] = useState<ResourceDetail[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const sessionId = 'session_demo_user_01';

  const handleSearch = async (
    query: string,
    city: string = 'Lucknow',
    budget?: number,
    locality?: string
  ) => {
    try {
      setIsLoading(true);
      const res = await api.search(query, city, budget, locality);
      setSearchResponse(res);
      if (res.primary_results.length > 0) {
        setSelectedResource(res.primary_results[0]);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllResources = async () => {
    try {
      const list = await api.getResources();
      setAllResources(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Initial search on mount
    handleSearch(
      "I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby.",
      'Lucknow',
      12000
    );
    loadAllResources();
  }, []);

  const handleToggleWatch = async (id: number) => {
    let next: number[];
    if (watchedIds.includes(id)) {
      next = watchedIds.filter((x) => x !== id);
      try {
        await api.removeFromWatchlist(sessionId, id);
      } catch (e) {}
    } else {
      next = [...watchedIds, id];
      try {
        await api.addToWatchlist(sessionId, id);
      } catch (e) {}
    }
    setWatchedIds(next);
    localStorage.setItem('heraccess_watched_ids', JSON.stringify(next));
  };

  // Combine primary search results and nearby ecosystem for the map
  const mapResources = React.useMemo(() => {
    if (!searchResponse) return allResources;
    const combined: ResourceDetail[] = [...searchResponse.primary_results];
    Object.values(searchResponse.nearby_support_ecosystem).forEach((items) => {
      combined.push(...items);
    });
    return combined;
  }, [searchResponse, allResources]);

  const displayedResults = React.useMemo(() => {
    if (!searchResponse) return [];
    if (selectedCategoryFilter === 'all') return searchResponse.primary_results;
    return mapResources.filter((r) => r.category === selectedCategoryFilter);
  }, [searchResponse, selectedCategoryFilter, mapResources]);

  const watchedResourcesList = React.useMemo(() => {
    return mapResources.filter((r) => watchedIds.includes(r.id));
  }, [mapResources, watchedIds]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchedIds.length}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Interactive Demo Workflow Control Bar (Always visible on top for Judges) */}
        <DemoControlPanel
          onStateChanged={() => {
            handleSearch(
              "I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby.",
              'Lucknow',
              12000
            );
            loadAllResources();
          }}
        />

        {/* Tab 1: Navigator / Search Interface */}
        {activeTab === 'navigator' && (
          <div className="space-y-6">
            <SearchHero onSearch={handleSearch} isLoading={isLoading} />

            {/* Structured Search Intent Callout */}
            {searchResponse?.intent && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>
                    <strong>Extracted Requirements:</strong> {searchResponse.intent.explanation}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span>{searchResponse.total_found} verified results</span>
                  <span>•</span>
                  <span>{searchResponse.execution_time_ms} ms</span>
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-brand-500 text-white border-brand-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                All Ranked Hostels ({searchResponse?.primary_results.length || 0})
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('public_transport')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'public_transport'
                    ? 'bg-sky-500 text-white border-sky-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Train className="w-3.5 h-3.5 text-sky-400" />
                <span>Metro / Transport</span>
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('hospital')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'hospital'
                    ? 'bg-rose-500 text-white border-rose-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                <span>Government Hospitals</span>
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('pharmacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'pharmacy'
                    ? 'bg-emerald-500 text-white border-emerald-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Pill className="w-3.5 h-3.5 text-emerald-400" />
                <span>24x7 Chemist</span>
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('police_or_public_support')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'police_or_public_support'
                    ? 'bg-indigo-500 text-white border-indigo-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Women Help Desks</span>
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('women_support')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'women_support'
                    ? 'bg-pink-500 text-white border-pink-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                <span>Support Centres / 1090</span>
              </button>
            </div>

            {/* Split View: Left List Cards / Right Interactive Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Results */}
              <div className="lg:col-span-6 space-y-4 max-h-[780px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="p-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                    <span>Parsing intent & querying verified resource database...</span>
                  </div>
                ) : displayedResults.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs">
                    No resources matched current filters.
                  </div>
                ) : (
                  displayedResults.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelectEvidence={(ev) => setSelectedEvidence(ev)}
                      isWatched={watchedIds.includes(res.id)}
                      onToggleWatch={handleToggleWatch}
                      isSelected={selectedResource?.id === res.id}
                      onSelect={() => setSelectedResource(res)}
                      onViewDetail={(r) => setViewingDetailResource(r)}
                    />
                  ))
                )}
              </div>

              {/* Right Column: Map */}
              <div className="lg:col-span-6 sticky top-24 h-[720px]">
                <MapView
                  resources={mapResources}
                  selectedResource={selectedResource}
                  onSelectResource={(res) => setSelectedResource(res)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Conflicts View */}
        {activeTab === 'conflicts' && <ConflictsView />}

        {/* Tab 3: Historical Changes Feed */}
        {activeTab === 'changes' && <ChangesFeed />}

        {/* Tab 4: Scraper Health Center */}
        {activeTab === 'health' && <ScraperHealthCenter />}
      </main>

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={viewingDetailResource}
        onClose={() => setViewingDetailResource(null)}
        onSelectEvidence={(ev) => setSelectedEvidence(ev)}
        isWatched={viewingDetailResource ? watchedIds.includes(viewingDetailResource.id) : false}
        onToggleWatch={handleToggleWatch}
      />

      {/* Evidence Provenance Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Watchlist Monitoring Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchedResources={watchedResourcesList}
        onRemoveWatch={handleToggleWatch}
        onSelectEvidence={(ev) => setSelectedEvidence(ev)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>HerAccess — Built for Into the Scrape-Verse Hackathon</span>
          <span>Core Infrastructure: Bright Data Scraper Studio</span>
        </div>
      </footer>
    </div>
  );
};
