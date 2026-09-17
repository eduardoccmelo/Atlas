import "./styles/Trip.css";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { getSingleTripFromLocalStorage } from "../services/myTripsStorage";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Trip() {
  const history = useHistory();
  const [singleTrip, setSingleTrip] = useState();
  const { id } = useParams();

  const container = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.1,
      },
    },
  };

  useEffect(() => {
    const myTrip = getSingleTripFromLocalStorage(id);
    setSingleTrip(myTrip);
  }, [id]);

  function sumFunction() {
    const sum = singleTrip.expenses.reduce(function (prev, cur) {
      return prev + cur.value;
    }, 0);
    return `${singleTrip.expenses[0].currency}${sum}`;
  }

  function formatDate(date) {
    if (!date) return "Not added yet";
    return `${date.slice(8, 10)}.${new Date(date).toLocaleString("default", {
      month: "short",
    })}`;
  }

  function DetailField({ label, children, isEmpty = false }) {
    return (
      <div className={`tripDetailItem${isEmpty ? " isEmpty" : ""}`}>
        <div className="tripDetailsFieldTitle">{label}</div>
        <div className="tripDetailsFieldContent">{children}</div>
      </div>
    );
  }

  function transportSummary(leg) {
    return [
      leg.company,
      leg.vehicleNumber,
      leg.departureLocation && "From " + leg.departureLocation,
      leg.arrivalLocation && "to " + leg.arrivalLocation,
      leg.bookingReference && "Booking " + leg.bookingReference,
      leg.seat && "Seat " + leg.seat,
      leg.paidAmount && (leg.currency || "€") + leg.paidAmount,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function staySummary(stay) {
    return [
      stay.type,
      stay.provider,
      stay.reservationNumber && "Booking " + stay.reservationNumber,
      stay.address,
      stay.paidAmount && (stay.currency || "€") + stay.paidAmount,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function notesSummary(notes) {
    if (Array.isArray(notes)) {
      return notes.map((note) => note.message).filter(Boolean).join(" · ");
    }
    return notes || "";
  }

  return singleTrip ? (
    <div className="TripDetails">
      <div className="tripDetailsHeader">
        <h2>TRIP DETAILS</h2>
      </div>
      <div className="tripDetailsTitle">{singleTrip.name}</div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="tripDetailsContent"
      >
        <DetailField label="START / END">
          <i className="far fa-calendar-check"></i>
          {formatDate(singleTrip.start)} / {formatDate(singleTrip.end)}
        </DetailField>
        {(!singleTrip.transportLegs || singleTrip.transportLegs.length === 0) && (
          <DetailField
            label="TRANSPORT"
            isEmpty={!singleTrip.transportation || singleTrip.transportation === "none"}
          >
            {singleTrip.transportation && singleTrip.transportation !== "none"
              ? singleTrip.transportation
              : "Not added yet"}
          </DetailField>
        )}
        {singleTrip.transportLegs &&
          singleTrip.transportLegs.map((leg, index) => (
            <DetailField
              key={leg.id || index}
              label={(leg.type || "TRANSPORT") + " " + (index + 1)}
              isEmpty={!transportSummary(leg)}
            >
              {transportSummary(leg) || "Not added yet"}
            </DetailField>
          ))}
        <DetailField label="DEPARTURE" isEmpty={!singleTrip.departure}>
          <i className="far fa-clock"></i>
          {singleTrip.departure || "Not added yet"}
        </DetailField>
        <DetailField label="ARRIVAL" isEmpty={!singleTrip.arrival}>
          <i className="far fa-clock"></i>
          {singleTrip.arrival || "Not added yet"}
        </DetailField>
        {(!singleTrip.accommodations || singleTrip.accommodations.length === 0) && (
          <DetailField label="ACCOMMODATION" isEmpty={!singleTrip.accommodation}>
            {singleTrip.accommodation || "Not added yet"}
          </DetailField>
        )}
        {singleTrip.accommodations &&
          singleTrip.accommodations.map((stay, index) => (
            <DetailField
              key={stay.id || index}
              label={"STAY " + (index + 1)}
              isEmpty={!staySummary(stay)}
            >
              {staySummary(stay) || "Not added yet"}
            </DetailField>
          ))}
        {singleTrip.carRental && singleTrip.carRental.enabled && (
          <DetailField label="CAR RENTAL">
            {[
              singleTrip.carRental.company,
              singleTrip.carRental.carType,
              singleTrip.carRental.reservationNumber &&
                "Booking " + singleTrip.carRental.reservationNumber,
              singleTrip.carRental.paidAmount &&
                (singleTrip.carRental.currency || "€") +
                  singleTrip.carRental.paidAmount,
            ]
              .filter(Boolean)
              .join(" · ") || "Not added yet"}
          </DetailField>
        )}
        <DetailField label="CHECK-IN" isEmpty={!singleTrip.checkinDate}>
          <i className="far fa-calendar-alt"></i>
          {formatDate(singleTrip.checkinDate)}
          {singleTrip.checkinTime && ` · ${singleTrip.checkinTime}`}
        </DetailField>
        <DetailField label="CHECK-OUT" isEmpty={!singleTrip.checkoutDate}>
          <i className="far fa-calendar-alt"></i>
          {formatDate(singleTrip.checkoutDate)}
          {singleTrip.checkoutTime && ` · ${singleTrip.checkoutTime}`}
        </DetailField>
        <DetailField
          label="SIGHTSEEINGS"
          isEmpty={!singleTrip.sightseeings || singleTrip.sightseeings.length === 0}
        >
          {singleTrip.sightseeings && singleTrip.sightseeings.length
            ? singleTrip.sightseeings.map((item) => item.sightseeing).join(", ")
            : "Not added yet"}
        </DetailField>
        <DetailField
          label="EXPENSES"
          isEmpty={!singleTrip.expenses || singleTrip.expenses.length === 0}
        >
          {singleTrip.expenses && singleTrip.expenses.length
            ? sumFunction()
            : "Not added yet"}
        </DetailField>
        <DetailField label="NOTES" isEmpty={!notesSummary(singleTrip.notes)}>
          {notesSummary(singleTrip.notes) || "Not added yet"}
        </DetailField>
      </motion.div>
      <div className="tripDetailsFooter">
        <Link className="editLink" to={`/myTrips/${singleTrip.id}/edit`}>
          <button className="editTripButton">Edit</button>
        </Link>
        <button
          className="editTripCancelButton"
          onClick={() => history.push("/myTrips")}
        >
          Back
        </button>
      </div>
    </div>
  ) : (
    ""
  );
}
