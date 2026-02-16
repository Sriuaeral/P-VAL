import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Plant } from '@shared/interface';
import { plantService } from '@/lib/services';

interface PlantContextType {
  plant: Plant | null;
  loading: boolean;
  error: string | null;
  refreshPlant: () => Promise<void>;
  setPlant: (plant: Plant) => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

interface PlantProviderProps {
  children: ReactNode;
}

export function PlantProvider({ children }: PlantProviderProps) {
  const { plantId } = useParams<{ plantId: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch plant data when plantId changes
  useEffect(() => {
    if (plantId) {
      fetchPlant();
    } else {
      setPlant(null);
      setError(null);
    }
  }, [plantId]);

  const fetchPlant = async () => {
    if (!plantId) return;

    setLoading(true);
    setError(null);

    try {
      const plantData = await plantService.getPlant(plantId);
      setPlant(plantData);
    } catch (err) {
      console.error('Failed to fetch plant:', err);
      setError('Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const refreshPlant = async () => {
    await fetchPlant();
  };

  const handleSetPlant = (plantData: Plant) => {
    setPlant(plantData);
    setError(null);
  };

  const value: PlantContextType = {
    plant,
    loading,
    error,
    refreshPlant,
    setPlant: handleSetPlant,
  };

  return (
    <PlantContext.Provider value={value}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlant() {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
  localStorage.getItem('selectedPlant')
}

// Hook for plant name display
export function usePlantName() {
  const { plant, loading } = usePlant();
  
  if (loading) return 'Loading...';
  if (!plant) return 'Plant Not Found';
  return plant.name || `Plant ${plant.id}`;
}

// Hook for plant status
export function usePlantStatus() {
  const { plant } = usePlant();
  return plant?.status || 'unknown';
}

// Hook for plant capacity
export function usePlantCapacity() {
  const { plant } = usePlant();
  return plant?.capacity || 0;
}
