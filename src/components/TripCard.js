import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import TransportIcon from "./TransportIcon";
import genericDestinationImage from "../images/earth.png";
import { useTranslation } from "../i18n";

const destinationImageCache = new Map();

async function fetchCountryFlag(destination, coordinates) {
  const hasCoordinates =
    Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite);
  const locationResponse = await fetch(
    hasCoordinates
      ? `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${coordinates[1]}&lon=${coordinates[0]}`
      : `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(destination)}`
  );
  if (!locationResponse.ok) return "";

  const payload = await locationResponse.json();
  const location = hasCoordinates ? payload : payload[0];
  const countryCode = location?.address?.country_code?.toLowerCase();
  if (!countryCode) return "";

  return `https://flagcdn.com/w640/${countryCode}.png`;
}

export default function TripCard({
  handleRemoveTrip,
  name,
  destinationCoordinates,
  id,
  transportation,
  startDay,
  startMonth,
  startYear,
  endDay,
  endMonth,
  endDate,
  endYear,
}) {
  const { t } = useTranslation();
  const [destinationImage, setDestinationImage] = useState(genericDestinationImage);

  useEffect(() => {
    const destination = name.trim();
    if (!destination) {
      setDestinationImage(genericDestinationImage);
      return undefined;
    }
    const cacheKey = destinationCoordinates
      ? destinationCoordinates.join(",")
      : destination.toLowerCase();
    if (destinationImageCache.has(cacheKey)) {
      setDestinationImage(destinationImageCache.get(cacheKey));
      return undefined;
    }

    let cancelled = false;
    setDestinationImage(genericDestinationImage);
    fetchCountryFlag(destination, destinationCoordinates)
      .then((image) => {
        if (image) destinationImageCache.set(cacheKey, image);
        if (!cancelled) setDestinationImage(image || genericDestinationImage);
      })
      .catch(() => !cancelled && setDestinationImage(genericDestinationImage));

    return () => {
      cancelled = true;
    };
  }, [name, destinationCoordinates]);

  function classTripDate() {
    const today = new Date();
    if (today.valueOf() - 100000000 < new Date(endDate).valueOf()) {
      return "myTripsItem";
    } else {
      return "pastTripItem";
    }
  }

  return (
    <div
      key={id}
      className={classTripDate()}
      style={{
        "--destination-image": `url("${destinationImage}")`,
      }}
    >
      <button className="removeButton" onClick={() => handleRemoveTrip(name)}>
        <i className="fas fa-trash-alt"></i>
      </button>
      <TransportIcon
        name={name}
        transportation={transportation}
        startDay={startDay}
        startMonth={startMonth}
        startYear={startYear}
        endDay={endDay}
        endMonth={endMonth}
        endYear={endYear}
      />
      <div className="tripCardActions">
        <Link to={`/myTrips/${id}`}>
          <button className="tripViewButton">{t("View")}</button>
        </Link>
        <Link to={`/myTrips/${id}/edit`}>
          <button className="tripEditButton">{t("Edit")}</button>
        </Link>
      </div>
      <div className="barcode">
        <i className="fas fa-barcode"></i>
        <i className="fas fa-barcode"></i>
        <i className="fas fa-barcode"></i>
        <i className="fas fa-barcode"></i>
      </div>
    </div>
  );
}
