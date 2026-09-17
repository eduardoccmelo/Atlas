export function getMarkersFromLocalStorage() {
  try {
    const storedMarkers = JSON.parse(localStorage.getItem("markerData"));
    return Array.isArray(storedMarkers) ? storedMarkers : [];
  } catch {
    return [];
  }
}

export function saveMarkersToLocalStorage(markers) {
  localStorage.setItem("markerData", JSON.stringify(markers));
}
