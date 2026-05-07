import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import * as THREE from 'three';
import { useRoadStore } from '../../store/roadStore';
import { CONDITION_COLOR, CONDITION_HIGHLIGHT } from '../../types/road';
import type { Road, RoadCondition } from '../../types/road';
import './MapView.css';

/**
 * Custom MapLibre GL layer that renders a rotating Three.js drone.
 */
function createThreeLayer(id: string, origin: [number, number]) {
    let camera: THREE.Camera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let map: maplibregl.Map;
    let drone: THREE.Group;

    const mercatorCoord = maplibregl.MercatorCoordinate.fromLngLat(origin, 150);

    const transform = {
        translateX: mercatorCoord.x,
        translateY: mercatorCoord.y,
        translateZ: mercatorCoord.z,
        rotateX: Math.PI / 2,
        rotateY: 0,
        rotateZ: 0,
        scale: mercatorCoord.meterInMercatorCoordinateUnits() * 50
    };

    return {
        id: id,
        type: 'custom' as const,
        renderingMode: '3d' as const,
        onAdd: function (addedMap: maplibregl.Map, gl: WebGLRenderingContext) {
            map = addedMap;
            camera = new THREE.Camera();
            scene = new THREE.Scene();

            // Drone group
            drone = new THREE.Group();

            // Body
            const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 8);
            const bodyMat = new THREE.MeshPhongMaterial({ color: 0x333333, emissive: 0x000000 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.rotation.x = Math.PI / 2;
            drone.add(body);

            // Ring
            const ringGeo = new THREE.TorusGeometry(1.2, 0.1, 16, 64);
            const ringMat = new THREE.MeshPhongMaterial({ color: 0x8B0000, emissive: 0x8B0000, emissiveIntensity: 0.8 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            drone.add(ring);

            // Rotor
            const rotorGeo = new THREE.BoxGeometry(3, 0.1, 0.2);
            const rotorMat = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
            const rotor = new THREE.Mesh(rotorGeo, rotorMat);
            rotor.position.z = 0.3;
            drone.add(rotor);

            scene.add(drone);

            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambient);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(0, -70, 100).normalize();
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x8B0000, 2, 50);
            pointLight.position.set(0, 0, 1);
            scene.add(pointLight);

            renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });
            renderer.autoClear = false;
        },
        render: function (_gl: WebGLRenderingContext, matrix: number[]) {
            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), transform.rotateX);
            const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), transform.rotateY);
            const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), transform.rotateZ);

            const time = performance.now() * 0.001;
            const hoverOffset = Math.sin(time * 2) * 5;

            drone.rotation.z = time * 0.5;
            const rotor = drone.children[2];
            if (rotor) rotor.rotation.z = time * 15;

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(
                    transform.translateX,
                    transform.translateY,
                    transform.translateZ + hoverOffset * transform.scale
                )
                .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale))
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            camera.projectionMatrix = m.multiply(l);
            renderer.resetState();
            renderer.render(scene, camera);
            map.triggerRepaint();
        }
    };
}

