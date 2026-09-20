import "./styles/WorldMap.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import useSupercluster from "use-supercluster";
import {
  getMarkersFromLocalStorage,
  saveMarkersToLocalStorage,
} from "../services/myMarkersStorage";
import TravelMap from "./TravelMap";
import CountryOption from "./CountryOption";

export default function WorldMap() {
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState("");
  const [mapError, setMapError] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [markers, setMarkers] = useState([]);
  const [clickedCountry, setClickedCountry] = useState(null);
  const mapRef = useRef();
  const percentage = countries.length
    ? (markers.length / countries.length) * 100
    : 0;

  const isMobile = window.innerWidth <= 640;

  const [viewPort, setViewPort] = useState({
    latitude: isMobile ? 39.5 : 20.123,
    longitude: isMobile ? 20 : 10.123,
    width: "100%",
    height: isMobile ? "210px" : "420px",
    zoom: isMobile ? 2.2 : 1.05,
  });

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(filterInputValue.toLowerCase()),
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "https://raw.githubusercontent.com/mledoze/countries/master/countries.json",
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Country service returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const normalizedCountries = data
          .filter(
            (country) =>
              country.name?.common &&
              Array.isArray(country.latlng) &&
              country.latlng.length === 2,
          )
          .map((country) => ({
            id: country.cca2 || country.name.common,
            name: country.name.common,
            latlng: country.latlng,
            flag: country.cca2
              ? `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`
              : "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(normalizedCountries);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setCountriesError("Countries could not be loaded. Please try again.");
        }
      })
      .finally(() => setIsLoadingCountries(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const uniqueMarkers = getMarkersFromLocalStorage().filter(
      (marker, index, allMarkers) =>
        marker &&
        marker.name &&
        Array.isArray(marker.latlng) &&
        marker.latlng.length === 2 &&
        allMarkers.findIndex((item) => item.name === marker.name) === index,
    );
    setMarkers(uniqueMarkers);
    saveMarkersToLocalStorage(uniqueMarkers);
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setClickedCountry(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    const updateMapSize = () => {
      setViewPort((current) => ({
        ...current,
        width: "100%",
        height: window.innerWidth <= 640 ? "210px" : "420px",
      }));
    };

    window.addEventListener("resize", updateMapSize);
    return () => window.removeEventListener("resize", updateMapSize);
  }, []);

  function handleClick(e, latlng, name) {
    const updatedMarkers = e.target.checked
      ? markers.some((marker) => marker.name === name)
        ? markers
        : [...markers, { latlng, name }]
      : markers.filter((marker) => marker.name !== name);

    setMarkers(updatedMarkers);
    saveMarkersToLocalStorage(updatedMarkers);
  }

  let textContent;
  if (markers.length === 0) {
    textContent = "You didn't select any Country yet";
  } else if (markers.length === 1) {
    textContent = `You have visited 1 Country in the World (${Math.round(
      percentage,
    )}%)`;
  } else {
    textContent = `You have visited ${markers.length} Countries in the World (${Math.round(
      percentage,
    )}%)`;
  }

  function handleOnName(e) {
    setFilterInputValue(e.target.value);
  }

  function getCheckboxState(name) {
    const isChecked = markers.some((marker) => {
      return marker.name === name;
    });
    return isChecked;
  }

  const points = markers.map((marker) => ({
    type: "Feature",
    properties: {
      cluster: false,
      markerId: marker.name,
    },
    geometry: {
      type: "Point",
      coordinates: [parseFloat(marker.latlng[1]), parseFloat(marker.latlng[0])],
    },
  }));

  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewPort.zoom,
    options: { radius: 40, maxZoom: 12 },
  });

  return (
    <div className="TravelMap" id="top">
      <div className="travelMapHeader">
        <h2>TRAVEL MAP</h2>
      </div>

      <div className="visitedCountriesCounter">{textContent}</div>
      <div className="mapboxMap">
        <TravelMap
          points={points}
          markers={markers}
          mapRef={mapRef}
          clusters={clusters}
          supercluster={supercluster}
          clickedCountry={clickedCountry}
          setClickedCountry={setClickedCountry}
          setMapError={setMapError}
          viewPort={viewPort}
          setViewPort={setViewPort}
        />
      </div>
      <div className="countryFilter">
        <label htmlFor="filterInput">COUNTRY NAME</label>
        <input
          placeholder="Find a country..."
          className="filterInput"
          value={filterInputValue}
          id="filterInput"
          onChange={handleOnName}
        ></input>
      </div>

      <div className="countryList">
        {mapError && (
          <div className="noResults">
            The map could not load. Check the Mapbox token in the .env file.
          </div>
        )}
        {isLoadingCountries && (
          <div className="noResults">LOADING COUNTRIES…</div>
        )}
        {countriesError && <div className="noResults">{countriesError}</div>}
        {!isLoadingCountries &&
          !countriesError &&
          filteredCountries.length === 0 && (
            <div className="noResults">
              <i className="fas fa-exclamation-circle"></i>NO RESULTS
            </div>
          )}

        {!countriesError &&
          filteredCountries.map((country) => {
            const { id, name, latlng, flag } = country;
            return (
              <CountryOption
                key={id}
                name={name}
                latlng={latlng}
                flag={flag}
                handleClick={handleClick}
                getCheckboxState={getCheckboxState}
              />
            );
          })}
      </div>
      <div className="travelMapFooter">
        <Link className="myTripsButtonLink" to="/">
          <button className="travelMapButtonHome">
            <i className="fas fa-home"></i>
          </button>
        </Link>
        <Link className="myTripsButtonLink" to="/myTrips">
          <button className="myTripsButton">
            <i className="fas fa-suitcase-rolling"></i>My Trips
          </button>
        </Link>
      </div>
    </div>
  );
}
