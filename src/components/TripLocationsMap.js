import { useEffect, useRef, useState } from "react";
import ReactMapGl, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl";
import airports from "airports";
import { useTranslation } from "../i18n";

function airportCoordinates(value) {
  const code = String(value || "").toUpperCase().match(/\b[A-Z]{3}\b/)?.[0];
  const airport = airports.find((item) => item.iata === code);
  return airport ? [Number(airport.lon), Number(airport.lat)] : null;
}

function locationsForTrip(trip) {
  const locations = [];
  const add = (label, type, coordinates) => {
    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      coordinates.every(Number.isFinite)
    ) {
      locations.push({ label, type, coordinates });
    }
  };

  (trip.transportLegs || []).forEach((leg) => {
    if (leg.type === "plane") {
      add("Arrival airport", "plane", airportCoordinates(leg.arrivalLocation));
    } else {
      add(
        leg.type === "train"
          ? "Train station"
          : leg.type === "car"
            ? "Driving destination"
            : "Bus station",
        leg.type,
        leg.arrivalLocationCoordinates,
      );
    }
  });

  (trip.accommodations || []).forEach((stay) =>
    add(stay.name || "Accommodation", "accommodation", stay.addressCoordinates),
  );
  (trip.sightseeings || []).forEach((item) =>
    add(item.sightseeing || "Sightseeing", "sightseeing", item.coordinates),
  );
  if (trip.carRental?.enabled) {
    add("Car rental pick-up", "car", trip.carRental.addressCoordinates);
    add("Car rental drop-off", "car", trip.carRental.dropoffAddressCoordinates);
  }

  return locations;
}

function iconFor(type) {
  if (type === "plane") return "fa-plane";
  if (type === "train") return "fa-train";
  if (type === "bus") return "fa-bus";
  if (type === "accommodation") return "fa-bed";
  if (type === "car") return "fa-car";
  return "fa-map-pin";
}

function focusMapOnPoints(map, points) {
  if (!points.length) return null;
  if (points.length === 1) {
    map.jumpTo({ center: points[0], zoom: 12 });
  } else {
    const bounds = points.reduce(
      ([minLongitude, minLatitude, maxLongitude, maxLatitude], [longitude, latitude]) => [
        Math.min(minLongitude, longitude),
        Math.min(minLatitude, latitude),
        Math.max(maxLongitude, longitude),
        Math.max(maxLatitude, latitude),
      ],
      [Infinity, Infinity, -Infinity, -Infinity],
    );
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: { top: 54, right: 54, bottom: 54, left: 54 }, maxZoom: 12, duration: 0 },
    );
  }
  const center = map.getCenter();
  return { longitude: center.lng, latitude: center.lat, zoom: map.getZoom() };
}

function applyMapLanguage(map, language) {
  map.getStyle().layers
    .filter((layer) => layer.type === "symbol" && layer.layout?.["text-field"])
    .forEach((layer) => {
      try {
        map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", language === "pt" ? "name_pt" : "name_en"], ["get", "name"]]);
      } catch (_) {
        // Keep style layers that do not expose localized label fields.
      }
    });
}

