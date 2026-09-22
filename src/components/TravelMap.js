import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function countryData(markers, countryNames = {}) {
  return { type: "FeatureCollection", features: markers.filter((m) => Array.isArray(m.latlng) && m.latlng.length === 2).map((m) => ({ type: "Feature", properties: { name: countryNames[m.name] || m.name }, geometry: { type: "Point", coordinates: [Number(m.latlng[1]), Number(m.latlng[0])] } })).filter((f) => f.geometry.coordinates.every(Number.isFinite)) };
}

function applyMapLanguage(map, language) {
  map.getStyle().layers
    .filter((layer) => layer.type === "symbol" && layer.layout?.["text-field"] && !layer.id.startsWith("country-"))
    .forEach((layer) => {
      try {
        map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", language === "pt" ? "name_pt" : "name_en"], ["get", "name"]]);
      } catch (_) {
        // Some style layers do not expose localized name fields.
      }
    });
}

export default function TravelMap({ viewPort, setViewPort, mapRef, markers, countryNames, language, setMapError }) {
  const containerRef = useRef(null);
  const nativeMapRef = useRef(null);
  const markersRef = useRef(markers);

  useEffect(() => {
    const token = process.env.REACT_APP_MAPBOX_KEY;
    if (!token || !containerRef.current) return undefined;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current, style: "mapbox://styles/mapbox/outdoors-v12",
      center: [viewPort.longitude, viewPort.latitude], zoom: viewPort.zoom, maxZoom: 12,
      maxBounds: [[-180, -85.051129], [180, 85.051129]],
    });
    nativeMapRef.current = map;
    if (mapRef) mapRef.current = { getMap: () => map };
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("error", () => setMapError(true));
    map.on("load", () => {
      map.addSource("visited-countries", { type: "geojson", data: countryData(markersRef.current, countryNames), cluster: true, clusterMaxZoom: 12, clusterRadius: 40 });
      map.addLayer({ id: "country-clusters", type: "circle", source: "visited-countries", filter: ["has", "point_count"], paint: { "circle-color": "#15374a", "circle-radius": 22, "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
      map.addLayer({ id: "country-cluster-count", type: "symbol", source: "visited-countries", filter: ["has", "point_count"], layout: { "text-field": "{point_count_abbreviated}", "text-size": 14 }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "country-markers", type: "circle", source: "visited-countries", filter: ["!", ["has", "point_count"]], paint: { "circle-color": "#102f43", "circle-radius": 10, "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
      map.addLayer({ id: "country-marker-check", type: "symbol", source: "visited-countries", filter: ["!", ["has", "point_count"]], layout: { "text-field": "✓", "text-size": 14 }, paint: { "text-color": "#fff" } });
      map.on("click", "country-clusters", (event) => {
        const feature = event.features?.[0]; const coordinates = feature?.geometry?.coordinates;
        map.getSource("visited-countries").getClusterExpansionZoom(feature?.properties?.cluster_id, (error, zoom) => { if (!error && coordinates) map.easeTo({ center: coordinates, zoom: Math.min(zoom, 12) }); });
      });
      map.on("click", "country-markers", (event) => {
        const feature = event.features?.[0]; const coordinates = feature?.geometry?.coordinates;
        if (coordinates) new mapboxgl.Popup().setLngLat(coordinates).setText(feature.properties?.name || "").addTo(map);
      });
      ["country-clusters", "country-markers"].forEach((layer) => {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      });
      applyMapLanguage(map, language);
    });
    map.on("moveend", () => { const center = map.getCenter(); setViewPort((current) => ({ ...current, longitude: center.lng, latitude: center.lat, zoom: map.getZoom() })); });
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);
    return () => { if (mapRef) mapRef.current = undefined; resizeObserver.disconnect(); map.remove(); };
  // The Mapbox instance is intentionally created once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markersRef.current = markers;
    const source = nativeMapRef.current?.getSource("visited-countries");
    if (source) source.setData(countryData(markers, countryNames));
  }, [markers, countryNames]);

  useEffect(() => {
    const map = nativeMapRef.current;
    if (!map?.isStyleLoaded()) return;
    applyMapLanguage(map, language);
  }, [language]);
  return <div ref={containerRef} style={{ width: "100%", height: `${viewPort.height}px` }} />;
}
