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

  return (
    <div>
      <div className="tripCardContent">
        <div className="tripCardInfo">
          <span className="tripName">{name}</span>
        </div>
      </div>
      <hr className="cardDivider"></hr>
      <div className="tripDates">
        <div className="tripStart">
          <span className="tripDateDay">{startDay}</span>
          <span className="tripDateMonth" data-month-number={monthNumber(startMonth)}>{startMonth}</span>
          <span className="tripDateYear">{startYear}</span>
        </div>
        <div className="tripEnd">
          <span className="tripDateDay">{endDay}</span>
          <span className="tripDateMonth" data-month-number={monthNumber(endMonth)}>{endMonth}</span>
          <span className="tripDateYear">{endYear}</span>
        </div>
      </div>
    </div>
  );
}
