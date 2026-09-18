import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import airports from "airports";
import tzLookup from "tz-lookup";
import SightSeeings from "./Sightseeings";
import Expense from "./Expenses";

const airportByIata = new Map(
  airports
    .filter((airport) => airport.iata)
    .map((airport) => [airport.iata, airport]),
);
const airportNameOverrides = {
  LJU: "Ljubljana Jože Pučnik Airport",
};
const airportOptions = airports
  .filter((airport) => airport.iata && airport.status === 1)
  .map((airport) => ({
    ...airport,
    displayName:
      airport.name ||
      airportNameOverrides[airport.iata] ||
      `${airport.iata} Airport`,
  }))
  .sort((a, b) => a.iata.localeCompare(b.iata));

function airportFor(value) {
  const text = String(value || "")
    .trim()
    .toUpperCase();
  const code = text.match(/\b[A-Z]{3}\b/)?.[0] || text.slice(0, 3);
  return airportByIata.get(code);
}

function distanceInKm(origin, destination) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const latitudeDelta = toRadians(Number(destination.lat) - Number(origin.lat));
  const longitudeDelta = toRadians(
    Number(destination.lon) - Number(origin.lon),
  );
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(Number(origin.lat))) *
      Math.cos(toRadians(Number(destination.lat))) *
      Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(
    earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}

