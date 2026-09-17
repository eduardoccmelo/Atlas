import ReactMapGl, {
  Marker,
  Popup,
  NavigationControl,
  FlyToInterpolator,
} from "react-map-gl";

export default function TravelMap({
  viewPort,
  setViewPort,
  mapRef,
  markers,
  clusters,
  points,
  supercluster,
  clickedCountry,
  setClickedCountry,
  setMapError,
}) {
  const navControlStyle = {
    right: 10,
    top: 10,
  };

  return (
    <ReactMapGl
      {...viewPort}
      maxZoom={12}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      onViewportChange={(viewPort) => {
        setViewPort(viewPort);
      }}
      onError={() => setMapError(true)}
      ref={mapRef}
    >
      {markers.length > 0 &&
        clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount,
          } = cluster.properties;
          if (isCluster) {
            return (
              <Marker
                key={cluster.id}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="clusterMarker"
                  style={{
                    width: `${10 + (pointCount / points.length) * 50}px`,
                    height: `${10 + (pointCount / points.length) * 50}px`,
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      12
                    );
                    setViewPort({
                      ...viewPort,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        speed: 2,
                      }),
                      transitionDuration: "auto",
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={cluster.properties.markerId}
              latitude={latitude}
              longitude={longitude}
              offsetLeft={-10}
              offsetTop={-12}
            >
              <div
                onClick={(e) => {
                  setClickedCountry(cluster);
                }}
              >
                <i className="fas fa-check-circle"></i>
              </div>
            </Marker>
          );
        })}
      {clickedCountry && (
        <Popup
          latitude={clickedCountry.geometry.coordinates[1]}
          longitude={clickedCountry.geometry.coordinates[0]}
          onClose={() => {
            setClickedCountry(null);
          }}
        >
          <div>
            <h3>{clickedCountry.properties.markerId}</h3>
          </div>
        </Popup>
      )}
      <NavigationControl style={navControlStyle} />
    </ReactMapGl>
  );
}
