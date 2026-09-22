import "./styles/Trip.css";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { getSingleTripFromLocalStorage } from "../services/myTripsStorage";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TripLocationsMap from "./TripLocationsMap";
import { useTranslation } from "../i18n";

function formatDate(date) {
  if (!date) return "Not added";
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Section({ icon, title, count, children, className = "" }) {
  return (
    <section className={"tripDetailSection " + className}>
      <div className="tripDetailSectionHeader">
        <span className="tripDetailSectionIcon" aria-hidden="true">
          <i className={"fas " + icon}></i>
        </span>
        <div>
          <p className="tripDetailSectionEyebrow">TRIP PLAN</p>
          <h3>{title}</h3>
        </div>
        {typeof count === "number" && (
          <span className="tripDetailSectionCount">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoItem({ label, children, empty = false }) {
  return (
    <div className={"tripInfoItem" + (empty ? " isEmpty" : "")}>
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function TransportEntry({ leg, index }) {
  const type = leg.type || "transport";
  const icon =
    type === "plane"
      ? "fa-plane"
      : type === "bus"
        ? "fa-bus"
        : type === "car"
          ? "fa-car"
          : "fa-train";
  const routeIsComplete = leg.departureLocation && leg.arrivalLocation;

  return (
    <article className="tripEntryCard">
      <div className="tripEntryHeading">
        <span className="tripEntryIcon" aria-hidden="true">
          <i className={"fas " + icon}></i>
        </span>
        <div>
          <p>{index === 0 ? "MAIN JOURNEY" : "CONNECTION " + index}</p>
          <h4>{type}</h4>
        </div>
      </div>
      <div className={"tripRoute" + (routeIsComplete ? "" : " isEmpty")}>
        <span>{leg.departureLocation || "Departure place not added"}</span>
        <i className="fas fa-long-arrow-alt-right" aria-hidden="true"></i>
        <span>{leg.arrivalLocation || "Arrival place not added"}</span>
      </div>
      <div className="tripInfoGrid">
        <InfoItem label="DATE" empty={!leg.departureDate}>
          {formatDate(leg.departureDate)}
        </InfoItem>
        <InfoItem label="TIME" empty={!leg.departureTime && !leg.arrivalTime}>
          {(leg.departureTime || "Not added") + " → " + (leg.arrivalTime || "Not added")}
        </InfoItem>
        {type !== "car" && (
          <>
            <InfoItem
              label={type === "plane" ? "FLIGHT" : type === "train" ? "TICKET / TRAIN" : "RESERVATION"}
              empty={!leg.vehicleNumber && !leg.bookingReference}
            >
              {leg.vehicleNumber || leg.bookingReference || "Not added"}
            </InfoItem>
            <InfoItem label="SEAT(S)" empty={!leg.seat}>
              {leg.seat || "Not added"}
            </InfoItem>
          </>
        )}
      </div>
      {(leg.company || leg.bookingReference) && (
        <p className="tripEntryFootnote">
          {[leg.company, leg.bookingReference && "Booking " + leg.bookingReference]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </article>
  );
}

function AccommodationEntry({ stay, index }) {
  const isOtherAccommodation = stay.type === "Other";
  return (
    <article className="tripEntryCard">
      <div className="tripEntryHeading">
        <span className="tripEntryIcon" aria-hidden="true">
          <i className="fas fa-bed"></i>
        </span>
        <div>
          <p>{"STAY " + (index + 1)}</p>
          <h4>{stay.name || "Accommodation not added"}</h4>
        </div>
      </div>
      <div className="tripInfoGrid">
        {!isOtherAccommodation && (
          <InfoItem label="TYPE" empty={!stay.type}>
            {stay.type || "Not added"}
          </InfoItem>
        )}
        {(!isOtherAccommodation || stay.provider) && (
          <InfoItem label="PROVIDER" empty={!stay.provider}>
            {stay.provider || "Not added"}
          </InfoItem>
        )}
        {(!isOtherAccommodation || stay.checkinDate || stay.checkinTime) && (
          <InfoItem label="CHECK-IN" empty={!stay.checkinDate && !stay.checkinTime}>
            {stay.checkinDate
              ? formatDate(stay.checkinDate) + " · " + (stay.checkinTime || "Not added")
              : stay.checkinTime}
          </InfoItem>
        )}
        {(!isOtherAccommodation || stay.checkoutDate || stay.checkoutTime) && (
          <InfoItem label="CHECK-OUT" empty={!stay.checkoutDate && !stay.checkoutTime}>
            {stay.checkoutDate
              ? formatDate(stay.checkoutDate) + " · " + (stay.checkoutTime || "Not added")
              : stay.checkoutTime}
          </InfoItem>
        )}
      </div>
      {(stay.address || stay.reservationNumber) && (
        <p className="tripEntryFootnote">
          {[stay.reservationNumber && "Booking " + stay.reservationNumber, stay.address]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </article>
  );
}

export default function Trip() {
  const { t } = useTranslation();
  const history = useHistory();
  const [singleTrip, setSingleTrip] = useState();
  const [countryFlag, setCountryFlag] = useState("");
  const { id } = useParams();

  useEffect(() => {
    setSingleTrip(getSingleTripFromLocalStorage(id));
  }, [id]);

  useEffect(() => {
    const destination = singleTrip?.name?.trim();
    const coordinates = singleTrip?.destinationCoordinates;
    if (!destination) {
      setCountryFlag("");
      return undefined;
    }

    let cancelled = false;
    fetch(
      Array.isArray(coordinates) && coordinates.length === 2
        ? "https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=" +
          coordinates[1] +
          "&lon=" +
          coordinates[0]
        : "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=" +
          encodeURIComponent(destination),
    )
      .then((response) => (response.ok ? response.json() : []))
      .then((results) => {
        const location = Array.isArray(results) ? results[0] : results;
        const countryCode = location?.address?.country_code?.toLowerCase();
        if (!cancelled) {
          setCountryFlag(
            countryCode ? "https://flagcdn.com/w80/" + countryCode + ".png" : "",
          );
        }
      })
      .catch(() => !cancelled && setCountryFlag(""));

    return () => {
      cancelled = true;
    };
  }, [singleTrip?.name, singleTrip?.destinationCoordinates]);

  if (!singleTrip) return "";

  const transportLegs = Array.isArray(singleTrip.transportLegs)
    ? singleTrip.transportLegs
    : [];
  const accommodations = Array.isArray(singleTrip.accommodations)
    ? singleTrip.accommodations
    : [];
  const sightseeings = Array.isArray(singleTrip.sightseeings)
    ? singleTrip.sightseeings
    : [];
  const expenses = Array.isArray(singleTrip.expenses) ? singleTrip.expenses : [];
  const notes = Array.isArray(singleTrip.notes)
    ? singleTrip.notes.map((note) => note.message).filter(Boolean)
    : singleTrip.notes
      ? [singleTrip.notes]
      : [];
  const expenseTotals = expenses.reduce((totals, expense) => {
    const currency = expense.currency || "€";
    totals[currency] = (totals[currency] || 0) + Number(expense.value || 0);
    return totals;
  }, {});

  return (
    <div className="TripDetails">
      <div className="tripDetailsHeader">
        <h2>{t("TRIP DETAILS")}</h2>
      </div>
      <div className="tripDetailsTitle">
        <span>{String(singleTrip.name || "").split(" — ")[0]}</span>
        {countryFlag && (
          <img src={countryFlag} alt={"Flag of " + singleTrip.name} />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="tripDetailsContent"
      >
        <section className="tripOverviewCard">
          <div className="tripOverviewDate">
            <span>START</span>
            <strong>{formatDate(singleTrip.start)}</strong>
          </div>
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
          <div className="tripOverviewDate">
            <span>END</span>
            <strong>{formatDate(singleTrip.end)}</strong>
          </div>
        </section>

        <Section icon="fa-route" title={t("Transport")} count={transportLegs.length}>
          {transportLegs.length ? (
            <div className="tripEntryCollection">
              {transportLegs.map((leg, index) => (
                <TransportEntry key={leg.id || index} leg={leg} index={index} />
              ))}
            </div>
          ) : (
            <p className="tripEmptyState">{t("No transport has been added yet.")}</p>
          )}
          {singleTrip.carRental?.enabled && (
            <article className="tripEntryCard tripRentalCard">
              <div className="tripEntryHeading">
                <span className="tripEntryIcon" aria-hidden="true">
                  <i className="fas fa-car"></i>
                </span>
                <div>
                  <p>OPTIONAL ADD-ON</p>
                  <h4>Car rental</h4>
                </div>
              </div>
              <div className="tripInfoGrid">
                <InfoItem label="COMPANY" empty={!singleTrip.carRental.company}>
                  {singleTrip.carRental.company || "Not added"}
                </InfoItem>
                <InfoItem label="CAR" empty={!singleTrip.carRental.carType}>
                  {singleTrip.carRental.carType || "Not added"}
                </InfoItem>
                <InfoItem label="PICK-UP" empty={!singleTrip.carRental.pickupDate}>
                  {formatDate(singleTrip.carRental.pickupDate)}
                </InfoItem>
                <InfoItem label="DROP-OFF" empty={!singleTrip.carRental.dropoffDate}>
                  {formatDate(singleTrip.carRental.dropoffDate)}
                </InfoItem>
              </div>
              {singleTrip.carRental.address && (
                <p className="tripEntryFootnote">{singleTrip.carRental.address}</p>
              )}
            </article>
          )}
        </Section>

        <Section icon="fa-bed" title={t("Accommodation")} count={accommodations.length}>
          {accommodations.length ? (
            <div className="tripEntryCollection">
              {accommodations.map((stay, index) => (
                <AccommodationEntry key={stay.id || index} stay={stay} index={index} />
              ))}
            </div>
          ) : (
            <p className="tripEmptyState">{t("No accommodation has been added yet.")}</p>
          )}
        </Section>

        <Section icon="fa-map-pin" title={t("Plan & expenses")}>
          <div className="tripPlanningGrid">
            <div className="tripPlanningCard">
              <p>{t("SIGHTSEEINGS")}</p>
              {sightseeings.length ? (
                <ul>
                  {sightseeings.map((item, index) => (
                    <li key={item.sightseeing + "-" + index}>
                      {String(item.sightseeing || "").split(" — ")[0]}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="tripEmptyText">{t("Not added yet")}</span>
              )}
            </div>
            <div className="tripPlanningCard">
              <p>{t("EXPENSES")}</p>
              {expenses.length ? (
                <div className="tripExpenseList">
                  {expenses.map((expense, index) => (
                    <span key={expense.name + "-" + index}>
                      {expense.name}
                      <strong>{(expense.currency || "€") + expense.value}</strong>
                    </span>
                  ))}
                  <b>
                    {"Total: " + Object.entries(expenseTotals)
                      .map(([currency, value]) => currency + value)
                      .join(" · ")}
                  </b>
                </div>
              ) : (
                <span className="tripEmptyText">{t("Not added yet")}</span>
              )}
            </div>
          </div>
        </Section>

        <TripLocationsMap trip={singleTrip} />

        <Section icon="fa-sticky-note" title={t("Notes")}>
          <div className={"tripNotes" + (notes.length ? "" : " isEmpty")}>
            {notes.length ? notes.join(" ") : t("No notes have been added yet.")}
          </div>
        </Section>
      </motion.div>

      <div className="tripDetailsFooter">
        <Link className="editLink" to={"/myTrips/" + singleTrip.id + "/edit"}>
          <button className="editTripButton">{t("Edit trip")}</button>
        </Link>
        <button
          className="editTripCancelButton"
          onClick={() => history.push("/myTrips")}
        >
          {t("Back to trips")}
        </button>
      </div>
    </div>
  );
}
