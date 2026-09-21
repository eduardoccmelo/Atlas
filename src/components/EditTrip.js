import { useHistory, useParams } from "react-router";
import {
  getSingleTripFromLocalStorage,
  editSingleTripFromLocalStorage,
} from "../services/myTripsStorage";
import { useState, useEffect } from "react";
import Form from "./Form";
import "./styles/Form.css";

const emptyCarRental = {
  enabled: false,
  company: "",
  carType: "",
  reservationNumber: "",
  address: "",
  pickupDate: "",
  dropoffDate: "",
  pickupTime: "",
  dropoffTime: "",
  transmission: "",
  fuelType: "",
  differentDropoffAddress: false,
  dropoffAddress: "",
};

export default function EditTrip() {
  const history = useHistory();
  const { id } = useParams();
  const [inputDestinationName, setInputDestinationName] = useState("");
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [inputTripStart, setInputTripStart] = useState("");
  const [inputTripEnd, setInputTripEnd] = useState("");
  const [inputTransportType, setInputTransportType] = useState("");
  const [inputTripDeparture, setInputTripDeparture] = useState("");
  const [inputTripArrival, setInputTripArrival] = useState("");
  const [inputTripAccommodation, setInputTripAccommodation] = useState("");
  const [inputCheckinDate, setInputCheckinDate] = useState("");
  const [inputCheckinTime, setInputCheckinTime] = useState("");
  const [inputCheckoutDate, setInputCheckoutDate] = useState("");
  const [inputCheckoutTime, setInputCheckoutTime] = useState("");
  const [inputSightseeing, setInputSightseeing] = useState("");
  const [allSightseeings, setAllSightseeings] = useState([]);
  const [currency, setCurrency] = useState("€");
  const [inputExpenseName, setInputExpenseName] = useState("");
  const [inputExpenseValue, setInputExpenseValue] = useState("");
  const [allExpenses, setAllExpenses] = useState([]);
  const [inputNotes, setInputNotes] = useState("");
  const [notes, setNotes] = useState([]);
  const [transportLegs, setTransportLegs] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [carRental, setCarRental] = useState(emptyCarRental);

  function handleOnSubmit(e) {
    e.preventDefault();

    const mainLeg = transportLegs[0] || {};
    const firstStay = accommodations[0] || {};

    editSingleTripFromLocalStorage(id, {
      name: inputDestinationName,
      destinationCoordinates,
      start: inputTripStart,
      end: inputTripEnd,
      transportation: mainLeg.type || inputTransportType,
      departure: mainLeg.departureTime || inputTripDeparture,
      arrival: mainLeg.arrivalTime || inputTripArrival,
      accommodation: firstStay.name || inputTripAccommodation,
      checkinDate: firstStay.checkinDate || inputCheckinDate,
      checkinTime: firstStay.checkinTime || inputCheckinTime,
      checkoutDate: firstStay.checkoutDate || inputCheckoutDate,
      checkoutTime: firstStay.checkoutTime || inputCheckoutTime,
      transportLegs,
      accommodations,
      carRental,
      sightseeings: allSightseeings,
      expenses: allExpenses,
      notes,
    });
    history.push("/myTrips");
  }

  useEffect(() => {
    const myTrip = getSingleTripFromLocalStorage(id);
    setInputDestinationName(String(myTrip.name || "").split(" — ")[0]);
    setDestinationCoordinates(myTrip.destinationCoordinates || null);
    setInputTripStart(myTrip.start);
    setInputTripEnd(myTrip.end);
    setInputTransportType(myTrip.transportation);
    setInputTripDeparture(myTrip.departure);
    setInputTripArrival(myTrip.arrival);
    setInputTripAccommodation(myTrip.accommodation);
    setInputCheckinDate(myTrip.checkinDate);
    setInputCheckinTime(myTrip.checkinTime);
    setInputCheckoutDate(myTrip.checkoutDate);
    setInputCheckoutTime(myTrip.checkoutTime);
    setAllSightseeings(myTrip.sightseeings);
    setAllExpenses(myTrip.expenses);
    setInputNotes(myTrip.notes);
    setNotes(
      Array.isArray(myTrip.notes)
        ? myTrip.notes
        : myTrip.notes
          ? [{ id: "note-1", message: myTrip.notes }]
          : [],
    );
    setTransportLegs(
      myTrip.transportLegs && myTrip.transportLegs.length
        ? myTrip.transportLegs
        : myTrip.transportation && myTrip.transportation !== "none"
          ? [
            {
              id: "main-leg",
              type: myTrip.transportation || "plane",
              company: "",
              bookingReference: "",
              departureLocation: "",
              departureAddress: "",
              arrivalLocation: "",
              arrivalAddress: "",
              departureTime: myTrip.departure || "",
              arrivalTime: myTrip.arrival || "",
              seat: "",
              vehicleNumber: "",
              hasConnection: false,
            },
            ]
          : [],
    );
    setAccommodations(
      myTrip.accommodations && myTrip.accommodations.length
        ? myTrip.accommodations
        : myTrip.accommodation
          ? [
              {
                id: "stay-1",
                name: myTrip.accommodation,
                provider: "",
                reservationNumber: "",
                type: "",
                address: "",
                checkinDate: myTrip.checkinDate || "",
                checkinTime: myTrip.checkinTime || "",
                checkoutDate: myTrip.checkoutDate || "",
                checkoutTime: myTrip.checkoutTime || "",
              },
            ]
          : [],
    );
    setCarRental(myTrip.carRental || emptyCarRental);
  }, [id]);

  function handleSightseeingOnClick(e, coordinates = null) {
    e.preventDefault();
    if (inputSightseeing !== "") {
      setAllSightseeings([
        ...allSightseeings,
        { sightseeing: inputSightseeing, coordinates },
      ]);
    }
    setInputSightseeing("");
  }

  function handleExpenseOnClick(e) {
    e.preventDefault();
    if (inputExpenseName !== "") {
      setAllExpenses([
        ...allExpenses,
        {
          name: inputExpenseName,
          value: Number(inputExpenseValue),
          currency: currency,
        },
      ]);
    }
    setInputExpenseName("");
    setInputExpenseValue(0);
  }

  return (
    <div className="EditTrip">
      <div className="editTripHeader">
        <h2>EDIT TRIP</h2>
      </div>
      <Form
        handleOnSubmit={handleOnSubmit}
        handleSightseeingOnClick={handleSightseeingOnClick}
        handleExpenseOnClick={handleExpenseOnClick}
        inputDestinationName={inputDestinationName}
        setInputDestinationName={setInputDestinationName}
        setDestinationCoordinates={setDestinationCoordinates}
        inputTripStart={inputTripStart}
        setInputTripStart={setInputTripStart}
        inputTripEnd={inputTripEnd}
        setInputTripEnd={setInputTripEnd}
        inputTransportType={inputTransportType}
        setInputTransportType={setInputTransportType}
        inputTripDeparture={inputTripDeparture}
        setInputTripDeparture={setInputTripDeparture}
        inputTripArrival={inputTripArrival}
        setInputTripArrival={setInputTripArrival}
        inputTripAccommodation={inputTripAccommodation}
        setInputTripAccommodation={setInputTripAccommodation}
        inputCheckinDate={inputCheckinDate}
        setInputCheckinDate={setInputCheckinDate}
        inputCheckinTime={inputCheckinTime}
        setInputCheckinTime={setInputCheckinTime}
        inputCheckoutDate={inputCheckoutDate}
        setInputCheckoutDate={setInputCheckoutDate}
        inputCheckoutTime={inputCheckoutTime}
        setInputCheckoutTime={setInputCheckoutTime}
        inputSightseeing={inputSightseeing}
        setInputSightseeing={setInputSightseeing}
        allSightseeings={allSightseeings}
        setAllSightseeings={setAllSightseeings}
        allExpenses={allExpenses}
        setAllExpenses={setAllExpenses}
        inputExpenseName={inputExpenseName}
        setInputExpenseName={setInputExpenseName}
        inputExpenseValue={inputExpenseValue}
        setInputExpenseValue={setInputExpenseValue}
        currency={currency}
        setCurrency={setCurrency}
        inputNotes={inputNotes}
        setInputNotes={setInputNotes}
        notes={notes}
        setNotes={setNotes}
        transportLegs={transportLegs}
        setTransportLegs={setTransportLegs}
        accommodations={accommodations}
        setAccommodations={setAccommodations}
        carRental={carRental}
        setCarRental={setCarRental}
      />
    </div>
  );
}
