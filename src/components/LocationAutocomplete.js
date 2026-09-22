import { useEffect, useState } from "react";

function labelFor(feature) {
  const name = feature.properties?.name || feature.text || feature.name || "";
  const address = feature.properties?.full_address || feature.properties?.place_formatted || "";
  const featureType = feature.properties?.feature_type;
  if ((featureType === "address" || featureType === "street") && address) {
    return address;
  }
  if (name && address && name !== address) {
    return `${name} — ${address}`;
  }
  return (
    name ||
    address ||
    feature.place_name ||
    feature.text ||
    feature.name ||
    ""
  );
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  mode = "address",
  queryPrefix = "",
  types,
  proximity,
  id,
  required = false,
  selectionMode = "label",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const proximityQuery = Array.isArray(proximity) && proximity.length === 2
    ? `&proximity=${proximity.join(",")}`
    : "";

  useEffect(() => {
    const query = value.trim();
    const token = process.env.REACT_APP_MAPBOX_KEY;
    if (query.length < 3 || !token || !isOpen) {
      setSuggestions([]);
      return undefined;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      const searchText = queryPrefix + query;
      const endpoint =
        mode === "address"
          ? "https://api.mapbox.com/search/geocode/v6/forward?q=" +
            encodeURIComponent(searchText) +
            "&types=address,street,place,locality&limit=6&access_token=" +
            token +
            proximityQuery
          : "https://api.mapbox.com/search/searchbox/v1/forward?q=" +
            encodeURIComponent(searchText) +
            "&limit=6" +
            (types ? "&types=" + encodeURIComponent(types) : "") +
            proximityQuery +
            "&access_token=" +
            token;

      fetch(endpoint)
        .then((response) => (response.ok ? response.json() : { features: [] }))
        .then((data) => {
          if (cancelled) return;
          const normalizedQuery = query.toLocaleLowerCase();
          setSuggestions(
            (data.features || [])
              .filter((feature) => Array.isArray(feature.geometry?.coordinates))
              .map((feature) => ({
                label: labelFor(feature),
                name: feature.properties?.name || feature.text || feature.name || "",
                coordinates: feature.geometry.coordinates,
                isPoi: feature.properties?.feature_type === "poi",
              }))
              .filter((feature) => feature.label)
              .sort((first, second) => {
                const firstNameMatch = first.label.toLocaleLowerCase().startsWith(normalizedQuery);
                const secondNameMatch = second.label.toLocaleLowerCase().startsWith(normalizedQuery);
                if (firstNameMatch !== secondNameMatch) return firstNameMatch ? -1 : 1;
                if (first.isPoi !== second.isPoi) return first.isPoi ? -1 : 1;
                return 0;
              }),
          );
        })
        .catch(() => !cancelled && setSuggestions([]));
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isOpen, mode, proximityQuery, queryPrefix, types, value]);

  return (
    <div className="locationAutocomplete">
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        required={required}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onChange={(event) => onChange(event.target.value)}
      />
      {isOpen && suggestions.length > 0 && (
        <div className="locationSuggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.label + suggestion.coordinates.join("-")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const selectedLabel =
                  selectionMode === "name"
                    ? suggestion.name || suggestion.label
                    : suggestion.label;
                onChange(selectedLabel);
                onSelect(
                  suggestion.coordinates,
                  selectedLabel,
                  suggestion.name || suggestion.label,
                );
                setIsOpen(false);
              }}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
