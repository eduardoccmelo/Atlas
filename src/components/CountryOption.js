export default function CountryOption({
  name,
  markerName,
  latlng,
  flag,
  handleClick,
  getCheckboxState,
}) {
  return (
    <div className="countryName">
      <input
        onChange={(e) => handleClick(e, latlng, markerName || name)}
        className="checkbox"
        type="checkbox"
        value={name}
        checked={getCheckboxState(markerName || name)}
      ></input>

      <span>
        <img className="countryFlag" alt={flag} src={flag}></img>
        {name}
      </span>
    </div>
  );
}