export default function TripLocationsMap({ trip }) {
  const { t, language } = useTranslation();
  const [locations] = useState(() => locationsForTrip(trip));
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const carLegs = (trip.transportLegs || []).filter((leg) => {
    const points = [
      ...(leg.departureLocationCoordinates || []),
      ...(leg.arrivalLocationCoordinates || []),
    ];
    return leg.type === "car" && points.length === 4 && points.every(Number.isFinite);
  });
  const carRouteKey = carLegs
    .map((leg) => [...leg.departureLocationCoordinates, ...leg.arrivalLocationCoordinates].join(","))
    .join("|");
  const [drivingRoutes, setDrivingRoutes] = useState([]);
  const viewportPoints = [
    ...locations.map((location) => location.coordinates),
    ...carLegs.flatMap((leg) => [leg.departureLocationCoordinates, leg.arrivalLocationCoordinates]),
  ];
  const [viewPort, setViewPort] = useState(() => {
    const [longitude, latitude] = viewportPoints[0] || [0, 20];
    return {
      longitude,
      latitude,
      zoom: viewportPoints.length > 1 ? 4 : 11,
      width: "100%",
      height: "320px",
    };
  });

  // The endpoint coordinates are the complete dependency for a displayed driving route.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = process.env.REACT_APP_MAPBOX_KEY;
    if (!token || !carLegs.length) {
      setDrivingRoutes([]);
      return undefined;
    }
    let cancelled = false;
    Promise.all(
      carLegs.map(async (leg) => {
        const [fromLongitude, fromLatitude] = leg.departureLocationCoordinates;
        const [toLongitude, toLatitude] = leg.arrivalLocationCoordinates;
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLongitude},${fromLatitude};${toLongitude},${toLatitude}?overview=full&geometries=geojson&access_token=${token}`,
        );
        const data = response.ok ? await response.json() : {};
        return data.routes?.[0]?.geometry || null;
      }),
    )
      .then((routes) => {
        if (!cancelled) setDrivingRoutes(routes.filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setDrivingRoutes([]);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carRouteKey]);

  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return undefined;

    const resizeMap = () => mapRef.current?.getMap?.().resize();
    const observer = new ResizeObserver(resizeMap);
    observer.observe(canvas);
    resizeMap();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (map?.isStyleLoaded()) applyMapLanguage(map, language);
  }, [language]);

  if (!viewportPoints.length || !process.env.REACT_APP_MAPBOX_KEY) return null;

  return (
    <section className="tripLocationMap">
      <div className="tripLocationMapHeader">
        <span className="tripDetailSectionIcon" aria-hidden="true">
          <i className="fas fa-map-marked-alt"></i>
        </span>
        <div>
          <p className="tripDetailSectionEyebrow">TRIP PLAN</p>
          <h3>{t("Places on this trip")}</h3>
        </div>
      </div>
      <div className="tripLocationMapCanvas" ref={mapCanvasRef}>
        <ReactMapGl
          ref={mapRef}
          {...viewPort}
          maxZoom={15}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY}
          mapStyle="mapbox://styles/mapbox/outdoors-v12"
          onViewportChange={({ longitude, latitude, zoom }) =>
            setViewPort((currentViewport) => ({
              ...currentViewport,
              longitude,
              latitude,
              zoom,
            }))
          }
          onLoad={(event) => {
            applyMapLanguage(event.target, language);
            const focusedViewport = focusMapOnPoints(event.target, viewportPoints);
            if (focusedViewport) {
              setViewPort((currentViewport) => ({ ...currentViewport, ...focusedViewport }));
            }
          }}
        >
          {drivingRoutes.length > 0 && (
            <Source
              id="driving-routes"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: drivingRoutes.map((geometry) => ({
                  type: "Feature",
                  properties: {},
                  geometry,
                })),
              }}
            >
              <Layer
                id="driving-routes-line"
                type="line"
                paint={{ "line-color": "#0c8580", "line-width": 4, "line-opacity": 0.82 }}
              />
            </Source>
          )}
          {locations.map((location, index) => (
            <Marker
              key={location.type + location.label + index}
              longitude={location.coordinates[0]}
              latitude={location.coordinates[1]}
              offsetLeft={-16}
              offsetTop={-32}
            >
              <button
                type="button"
                className={`tripLocationPin tripLocationPin--${location.type}`}
                onClick={() => setSelected(location)}
                aria-label={location.label}
              >
                <i className={"fas " + iconFor(location.type)}></i>
              </button>
            </Marker>
          ))}
          {selected && (
            <Popup
              longitude={selected.coordinates[0]}
              latitude={selected.coordinates[1]}
              onClose={() => setSelected(null)}
              closeButton
              closeOnClick={false}
            >
              <strong>{selected.label}</strong>
            </Popup>
          )}
          <NavigationControl style={{ right: 10, top: 10 }} />
        </ReactMapGl>
      </div>
      <p className="tripLocationMapHint">
        {t("Only confirmed autocomplete selections are shown on the map.")}
      </p>
    </section>
  );
}
