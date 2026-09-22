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
import { useTranslation } from "../i18n";

function mapViewportSize() {
  const stacked = window.innerWidth <= 800;
  const mapHeight = stacked ? 320 : Math.max(420, window.innerHeight - 300);
  return {
    width: Math.min(920, window.innerWidth - (stacked ? 32 : 48)),
    height: mapHeight,
    listHeight: stacked ? 220 : mapHeight,
  };
}

export default function WorldMap() {
  const { t, language } = useTranslation();
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

  const isStacked = window.innerWidth <= 800;

  const [viewPort, setViewPort] = useState({
    latitude: isStacked ? 39.5 : 20.123,
    longitude: isStacked ? 20 : 10.123,
    ...mapViewportSize(),
    zoom: isStacked ? 0.7 : 1.15,
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
            name: language === "pt"
              ? country.translations?.por?.common || country.name.common
              : country.name.common,
            markerName: country.name.common,
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
  }, [language]);

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
        ...mapViewportSize(),
      }));
    };

    updateMapSize();
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
    textContent = t("You didn't select any Country yet");
  } else if (markers.length === 1) {
    textContent = language === "pt"
      ? `Você visitou 1 país no mundo (${Math.round(percentage)}%)`
      : `You have visited 1 Country in the World (${Math.round(percentage)}%)`;
  } else {
    textContent = language === "pt"
      ? `Você visitou ${markers.length} países no mundo (${Math.round(percentage)}%)`
      : `You have visited ${markers.length} Countries in the World (${Math.round(percentage)}%)`;
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
        <h2>{t("TRAVEL MAP")}</h2>
      </div>

      <div
        className="worldMapContent"
        style={{
          "--world-map-height": `${viewPort.height}px`,
          "--country-list-height": `${viewPort.listHeight}px`,
        }}
      >
        <div className="visitedCountriesCounter">{textContent}</div>
        <div className="countryFilter">
          <label htmlFor="filterInput">{t("COUNTRY NAME")}</label>
          <input
            placeholder={t("Find a country...")}
            className="filterInput"
            value={filterInputValue}
            id="filterInput"
            onChange={handleOnName}
          ></input>
        </div>
        <div className="mapboxMap">
          <TravelMap
            points={points}
            markers={markers}
            countryNames={Object.fromEntries(countries.map((country) => [country.markerName, country.name]))}
            language={language}
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

        <div className="countryList">
        {mapError && (
          <div className="noResults">
            The map could not load. Check the Mapbox token in the .env file.
          </div>
        )}
        {isLoadingCountries && (
          <div className="noResults">{t("LOADING COUNTRIES…")}</div>
        )}
        {countriesError && <div className="noResults">{countriesError}</div>}
        {!isLoadingCountries &&
          !countriesError &&
          filteredCountries.length === 0 && (
            <div className="noResults">
              <i className="fas fa-exclamation-circle"></i>
              {t("NO RESULTS")}
            </div>
          )}

        {!countriesError &&
          filteredCountries.map((country) => {
            const { id, name, markerName, latlng, flag } = country;
            return (
              <CountryOption
                key={id}
                name={name}
                markerName={markerName}
                latlng={latlng}
                flag={flag}
                handleClick={handleClick}
                getCheckboxState={getCheckboxState}
              />
            );
          })}
        </div>
      </div>
      <div className="travelMapFooter">
        <Link className="myTripsButtonLink" to="/">
          <button className="travelMapButtonHome">
            <i className="fas fa-home"></i>
          </button>
        </Link>
        <Link className="myTripsButtonLink" to="/myTrips">
          <button className="myTripsButton">
            <i className="fas fa-suitcase-rolling"></i>
            {t("MY TRIPS")}
          </button>
        </Link>
      </div>
    </div>
  );
}
