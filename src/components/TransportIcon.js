export default function TransportIcon({
  startDay,
  startMonth,
  startYear,
  endDay,
  endMonth,
  endYear,
  name,
}) {
  const monthNumber = (month) => {
    const months = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    return months[month?.slice(0, 3).toLowerCase()] || month;
  };
  const titleLines = (() => {
    // Older trips may still contain the autocomplete context ("City — Region").
    const title = String(name || "").split(" — ")[0].trim();
    if (title.length <= 10) return [title];

    const spaceBeforeLimit = title.lastIndexOf(" ", 10);
    const spaceAfterLimit = title.indexOf(" ", 10);
    const breakPoint =
      spaceBeforeLimit > 0
        ? spaceBeforeLimit
        : spaceAfterLimit > 0
          ? spaceAfterLimit
          : 10;

    return [title.slice(0, breakPoint), title.slice(breakPoint).trim()];
  })();

  return (
    <div>
      <div className="tripCardContent">
        <div className="tripCardInfo">
          <span className="tripName">
            {titleLines.map((line, index) => (
              <span className="tripNameLine" key={index}>
                {line}
              </span>
            ))}
          </span>
        </div>
      </div>
      <hr className="cardDivider"></hr>
      <div className="tripDates">
        <span className="tripDateStart">{startDay}</span>
        <i className="fas fa-arrow-right" aria-hidden="true"></i>
        <span className="tripDateEnd">
          {endDay}.{monthNumber(endMonth)}.{endYear}
        </span>
      </div>
    </div>
  );
}
