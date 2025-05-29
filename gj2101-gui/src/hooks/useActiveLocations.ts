import { useState, useEffect, useCallback } from 'react';
import { ActiveLocationsMap } from '../types';

const STORAGE_KEY = 'activeLocations';
const STORAGE_BASE_URL_KEY = 'baseUrlForActiveLocations';

interface UseActiveLocationsProps {
  baseUrl: string;
  isPlaying: boolean;
}

export const useActiveLocations = ({ baseUrl, isPlaying }: UseActiveLocationsProps) => {
  const [activeLocations, setActiveLocations] = useState<ActiveLocationsMap>({});

  // Load activeLocations from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedBaseUrl = localStorage.getItem(STORAGE_BASE_URL_KEY);

    if (storedData && storedBaseUrl === baseUrl) {
      setActiveLocations(JSON.parse(storedData));
    }
  }, [baseUrl]);

  // Save activeLocations to localStorage when changed
  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLocations));
      localStorage.setItem(STORAGE_BASE_URL_KEY, baseUrl);
    }
  }, [activeLocations, baseUrl]);

  const toggleLocation = useCallback((location: string) => {
    setActiveLocations(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  }, []);

  return {
    activeLocations,
    toggleLocation,
    // This prop allows us to maintain the same behavior where location changes are disabled during playback
    isToggleDisabled: isPlaying
  };
};