export default function Form({
  handleOnSubmit,
  handleSightseeingOnClick,
  handleExpenseOnClick,
  inputDestinationName,
  setInputDestinationName,
  inputTripStart,
  setInputTripStart,
  inputTripEnd,
  setInputTripEnd,
  setInputTransportType,
  setInputTripDeparture,
  setInputTripArrival,
  setInputTripAccommodation,
  inputCheckinDate,
  setInputCheckinDate,
  setInputCheckinTime,
  inputCheckoutDate,
  setInputCheckoutDate,
  setInputCheckoutTime,
  setInputNotes,
  notes,
  setNotes,
  transportLegs,
  setTransportLegs,
  carRental,
  setCarRental,
  accommodations,
  setAccommodations,
  inputTransportType,
  inputTripDeparture,
  inputTripArrival,
  inputTripAccommodation,
  inputCheckinTime,
  inputCheckoutTime,
  allSightseeings,
  setAllSightseeings,
  inputSightseeing,
  setInputSightseeing,
  allExpenses,
  setAllExpenses,
  inputExpenseName,
  setInputExpenseName,
  inputExpenseValue,
  setInputExpenseValue,
  currency,
  setCurrency,
  inputNotes,
}) {
  const [flightTimeError, setFlightTimeError] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [activeCityField, setActiveCityField] = useState("");

  useEffect(() => {
    document
      .querySelectorAll('.TripForm input[placeholder="Airport"]')
      .forEach((input) => input.setAttribute("list", "atlas-airports"));
  }, [transportLegs]);

  useEffect(() => {
    const query = citySearch.trim();
    if (query.length < 3 || !process.env.REACT_APP_MAPBOX_KEY) {
      setCityOptions([]);
      return undefined;
    }

    let cancelled = false;
    const request = setTimeout(() => {
      fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&types=place,locality&limit=8&access_token=${process.env.REACT_APP_MAPBOX_KEY}`,
      )
        .then((response) => (response.ok ? response.json() : { features: [] }))
        .then((data) => {
          if (cancelled) return;
          setCityOptions(
            (data.features || []).map((feature) => ({
              name:
                feature.properties?.full_address ||
                [
                  feature.properties?.name || feature.text,
                  feature.properties?.place_formatted,
                ]
                  .filter(Boolean)
                  .join(", "),
              coordinates: feature.geometry?.coordinates || null,
            })),
          );
        })
        .catch(() => {
          if (!cancelled) setCityOptions([]);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(request);
    };
  }, [citySearch]);

  function flightTimezone(leg) {
    const origin = airportFor(leg.departureLocation);
    const destination = airportFor(leg.arrivalLocation);
    if (!origin || !destination) return "";
    return `${tzLookup(Number(origin.lat), Number(origin.lon))} → ${tzLookup(Number(destination.lat), Number(destination.lon))}`;
  }

  function flightDistance(leg) {
    const origin = airportFor(leg.departureLocation);
    const destination = airportFor(leg.arrivalLocation);
    if (!origin || !destination) return "";
    return `${distanceInKm(origin, destination).toLocaleString()} km`;
  }

  function busDuration(leg) {
    if (
      !leg.departureDate ||
      !leg.arrivalDate ||
      !leg.departureTime ||
      !leg.arrivalTime
    )
      return "";
    const departure = new Date(`${leg.departureDate}T${leg.departureTime}`);
    const arrival = new Date(`${leg.arrivalDate}T${leg.arrivalTime}`);
    const minutes = Math.round(
      (arrival.getTime() - departure.getTime()) / 60000,
    );
    if (!Number.isFinite(minutes) || minutes < 0) return "";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function busDistance(leg) {
    const [departureLongitude, departureLatitude] =
      leg.departureLocationCoordinates || [];
    const [arrivalLongitude, arrivalLatitude] =
      leg.arrivalLocationCoordinates || [];
    if (
      ![
        departureLongitude,
        departureLatitude,
        arrivalLongitude,
        arrivalLatitude,
      ].every(Number.isFinite)
    )
      return "";
    return `${distanceInKm({ lat: departureLatitude, lon: departureLongitude }, { lat: arrivalLatitude, lon: arrivalLongitude }).toLocaleString()} km`;
  }

  function trainDuration(leg) {
    return busDuration(leg);
  }

  function trainDistance(leg) {
    return busDistance(leg);
  }

  function localTimeToUtc(date, time, timeZone) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const target = Date.UTC(year, month - 1, day, hour, minute);
    let timestamp = target;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date(timestamp));
      const value = (name) =>
        Number(parts.find((part) => part.type === name).value);
      const renderedAsUtc = Date.UTC(
        value("year"),
        value("month") - 1,
        value("day"),
        value("hour"),
        value("minute"),
      );
      timestamp += target - renderedAsUtc;
    }
    return timestamp;
  }

  function timezoneOffsetMinutes(timestamp, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp));
    const value = (name) =>
      Number(parts.find((part) => part.type === name).value);
    return (
      (Date.UTC(
        value("year"),
        value("month") - 1,
        value("day"),
        value("hour"),
        value("minute"),
      ) -
        timestamp) /
      60000
    );
  }

  function flightDuration(leg) {
    const origin = airportFor(leg.departureLocation);
    const destination = airportFor(leg.arrivalLocation);
    const departureDate = leg.departureDate || inputTripStart;
    if (
      !origin ||
      !destination ||
      !departureDate ||
      !leg.departureTime ||
      !leg.arrivalTime
    )
      return "";
    const departureUtc = localTimeToUtc(
      departureDate,
      leg.departureTime,
      tzLookup(Number(origin.lat), Number(origin.lon)),
    );
    let arrivalUtc = localTimeToUtc(
      departureDate,
      leg.arrivalTime,
      tzLookup(Number(destination.lat), Number(destination.lon)),
    );
    // Only one date is collected. If a flight arrives after midnight at the
    // destination, infer the following local calendar day for the calculation.
    if (arrivalUtc <= departureUtc) arrivalUtc += 24 * 60 * 60 * 1000;
    const minutes = Math.round((arrivalUtc - departureUtc) / 60000);
    const originZone = tzLookup(Number(origin.lat), Number(origin.lon));
    const destinationZone = tzLookup(
      Number(destination.lat),
      Number(destination.lon),
    );
    const zoneDifference = Math.round(
      timezoneOffsetMinutes(arrivalUtc, destinationZone) -
        timezoneOffsetMinutes(departureUtc, originZone),
    );
    const sign = zoneDifference >= 0 ? "+" : "-";
    const absoluteDifference = Math.abs(zoneDifference);
    const zoneText =
      absoluteDifference % 60
        ? `${sign}${Math.floor(absoluteDifference / 60)}h ${absoluteDifference % 60}m`
        : `${sign}${absoluteDifference / 60}h`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m (${zoneText})`;
  }

  function hasInvalidFlightTime(leg) {
    const origin = airportFor(leg.departureLocation);
    const destination = airportFor(leg.arrivalLocation);
    const departureDate = leg.departureDate || inputTripStart;
    if (
      leg.type !== "plane" ||
      !origin ||
      !destination ||
      !departureDate ||
      !leg.departureTime ||
      !leg.arrivalTime
    )
      return false;
    const departureUtc = localTimeToUtc(
      departureDate,
      leg.departureTime,
      tzLookup(Number(origin.lat), Number(origin.lon)),
    );
    let arrivalUtc = localTimeToUtc(
      departureDate,
      leg.arrivalTime,
      tzLookup(Number(destination.lat), Number(destination.lon)),
    );
    if (arrivalUtc <= departureUtc) arrivalUtc += 24 * 60 * 60 * 1000;
    return arrivalUtc - departureUtc >= 20 * 60 * 60 * 1000;
  }

  function submitTrip(event) {
    if (transportLegs.some(hasInvalidFlightTime)) {
      event.preventDefault();
      setFlightTimeError(
        "This flight would take 20 hours or more after timezone conversion. Check the arrival time.",
      );
      return;
    }
    setFlightTimeError("");
    handleOnSubmit(event);
  }
  const createTransportLeg = (type = "plane") => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    company: "",
    bookingReference: "",
    departureLocation: "",
    departureLocationCoordinates: null,
    departureAddress: "",
    arrivalLocation: "",
    arrivalLocationCoordinates: null,
    arrivalAddress: "",
    departureTime: "",
    departureDate: "",
    arrivalTime: "",
    arrivalDate: "",
    seat: "",
    vehicleNumber: "",
    hasConnection: false,
  });

  const createAccommodation = () => ({
    id: `${Date.now()}-${Math.random()}`,
    name: "",
    provider: "",
    reservationNumber: "",
    type: "",
    address: "",
    checkinDate: "",
    checkinTime: "",
    checkoutDate: "",
    checkoutTime: "",
  });

  function updateTransportLeg(index, field, value) {
    setTransportLegs(
      transportLegs.map((leg, legIndex) =>
        legIndex === index ? { ...leg, [field]: value } : leg,
      ),
    );
  }

  function updateTransportLocation(index, field, value, coordinates = null) {
    setTransportLegs(
      transportLegs.map((leg, legIndex) =>
        legIndex === index
          ? { ...leg, [field]: value, [`${field}Coordinates`]: coordinates }
          : leg,
      ),
    );
  }

  function changeTransportType(index, type) {
    setTransportLegs(
      transportLegs.map((leg, legIndex) =>
        legIndex === index ? { ...createTransportLeg(type), id: leg.id } : leg,
      ),
    );
  }

  function renderLocationInput(leg, index, field) {
    const isAirport = leg.type === "plane";
    const fieldId = `${leg.id}-${field}`;
    return (
      <div className={isAirport ? "" : "cityAutocomplete"}>
        <input
          list={isAirport ? "atlas-airports" : undefined}
          placeholder={isAirport ? "Airport" : "City"}
          value={leg[field]}
          onFocus={() => {
            if (!isAirport) {
              setActiveCityField(fieldId);
              setCitySearch(leg[field]);
            }
          }}
          onBlur={() => setTimeout(() => setActiveCityField(""), 150)}
          onChange={(event) => {
            updateTransportLocation(index, field, event.target.value);
            if (!isAirport) {
              setActiveCityField(fieldId);
              setCitySearch(event.target.value);
            }
          }}
        />
        {!isAirport &&
          activeCityField === fieldId &&
          cityOptions.length > 0 && (
            <div className="citySuggestions" role="listbox">
              {cityOptions.map((city) => (
                <button
                  type="button"
                  key={`${city.name}-${city.coordinates?.join("-")}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    updateTransportLocation(
                      index,
                      field,
                      city.name,
                      city.coordinates,
                    );
                    setActiveCityField("");
                  }}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}
      </div>
    );
  }

  function updateAccommodation(index, field, value) {
    setAccommodations(
      accommodations.map((stay, stayIndex) =>
        stayIndex === index ? { ...stay, [field]: value } : stay,
      ),
    );
  }
  function renderSightseeings() {
    const listOfSightseeings = allSightseeings.map((sightSeeing) => {
      return (
        <SightSeeings
          name={sightSeeing.sightseeing}
          key={sightSeeing.sightseeing}
          onClickToRemove={handleToRemove}
        />
      );
    });
    return listOfSightseeings;
  }

  function renderExpenses() {
    const listOfExpenses = allExpenses.map((expense) => {
      return (
        <Expense
          name={expense.name}
          value={expense.value}
          key={expense.name + expense.value}
          onClickExpenseRemove={handleRemoveExpense}
          currency={currency}
        />
      );
    });
    return listOfExpenses;
  }

  function handleToRemove(sightseeing) {
    const newSightseeings = allSightseeings.filter((singleSightseeing) => {
      return singleSightseeing.sightseeing !== sightseeing;
    });
    setAllSightseeings(newSightseeings);
  }
  function handleRemoveExpense(expense) {
    const newExpenses = allExpenses.filter((singleExpense) => {
      return singleExpense.name !== expense;
    });
    setAllExpenses(newExpenses);
  }

  function sumFunction() {
    const sum = allExpenses.reduce(function (prev, cur) {
      return prev + cur.value;
    }, 0);
    return sum;
  }

  return (
    <form className="TripForm" onSubmit={submitTrip}>
      <datalist id="atlas-airports">
        {airportOptions.map((airport) => (
          <option
            key={airport.iata}
            value={`${airport.iata} — ${airport.displayName}`}
            label={`${airport.displayName}, ${airport.iso}`}
          />
        ))}
      </datalist>
      <datalist id="atlas-cities">
        {cityOptions.map((city) => (
          <option
            key={`${city.name}-${city.coordinates?.join("-")}`}
            value={city.name}
          />
        ))}
      </datalist>
      <div className="formHeader">
        <p className="formSectionTitle">TRIP ESSENTIALS</p>
        <label className="tripNameForm" htmlFor="tripName">
          Destination Name
          <input
            onChange={(e) => {
              setInputDestinationName(e.target.value);
            }}
            value={inputDestinationName}
            id="tripName"
            type="text"
            placeholder="Type your destination"
            maxLength="17"
            required
          ></input>
        </label>
        <div className="formTravelDates">
          <label className="tripStartForm" htmlFor="tripStart">
            START
            <input
              onChange={(e) => {
                setInputTripStart(e.target.value);
              }}
              value={inputTripStart}
              id="tripStart"
              type="date"
              max={inputTripEnd}
              required
            ></input>
          </label>

          <label className="tripEndForm" htmlFor="tripEnd">
            END
            <input
              onChange={(e) => {
                setInputTripEnd(e.target.value);
              }}
              value={inputTripEnd}
              id="tripEnd"
              type="date"
              min={inputTripStart}
              required
            ></input>
          </label>
        </div>
      </div>
      <div className="formTransport">
        <p className="formSectionTitle">TRANSPORT</p>
        {transportLegs.length > 0 && (
          <div className="detailCollection">
            {transportLegs.map((leg, index) => (
              <div className="detailCard" key={leg.id}>
                <div className="detailCardHeader">
                  <div className="transportDetailTitle">
                    <span className="transportTypeIcon" aria-hidden="true">
                      <i
                        className={`fas ${leg.type === "plane" ? "fa-plane" : leg.type === "bus" ? "fa-bus" : "fa-train"}`}
                      ></i>
                    </span>
                    <strong>
                      {index === 0 ? "MAIN JOURNEY" : "CONNECTION " + index}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="removeDetailButton"
                    onClick={() =>
                      setTransportLegs(
                        transportLegs.filter((item) => item.id !== leg.id),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
                <div
                  className={`detailFields transportFields ${leg.type === "plane" ? "isPlane" : leg.type === "bus" ? "isBus" : "isTrain"}`}
                >
                  <label>
                    TYPE
                    <select
                      value={leg.type}
                      onChange={(e) =>
                        changeTransportType(index, e.target.value)
                      }
                    >
                      <option value="plane">Plane</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                    </select>
                  </label>
                  <>
                    <label>
                      {leg.type === "plane"
                        ? "AIRLINE"
                        : leg.type === "bus"
                          ? "BUS COMPANY"
                          : "TRAIN OPERATOR"}
                      <input
                        placeholder={
                          leg.type === "plane"
                            ? "e.g. Lufthansa"
                            : "Company name"
                        }
                        value={leg.company}
                        onChange={(e) =>
                          updateTransportLeg(index, "company", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      {leg.type === "bus"
                        ? "RESERVATION CODE"
                        : leg.type === "train"
                          ? "TICKET / TRAIN NUMBER"
                          : "BOOKING / TICKET NUMBER"}
                      <input
                        placeholder={
                          leg.type === "train"
                            ? "e.g. ICE 123 / AB12CD"
                            : "e.g. AB12CD"
                        }
                        value={
                          leg.type === "train"
                            ? leg.bookingReference || leg.vehicleNumber
                            : leg.bookingReference
                        }
                        onChange={(e) =>
                          updateTransportLeg(
                            index,
                            "bookingReference",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                    {leg.type === "plane" && (
                      <label>
                        FLIGHT NUMBER
                        <input
                          placeholder="e.g. LH 123"
                          value={leg.vehicleNumber}
                          onChange={(e) =>
                            updateTransportLeg(
                              index,
                              "vehicleNumber",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    )}
                    <label>
                      DEPARTURE PLACE
                      {renderLocationInput(leg, index, "departureLocation")}
                    </label>
                    <label>
                      ARRIVAL PLACE
                      {renderLocationInput(leg, index, "arrivalLocation")}
                    </label>
                    {leg.type === "plane" && (
                      <>
                        <label>
                          DEPARTURE ADDRESS
                          <input
                            placeholder="Street and number"
                            value={leg.departureAddress}
                            onChange={(e) =>
                              updateTransportLeg(
                                index,
                                "departureAddress",
                                e.target.value,
                              )
                            }
                          />
                        </label>
                        <label>
                          ARRIVAL ADDRESS
                          <input
                            placeholder="Street and number"
                            value={leg.arrivalAddress}
                            onChange={(e) =>
                              updateTransportLeg(
                                index,
                                "arrivalAddress",
                                e.target.value,
                              )
                            }
                          />
                        </label>
                      </>
                    )}
                  </>
                  {leg.type === "plane" && (
                    <label className="flightDateField">
                      DEPARTURE DATE
                      <input
                        type="date"
                        min={inputTripStart}
                        max={inputTripEnd}
                        value={leg.departureDate || ""}
                        onChange={(e) =>
                          updateTransportLeg(
                            index,
                            "departureDate",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  )}
                  {leg.type === "bus" && (
                    <>
                      <label>
                        DEPARTURE DATE
                        <input
                          type="date"
                          min={inputTripStart}
                          max={inputTripEnd}
                          value={leg.departureDate || ""}
                          onChange={(e) =>
                            updateTransportLeg(
                              index,
                              "departureDate",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        ARRIVAL DATE
                        <input
                          type="date"
                          min={inputTripStart}
                          max={inputTripEnd}
                          value={leg.arrivalDate || ""}
                          onChange={(e) =>
                            updateTransportLeg(
                              index,
                              "arrivalDate",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </>
                  )}
                  {leg.type === "train" && (
                    <>
                      <label>
                        DEPARTURE DATE
                        <input
                          type="date"
                          min={inputTripStart}
                          max={inputTripEnd}
                          value={leg.departureDate || ""}
                          onChange={(e) =>
                            updateTransportLeg(
                              index,
                              "departureDate",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        ARRIVAL DATE
                        <input
                          type="date"
                          min={inputTripStart}
                          max={inputTripEnd}
                          value={leg.arrivalDate || ""}
                          onChange={(e) =>
                            updateTransportLeg(
                              index,
                              "arrivalDate",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </>
                  )}
                  <>
                    <label>
                      DEPARTURE TIME
                      <input
                        type="time"
                        value={leg.departureTime}
                        onChange={(e) =>
                          updateTransportLeg(
                            index,
                            "departureTime",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                    <label>
                      ARRIVAL TIME
                      <input
                        type="time"
                        value={leg.arrivalTime}
                        onChange={(e) =>
                          updateTransportLeg(
                            index,
                            "arrivalTime",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  </>
                  {leg.type === "bus" && (
                    <label className="busMetricDuration">
                      TRIP DURATION
                      <input
                        readOnly
                        value={busDuration(leg)}
                        placeholder="Duration (calculated)"
                      />
                    </label>
                  )}
                  {leg.type === "train" && (
                    <label className="trainMetricDuration">
                      TRIP DURATION
                      <input
                        readOnly
                        value={trainDuration(leg)}
                        placeholder="Duration (calculated)"
                      />
                    </label>
                  )}
                  {leg.type === "plane" && (
                    <label className="flightMetricDuration">
                      FLIGHT DURATION
                      <input
                        readOnly
                        value={flightDuration(leg)}
                        placeholder="Duration (calculated)"
                        title={flightTimezone(leg)}
                      />
                    </label>
                  )}
                  {leg.type === "plane" && (
                    <label className="flightMetricDistance">
                      DISTANCE
                      <input
                        readOnly
                        value={flightDistance(leg)}
                        placeholder="Distance (calculated)"
                      />
                    </label>
                  )}
                  {leg.type === "bus" && (
                    <label className="busMetricDistance">
                      DISTANCE
                      <input
                        readOnly
                        value={busDistance(leg)}
                        placeholder="Distance (calculated)"
                      />
                    </label>
                  )}
                  {leg.type === "train" && (
                    <label className="trainMetricDistance">
                      DISTANCE
                      <input
                        readOnly
                        value={trainDistance(leg)}
                        placeholder="Distance (calculated)"
                      />
                    </label>
                  )}
                  <label>
                    {leg.type === "plane" || leg.type === "train"
                      ? "SEAT(S)"
                      : "SEAT(S) / PLATFORM"}
                    <input
                      placeholder={
                        leg.type === "plane" || leg.type === "train"
                          ? "e.g. 12A, 12B"
                          : "e.g. 7, 8"
                      }
                      value={leg.seat}
                      onChange={(e) =>
                        updateTransportLeg(index, "seat", e.target.value)
                      }
                    />
                  </label>
                </div>
                {leg.type === "plane" && (
                  <label className="connectionToggle">
                    <input
                      type="checkbox"
                      checked={leg.hasConnection}
                      onChange={(e) => {
                        const hasConnection = e.target.checked;
                        updateTransportLeg(
                          index,
                          "hasConnection",
                          hasConnection,
                        );
                        if (hasConnection && index === transportLegs.length - 1)
                          setTransportLegs([
                            ...transportLegs.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, hasConnection }
                                : item,
                            ),
                            createTransportLeg("plane"),
                          ]);
                      }}
                    />
                    This flight has a connection
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="addDetailButton"
          onClick={() =>
            setTransportLegs([...transportLegs, createTransportLeg()])
          }
        >
          + Add transport
        </button>
        <label className="rentalToggle">
          <input
            type="checkbox"
            checked={carRental.enabled}
            onChange={(e) =>
              setCarRental({ ...carRental, enabled: e.target.checked })
            }
          />
          I will rent a car
        </label>
        {flightTimeError && (
          <p className="flightTimeError">{flightTimeError}</p>
        )}
        {carRental.enabled && (
          <div className="detailCard rentalCard">
            <div className="detailCardHeader">
              <strong>CAR RENTAL</strong>
            </div>
            <div className="detailFields rentalFields">
              <label>
                RENTAL COMPANY
                <input
                  placeholder="e.g. Sixt"
                  value={carRental.company}
                  onChange={(e) =>
                    setCarRental({ ...carRental, company: e.target.value })
                  }
                />
              </label>
              <label>
                CAR TYPE
                <input
                  placeholder="e.g. Compact SUV"
                  value={carRental.carType}
                  onChange={(e) =>
                    setCarRental({ ...carRental, carType: e.target.value })
                  }
                />
              </label>
              <label>
                RESERVATION NUMBER
                <input
                  placeholder="e.g. CR-12345"
                  value={carRental.reservationNumber}
                  onChange={(e) =>
                    setCarRental({
                      ...carRental,
                      reservationNumber: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                PICK-UP DATE
                <input
                  type="date"
                  min={inputTripStart}
                  max={inputTripEnd}
                  value={carRental.pickupDate || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, pickupDate: e.target.value })
                  }
                />
              </label>
              <label>
                DROP-OFF DATE
                <input
                  type="date"
                  min={inputTripStart}
                  max={inputTripEnd}
                  value={carRental.dropoffDate || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, dropoffDate: e.target.value })
                  }
                />
              </label>
              <label>
                FUEL TYPE
                <select
                  value={carRental.fuelType || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, fuelType: e.target.value })
                  }
                >
                  <option value="">Select fuel</option>
                  <option value="electric">Electric</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                </select>
              </label>
              <label>
                PICK-UP TIME
                <input
                  type="time"
                  value={carRental.pickupTime || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, pickupTime: e.target.value })
                  }
                />
              </label>
              <label>
                DROP-OFF TIME
                <input
                  type="time"
                  value={carRental.dropoffTime || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, dropoffTime: e.target.value })
                  }
                />
              </label>
              <label>
                TRANSMISSION
                <select
                  value={carRental.transmission || ""}
                  onChange={(e) =>
                    setCarRental({ ...carRental, transmission: e.target.value })
                  }
                >
                  <option value="">Select transmission</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
              <label className="pickupAddressField">
                {carRental.differentDropoffAddress
                  ? "PICK-UP LOCATION"
                  : "PICK-UP AND DROP-OFF LOCATION"}
                <input
                  placeholder="Street, number, city"
                  value={carRental.address}
                  onChange={(e) =>
                    setCarRental({ ...carRental, address: e.target.value })
                  }
                />
              </label>
              <label className="dropoffToggle">
                <input
                  type="checkbox"
                  checked={Boolean(carRental.differentDropoffAddress)}
                  onChange={(e) =>
                    setCarRental({
                      ...carRental,
                      differentDropoffAddress: e.target.checked,
                    })
                  }
                />
                Different drop-off location
              </label>
              {carRental.differentDropoffAddress && (
                <label className="detailFieldWide">
                  DROP-OFF LOCATION
                  <input
                    placeholder="Street, number, city"
                    value={carRental.dropoffAddress || ""}
                    onChange={(e) =>
                      setCarRental({
                        ...carRental,
                        dropoffAddress: e.target.value,
                      })
                    }
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="formAccommodation">
        <p className="formSectionTitle">ACCOMMODATION</p>
        {accommodations.length > 0 && (
          <div className="detailCollection">
            {accommodations.map((stay, index) => (
              <div className="detailCard" key={stay.id}>
                <div className="detailCardHeader">
                  <strong>STAY {index + 1}</strong>
                  <button
                    type="button"
                    className="removeDetailButton"
                    onClick={() =>
                      setAccommodations(
                        accommodations.filter((item) => item.id !== stay.id),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="detailFields">
                  <label>
                    PROPERTY NAME
                    <input
                      placeholder="e.g. Hotel Aurora"
                      value={stay.name}
                      onChange={(e) =>
                        updateAccommodation(index, "name", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    TYPE
                    <select
                      value={stay.type}
                      onChange={(e) =>
                        updateAccommodation(index, "type", e.target.value)
                      }
                    >
                      <option value="">Select type</option>
                      <option>Hotel</option>
                      <option>Hostel</option>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Resort</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    BOOKING PROVIDER
                    <input
                      placeholder="Booking.com, Airbnb..."
                      value={stay.provider}
                      onChange={(e) =>
                        updateAccommodation(index, "provider", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    RESERVATION NUMBER
                    <input
                      placeholder="e.g. 123456789"
                      value={stay.reservationNumber}
                      onChange={(e) =>
                        updateAccommodation(
                          index,
                          "reservationNumber",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    CHECK-IN DATE
                    <input
                      type="date"
                      min={inputTripStart}
                      max={inputTripEnd}
                      value={stay.checkinDate}
                      onChange={(e) =>
                        updateAccommodation(
                          index,
                          "checkinDate",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    CHECK-IN TIME
                    <input
                      type="time"
                      value={stay.checkinTime}
                      onChange={(e) =>
                        updateAccommodation(
                          index,
                          "checkinTime",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    CHECK-OUT DATE
                    <input
                      type="date"
                      min={inputTripStart}
                      max={inputTripEnd}
                      value={stay.checkoutDate}
                      onChange={(e) =>
                        updateAccommodation(
                          index,
                          "checkoutDate",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    CHECK-OUT TIME
                    <input
                      type="time"
                      value={stay.checkoutTime}
                      onChange={(e) =>
                        updateAccommodation(
                          index,
                          "checkoutTime",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className="detailFieldWide">
                    ADDRESS
                    <input
                      placeholder="Street, number, city"
                      value={stay.address}
                      onChange={(e) =>
                        updateAccommodation(index, "address", e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="addDetailButton"
          onClick={() =>
            setAccommodations([...accommodations, createAccommodation()])
          }
        >
          + Add accommodation
        </button>
      </div>
      <div className="formSightseeings">
        <p className="formSectionTitle">SIGHTSEEINGS</p>
        <div className="sightSeeingHeader">
          <label>
            <input
              type="text"
              value={inputSightseeing}
              onChange={(e) => {
                e.preventDefault();
                setInputSightseeing(e.target.value);
              }}
              id="tripSightseeings"
              placeholder="New Sightseeing"
              maxLength="14"
            ></input>
            <button
              className="addSightseeingButton"
              onClick={handleSightseeingOnClick}
            >
              Add
            </button>
          </label>
        </div>
        <div className="sightseeingsList">{renderSightseeings()}</div>
      </div>
      <div className="formExpenses">
        <p className="formSectionTitle">EXPENSES</p>
        <div className="expensesHeader">
          <label>
            <input
              type="text"
              maxLength="13"
              value={inputExpenseName}
              onChange={(e) => {
                e.preventDefault();
                setInputExpenseName(e.target.value);
              }}
              id="tripExpensesName"
              placeholder="New Expense"
            ></input>
            <input
              type="number"
              min="0"
              max="9999"
              onInput={(e) => {
                if (e.target.value.length > 4) {
                  e.target.value = e.target.value.slice(0, 4);
                }
              }}
              value={inputExpenseValue}
              onChange={(e) => {
                e.preventDefault();
                setInputExpenseValue(e.target.value);
              }}
              id="tripExpensesNameValue"
              placeholder="0"
            ></input>
            <select
              onChange={(e) => {
                setCurrency(e.target.value);
              }}
              id="tripExpensesCurrency"
              value={currency}
            >
              <option value="€">€</option>
              <option value="$">$</option>
              <option value="£">£</option>
            </select>
            <button className="addExpenseButton" onClick={handleExpenseOnClick}>
              Add
            </button>
          </label>
        </div>
        <div>
          <div>{renderExpenses()}</div>
          <p className="expensesSum">
            {currency}
            {sumFunction()}
          </p>
        </div>
      </div>
      <div className="formNotes">
        <p className="formSectionTitle">NOTES</p>
        <textarea
          className="notesTextArea"
          value={
            notes[0]?.message ||
            (typeof inputNotes === "string" ? inputNotes : "")
          }
          onChange={(e) => {
            setInputNotes(e.target.value);
            setNotes([{ id: "note-1", message: e.target.value }]);
          }}
          placeholder="Write any notes for this trip..."
        />
      </div>
      <div className="tripFooter">
        <button className="formTripButton" type="submit">
          Confirm
        </button>
        <Link className="cancelTrip" to="/myTrips">
          <button className="tripCancelButton">Cancel</button>
        </Link>
      </div>
    </form>
  );
}
