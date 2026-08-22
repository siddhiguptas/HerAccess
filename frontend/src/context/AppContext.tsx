import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SearchResponse, ResourceDetail, EvidenceCard } from '../types';
import { api } from '../api';

interface AppContextType {
  searchResponse: SearchResponse | null;
  isLoading: boolean;
  selectedResource: ResourceDetail | null;
  setSelectedResource: (r: ResourceDetail | null) => void;
  viewingDetailResource: ResourceDetail | null;
  setViewingDetailResource: (r: ResourceDetail | null) => void;
  selectedEvidence: EvidenceCard | null;
  setSelectedEvidence: (e: EvidenceCard | null) => void;
  watchedIds: number[];
  handleToggleWatch: (id: number) => Promise<void>;
  allResources: ResourceDetail[];
  handleSearch: (query: string, city?: string, budget?: number, locality?: string) => Promise<void>;
  loadAllResources: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  
  const [allResources, setAllResources] = useState<ResourceDetail[]>([]);
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

  return (
    <AppContext.Provider value={{
      searchResponse,
      isLoading,
      selectedResource,
      setSelectedResource,
      viewingDetailResource,
      setViewingDetailResource,
      selectedEvidence,
      setSelectedEvidence,
      watchedIds,
      handleToggleWatch,
      allResources,
      handleSearch,
      loadAllResources
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
