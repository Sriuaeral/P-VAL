import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Plant } from '@shared/interface';

type Location = {
  plantName: string;
  plantId: string;
  coordinates: [number, number];
  color: string;
};

type MultiPointMapProps = {
  plants: Plant[];
  showPlantDataTool: boolean;
  locations: Location[];
  initialCenter?: [number, number];
  initialZoom?: number;
  style?: React.CSSProperties;
};

const MultiPointMap: React.FC<MultiPointMapProps> = ({
  plants,
  showPlantDataTool,
  locations,
  initialCenter = [55.0250, 24.9300],
  initialZoom = 9,
  style = { height: '800px', width: '100%' }
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();

  // Helper function to get plant details by ID
  const getPlantDetails = (plantId: string) => {
    console.log('Looking for plant with ID:', plantId);
    console.log('Available plants:', plants.map(p => ({ id: p.id, name: p.name })));
    const foundPlant = plants.find(plant => plant.id === plantId);
    console.log('Found plant:', foundPlant);
    return foundPlant;
  };

  // Helper function to format plant data for tooltip
  const formatPlantTooltip = (plant: Plant) => {
    const statusColor = plant.status === 'operational' ? '#10b981' : 
                       plant.status === 'maintenance' ? '#f59e0b' : '#ef4444';
    const statusIcon = plant.status === 'operational' ? '🟢' : 
                      plant.status === 'maintenance' ? '🟡' : '🔴';

    return `
      <div style="
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 16px;
        width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        line-height: 1.4;
        backdrop-filter: blur(10px);
      ">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        ">
          <div style="font-size: 12px;">${statusIcon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="
              font-weight: 700;
              color: #1e293b;
              font-size: 14px;
              margin: 0;
              line-height: 1.2;
              word-wrap: break-word;
              text-transform: capitalize;
            ">${plant.name || 'Unnamed Plant'}</div>
          </div>
        </div>

        <!-- Performance Overview -->
        <div style="
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          border: 1px solid #e2e8f0;
        ">
          <div style="
            color: #374151;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 10px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Performance Overview</div>

          <div style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          ">
            <div style="
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #bae6fd;
              text-align: center;
            ">
              <div style="
                color: #0369a1;
                font-size: 9px;
                font-weight: 600;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Power Capacity</div>
              <div style="
                color: #0c4a6e;
                font-weight: 800;
                font-size: 16px;
                margin-bottom: 2px;
              ">${plant.capacity || 0} MW</div>
              <div style="
                color: #0369a1;
                font-size: 8px;
                font-weight: 500;
              ">Total installed power</div>
            </div>

            <div style="
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #bbf7d0;
              text-align: center;
            ">
              <div style="
                color: #166534;
                font-size: 9px;
                font-weight: 600;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Performance Ratio</div>
              <div style="
                color: #14532d;
                font-weight: 800;
                font-size: 16px;
                margin-bottom: 2px;
              ">${plant.pr || 0}%</div>
              <div style="
                color: #166534;
                font-size: 8px;
                font-weight: 500;
              ">Energy efficiency</div>
            </div>

            <div style="
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #fcd34d;
              text-align: center;
            ">
              <div style="
                color: #92400e;
                font-size: 9px;
                font-weight: 600;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Capacity Factor</div>
              <div style="
                color: #78350f;
                font-weight: 800;
                font-size: 16px;
                margin-bottom: 2px;
              ">${plant.cuf || 0}%</div>
              <div style="
                color: #92400e;
                font-size: 8px;
                font-weight: 500;
              ">Actual vs potential</div>
            </div>

            <div style="
              background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #c4b5fd;
              text-align: center;
            ">
              <div style="
                color: #7c3aed;
                font-size: 9px;
                font-weight: 600;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">System Uptime</div>
              <div style="
                color: #5b21b6;
                font-weight: 800;
                font-size: 16px;
                margin-bottom: 2px;
              ">${plant.availability || 0}%</div>
              <div style="
                color: #7c3aed;
                font-size: 8px;
                font-weight: 500;
              ">Operational time</div>
            </div>
          </div>
        </div>


        <!-- System Alerts -->
        ${plant.alertCount ? `
          <div style="
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            border: 1px solid #fecaca;
          ">
            <div style="
              color: #dc2626;
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">Alerts Summary</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${(plant.alertCount.critical || 0) > 0 ? `
                <span style="
                  background: #dc2626;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${plant.alertCount.critical} Critical</span>
              ` : ''}
              ${(plant.alertCount.high || 0) > 0 ? `
                <span style="
                  background: #d97706;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${plant.alertCount.high} High</span>
              ` : ''}
              ${(plant.alertCount.medium || 0) > 0 ? `
                <span style="
                  background: #6b7280;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${plant.alertCount.medium} Medium</span>
              ` : ''}
              ${(plant.alertCount.low || 0) > 0 ? `
                <span style="
                  background: #2563eb;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${plant.alertCount.low} Low</span>
              ` : ''}
            </div>
          </div>
        ` : `
          <div style="
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            border: 1px solid #bbf7d0;
            text-align: center;
          ">
            <div style="
              color: #166534;
              font-size: 11px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">✅ No Active Alerts</div>
          </div>
        `}

        <!-- Footer -->
        <div style="
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #cbd5e1;
        ">
          <div style="
            color: #475569;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            Click to view details →
          </div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      style: 'mapbox://styles/mapbox/standard',
      center: locations.length > 0 ? locations[0].coordinates : initialCenter,
      zoom: initialZoom
    });

    mapRef.current.on('load', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: locations.map((loc) => ({
          type: 'Feature',
          properties: {
            plantId: loc.plantId,
            color: loc.color,
            plantName: loc.plantName,
          },
          geometry: {
            type: 'Point',
            coordinates: loc.coordinates
          }
        }))
      };

      mapRef.current!.addSource('points', {
        type: 'geojson',
        data: geojson as GeoJSON.FeatureCollection
      });

      mapRef.current!.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 10,
          'circle-color': ['get', 'color']
        }
      });

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '340px',
        offset: 25,
        className: 'modern-plant-tooltip'
      });

      mapRef.current!.on('mouseenter', 'points', (e) => {
        mapRef.current!.getCanvas().style.cursor = 'pointer';
        const coordinates = (e.features?.[0].geometry as any).coordinates.slice();
        const plantId = e.features?.[0].properties?.plantId;
        const plantName = e.features?.[0].properties?.plantName;
        
        console.log('Hovering over plant:', { plantId, plantName, plants: plants.length });
        
        const plant = getPlantDetails(plantId);
        
        if (plant) {
          console.log('Found plant:', plant);
          popup
            .setLngLat(coordinates)
            .setHTML(formatPlantTooltip(plant))
            .addTo(mapRef.current!);
        } else {
          // Fallback: create a basic tooltip with available data
          console.log('Plant not found, using fallback tooltip');
          const fallbackTooltip = `
            <div style="
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              padding: 12px;
              width: 200px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">
                ${plantName || 'Plant'}
              </div>
              <div style="color: #64748b; font-size: 12px;">
                ID: ${plantId || 'N/A'}
              </div>
              <div style="color: #64748b; font-size: 11px; margin-top: 8px;">
                Click to view details
              </div>
            </div>
          `;
          popup
            .setLngLat(coordinates)
            .setHTML(fallbackTooltip)
            .addTo(mapRef.current!);
        }
      });

      mapRef.current!.on('mouseleave', 'points', () => {
        mapRef.current!.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Add click event to navigate to CSM page
      mapRef.current!.on('click', 'points', (e) => {
        const plantId = e.features?.[0].properties?.plantId;
        if (plantId) {
          navigate(`/plants/${plantId}/monitor`);
        }
      });
      mapRef.current!.addControl(new mapboxgl.NavigationControl());
      //mapRef.current!.addControl(new mapboxgl.ScaleControl());
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locations, initialCenter, initialZoom]);

  return <div ref={mapContainerRef} style={style} />;
};

export default MultiPointMap;