const MapView: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const overlayRef = useRef<MapboxOverlay | null>(null);
    const [webglError, setWebglError] = useState<string | null>(null);

    const roads = useRoadStore((s) => s.roads);
    const selectedRoad = useRoadStore((s) => s.selectedRoad);
    const setSelected = useRoadStore((s) => s.setSelectedRoad);
    const fetchRoads = useRoadStore((s) => s.fetchRoads);
    const complaints = useRoadStore((s) => s.complaints);
    const fetchComplaints = useRoadStore((s) => s.fetchComplaints);
    const isHeatmapMode = useRoadStore((s) => s.isHeatmapMode);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Custom WebGL support check
        const isSupported = () => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext &&
                    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        };

        if (!isSupported()) {
            setWebglError('Your browser cannot initialize WebGL. Please ensure Hardware Acceleration is enabled in your browser settings.');
            return;
        }

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [80.044, 12.823],
            zoom: 16,
            pitch: 60,
        });

        mapRef.current = map;

        const overlay = new MapboxOverlay({
            interleaved: true,
            layers: []
        });

        map.addControl(overlay as unknown as maplibregl.IControl);
        overlayRef.current = overlay;

        map.on('style.load', () => {
            if (!map.getLayer('three-layer')) {
                const threeLayer = createThreeLayer('three-layer', [80.044, 12.823]);
                map.addLayer(threeLayer as unknown as maplibregl.CustomLayerInterface);
            }
        });

        // Dynamic Loading based on viewport
        const handleMoveEnd = () => {
            const bounds = map.getBounds();
            fetchRoads([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
            fetchComplaints();
        };
        map.on('moveend', handleMoveEnd);

        // Initial fetch
        handleMoveEnd();

        return () => {
            if (overlayRef.current) {
                map.removeControl(overlayRef.current as unknown as maplibregl.IControl);
                overlayRef.current.finalize();
            }
            if (map.getLayer('three-layer')) {
                map.removeLayer('three-layer');
            }
            map.remove();
        };
    }, []);

    const [playbackDate, setPlaybackDate] = useState<number | null>(null);

    // Compute bounds for playback
    const timeRanges = useMemo(() => {
        let min = Date.now();
        let max = Date.now();
        if (roads.length > 0) {
            roads.forEach(r => {
                if (r.history && r.history.length > 0) {
                    r.history.forEach(h => {
                        const t = new Date(h.reportedAt).getTime();
                        if (t < min) min = t;
                        if (t > max) max = t;
                    });
                }
            });
        }
        return { min, max };
    }, [roads]);

    useEffect(() => {
        if (!overlayRef.current) return;

        let layers = [];

        // Helper to get historical condition
        const getConditionForDate = (road: Road): RoadCondition => {
            if (!playbackDate) return road.condition;
            if (!road.history || road.history.length === 0) return road.condition;
            
            // Find the most recent report BEFORE playbackDate
            let bestRep = road.history[0];
            for (let i = 0; i < road.history.length; i++) {
                if (new Date(road.history[i].reportedAt).getTime() <= playbackDate) {
                    bestRep = road.history[i];
                }
            }
            return bestRep.predictedCondition;
        };

        if (isHeatmapMode) {
            import('@deck.gl/aggregation-layers').then(({ HeatmapLayer }) => {
                // Combine roads and complaints for heatmap
                const mapData = [
                    ...roads.map(r => ({ pos: r.path[0], weight: getConditionForDate(r) === 'SEVERE' ? 100 : getConditionForDate(r) === 'MODERATE' ? 50 : 10 })),
                    ...complaints.map(c => ({ pos: c.coordinates, weight: c.predictedCondition === 'SEVERE' ? 200 : c.predictedCondition === 'MODERATE' ? 100 : 50 }))
                ].filter(d => d.pos);

                const heatmapLayer = new HeatmapLayer({
                    id: 'combined-heatmap-layer',
                    data: mapData,
                    getPosition: (d: any) => d.pos,
                    getWeight: (d: any) => d.weight,
                    radiusPixels: 60,
                    intensity: 1.5,
                    threshold: 0.1
                });
                overlayRef.current?.setProps({ layers: [heatmapLayer] });
            });
            return;
        }

        const pathLayer = new PathLayer<Road>({
            id: 'road-path-layer',
            data: roads,
            getPath: (d: Road) => {
                const condition = getConditionForDate(d);
                const elevate = condition === 'SEVERE' ? 150 : condition === 'MODERATE' ? 30 : 2;
                return d.path.map(p => [p[0], p[1], elevate]) as any;
            },
            getColor: (d: Road) => {
                const condition = getConditionForDate(d);
                return selectedRoad?.id === d.id ? CONDITION_HIGHLIGHT[condition] : CONDITION_COLOR[condition];
            },
            widthMinPixels: 6,
            widthScale: 2,
            pickable: true,
            updateTriggers: {
                getColor: [selectedRoad, playbackDate, isHeatmapMode],
                getPath: [playbackDate, isHeatmapMode]
            },
            onHover: (info) => {
                const el = document.getElementById('map-tooltip');
                if (info.object && el) {
                    const { x, y } = info;
                    const road = info.object as Road;
                    const condition = getConditionForDate(road);
                    el.style.top = `${y + 10}px`;
                    el.style.left = `${x + 10}px`;
                    el.innerHTML = `<strong>${road.name}</strong><br/>Condition: ${condition}<br/>Score: ${road.conditionScore?.toFixed(1) || 'N/A'}`;
                    el.style.display = 'block';
                } else if (el) {
                    el.style.display = 'none';
                }
            },
            onClick: (info) => {
                if (info.object) {
                    const road = info.object as Road;
                    setSelected(selectedRoad?.id === road.id ? null : road);
                }
            },
        });

        const complaintsLayer = new ScatterplotLayer<RoadCondition>({
            id: 'complaints-marker-layer',
            data: complaints as any,
            getPosition: (d: any) => d.coordinates,
            getFillColor: (d: any) => CONDITION_COLOR[d.predictedCondition as RoadCondition] || [255, 255, 255, 200],
            getRadius: 50,
            radiusMinPixels: 8,
            radiusMaxPixels: 24,
            pickable: true,
            stroked: true,
            getLineColor: [255, 255, 255, 200],
            lineWidthMinPixels: 2,
            onHover: (info) => {
                const el = document.getElementById('map-tooltip');
                if (info.object && el) {
                    const { x, y } = info;
                    const c = info.object as any;
                    el.style.top = `${y + 10}px`;
                    el.style.left = `${x + 10}px`;
                    el.innerHTML = `
                        <strong>Complaint Marker</strong><br/>
                        Prediction: ${c.predictedCondition}<br/>
                        Confidence: ${(c.confidenceScore * 100).toFixed(1)}%<br/>
                        Comment: ${c.userComment || 'None'}<br/>
                        Date: ${new Date(c.reportedAt).toLocaleDateString()}
                    `;
                    el.style.display = 'block';
                } else if (!info.object && !document.querySelector('.deck-tooltip')) {
                    if (el) el.style.display = 'none';
                }
            }
        });

        layers.push(pathLayer, complaintsLayer);
        overlayRef.current.setProps({ layers });
    }, [roads, complaints, selectedRoad, setSelected, isHeatmapMode, playbackDate]);

    if (webglError) {
        return (
            <div className="map-view map-view--error">
                <div className="error-card">
                    <span className="error-icon">⚠️</span>
                    <h3>Map Engine Offline</h3>
                    <p>{webglError}</p>
                    <button className="retry-btn" onClick={() => window.location.reload()}>Re-initialize System</button>
                </div>
            </div>
        );
    }

    return (
        <div className="map-view">
            <div ref={mapContainer} className="map-container" />
            
            {/* Playback Overlay */}
            <div className="playback-overlay">
                <div className="playback-header">
                    <span className="playback-title">Historical Playback</span>
                    <span className="playback-current-date">
                        {playbackDate ? new Date(playbackDate).toLocaleDateString() : 'Live Data'}
                    </span>
                </div>
                <div className="playback-controls">
                    <span className="playback-bound-label">{new Date(timeRanges.min).toLocaleDateString()}</span>
                    <input 
                        type="range" 
                        min={timeRanges.min} 
                        max={timeRanges.max} 
                        className="playback-slider"
                        value={playbackDate || timeRanges.max}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setPlaybackDate(val >= timeRanges.max - 86400000 ? null : val);
                        }}
                    />
                    <span className="playback-bound-label">Now</span>
                </div>
            </div>

            <div id="map-tooltip" className="map-tooltip" />
        </div>
    );
};

export default MapView;
