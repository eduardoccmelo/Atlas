export default function TransportIcon({
  transportation,
  startDay,
  startMonth,
  startYear,
  endDay,
  endMonth,
  endYear,
  name,
}) {
  return (
    <div>
      <div className="tripCardInfo">
        {transportation === "car" && (
          <span>
            <i className="fas fa-car"></i>
          </span>
        )}
        {transportation === "bus" && (
          <span>
            <i className="fas fa-bus"></i>
          </span>
        )}
        {transportation === "train" && (
          <span>
            <i className="fas fa-train"></i>
          </span>
        )}
        {transportation === "plane" && (
          <span>
            <i className="fas fa-plane"></i>
          </span>
        )}
        {transportation === "other" && (
          <span>
            <i className="fas fa-suitcase"></i>
          </span>
        )}
        {transportation === "none" && (
          <span>
            <i className="fas fa-suitcase"></i>
          </span>
        )}
        {transportation === "" && (
          <span>
            <i className="fas fa-suitcase"></i>
          </span>
        )}
        <span className="tripName">{name}</span>
      </div>
      <hr className="cardDivider"></hr>
      <div className="tripDates">
        <div className="tripStart">
          {startDay}
          <span>{startMonth}</span>
          {startYear}
        </div>
        <div className="tripEnd">
          {endDay}
          <span>{endMonth}</span>
          {endYear}
        </div>
      </div>
    </div>
  );
}
