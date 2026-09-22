import "./styles/MyTrips.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTripsFromLocalStorage } from "../services/myTripsStorage";
import { AnimatePresence, motion } from "framer-motion";
import TripCard from "./TripCard";
import { useTranslation } from "../i18n";

export default function MyTrips() {
  const { t, language } = useTranslation();
  const [trips, setTrips] = useState([]);

  const Item = ({ children }) => (
    <motion.div {...motionProps}>{children}</motion.div>
  );

  const motionProps = {
    exit: { opacity: 0, scale: 0, x: -800 },
    transition: {
      duration: 0.5,
    },
  };

  useEffect(() => {
    const myTrips = getTripsFromLocalStorage();
    setTrips(myTrips);
  }, []);

  function handleRemoveTrip(name) {
    const confirmation = window.confirm(
      language === "pt" ? "Você realmente deseja excluir esta viagem?" : "Do you really want to delete your Trip?",
    );
    if (confirmation === true) {
      removeTripFromLocalStorage(name);
      const myTrips = getTripsFromLocalStorage();
      setTrips(myTrips);
    }
  }

  function removeTripFromLocalStorage(tripName) {
    const myTrips = getTripsFromLocalStorage();
    const newTrips = myTrips.filter((trip) => {
      return trip.name !== tripName;
    });
    localStorage.setItem("tripData", JSON.stringify(newTrips));
  }

  function renderMyTrips() {
    return trips.map((trip, index) => {
      const startDay = trip.start.slice(8, 10);
      const startMonth = trip.start.slice(5, 7);
      const startYear = trip.start.slice(2, 4);
      const endDay = trip.end.slice(8, 10);
      const endMonth = trip.end.slice(5, 7);
      const endYear = trip.end.slice(2, 4);

      return (
        <Item key={`${trip.id || "trip"}-${index}`}>
          <TripCard
            handleRemoveTrip={handleRemoveTrip}
            name={trip.name}
            destinationCoordinates={trip.destinationCoordinates}
            id={trip.id}
            endDate={trip.end}
            transportation={trip.transportation}
            startDay={startDay}
            startMonth={startMonth}
            startYear={startYear}
            endDay={endDay}
            endMonth={endMonth}
            endYear={endYear}
          />
        </Item>
      );
    });
  }
  return (
    <div className="MyTrips">
      <div className="myTripsHeader">
        <h2>{t("MY TRIPS")}</h2>
      </div>
      <div className="myTripsMain">
        <Link to="/newTrip" className="myTripsHeaderButton">
          <i className="fas fa-plus"></i>
          <span>{t("ADD A TRIP")}</span>
        </Link>
        {trips.length < 1 && (
          <p className="noTripsText">{t("You don't have any trips yet")}</p>
        )}
        <AnimatePresence>{renderMyTrips()}</AnimatePresence>
      </div>

      <div className="myTripsFooter">
        <Link to="/" className="myTripsButtonHome">
          <i className="fas fa-home"></i>
        </Link>
        <Link to="/worldMap" className="myTripsButtonWorldMap">
          <i className="fas fa-globe-africa"></i> {t("Travel Map")}
        </Link>
      </div>
    </div>
  );
}
