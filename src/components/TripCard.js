import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import TransportIcon from "./TransportIcon";
import genericDestinationImage from "../images/earth.png";

const destinationImageCache = new Map();

async function fetchCountryFlag(destination) {
  const locationResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(destination)}`
  );
  if (!locationResponse.ok) return "";

  const location = (await locationResponse.json())[0];
  const countryCode = location?.address?.country_code?.toLowerCase();
  if (!countryCode) return "";

  return `https://flagcdn.com/w640/${countryCode}.png`;
}

export default function TripCard({
  handleRemoveTrip,
  name,
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
  const [destinationImage, setDestinationImage] = useState(genericDestinationImage);

  useEffect(() => {
    const destination = name.trim();
    if (!destination) {
      setDestinationImage(genericDestinationImage);
      return undefined;
    }
    const cacheKey = destination.toLowerCase();
    if (destinationImageCache.has(cacheKey)) {
      setDestinationImage(destinationImageCache.get(cacheKey));
      return undefined;
    }

    let cancelled = false;
    setDestinationImage(genericDestinationImage);
    fetchCountryFlag(destination)
      .then((image) => {
        if (image) destinationImageCache.set(cacheKey, image);
        if (!cancelled) setDestinationImage(image || genericDestinationImage);
      })
      .catch(() => !cancelled && setDestinationImage(genericDestinationImage));

    return () => {
      cancelled = true;
    };
  }, [name]);

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
          <button className="tripViewButton">View</button>
        </Link>
        <Link to={`/myTrips/${id}/edit`}>
          <button className="tripEditButton">Edit</button>
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
