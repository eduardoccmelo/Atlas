import { Link } from "react-router-dom";
import TransportIcon from "./TransportIcon";

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
  function classTripDate() {
    const today = new Date();
    if (today.valueOf() - 100000000 < new Date(endDate).valueOf()) {
      return "myTripsItem";
    } else {
      return "pastTripItem";
    }
  }

  return (
    <div key={id} className={classTripDate()}>
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
      <Link to={`/myTrips/${id}`}>
        <button className="tripViewButton">View</button>
        <div className="barcode">
          <i className="fas fa-barcode"></i>
          <i className="fas fa-barcode"></i>
          <i className="fas fa-barcode"></i>
          <i className="fas fa-barcode"></i>
        </div>
      </Link>
    </div>
  );
}
