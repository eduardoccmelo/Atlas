const demoTrips = [
  {
    id: "lisbon-2026-10-12",
    name: "Lisbon",
    start: "2026-10-12",
    end: "2026-10-18",
    transportation: "plane",
    departure: "09:15",
    arrival: "11:10",
    accommodation: "Alfama Boutique Hotel",
    checkinDate: "2026-10-12",
    checkinTime: "15:00",
    checkoutDate: "2026-10-18",
    checkoutTime: "11:00",
    transportLegs: [
      {
        id: "lisbon-flight-outbound",
        type: "plane",
        company: "TAP Air Portugal",
        bookingReference: "ATLAS26",
        vehicleNumber: "TP 541",
        departureLocation: "FRA — Frankfurt Airport",
        arrivalLocation: "LIS — Humberto Delgado Airport",
        departureAddress: "Terminal 1",
        arrivalAddress: "Terminal 1",
        departureDate: "2026-10-12",
        departureTime: "09:15",
        arrivalTime: "11:10",
        seat: "12A, 12B",
        hasConnection: false,
      },
    ],
    accommodations: [
      {
        id: "lisbon-stay",
        name: "Alfama Boutique Hotel",
        provider: "Booking.com",
        reservationNumber: "LIS-98271",
        type: "Hotel",
        address: "Rua dos Remédios 120, Lisbon",
        addressCoordinates: [-9.1293, 38.7136],
        checkinDate: "2026-10-12",
        checkinTime: "15:00",
        checkoutDate: "2026-10-18",
        checkoutTime: "11:00",
      },
    ],
    carRental: {
      enabled: true,
      company: "Sixt",
      carType: "Compact SUV",
      reservationNumber: "SIXT-LIS-26",
      address: "Lisbon Airport, Terminal 1",
      pickupDate: "2026-10-14",
      dropoffDate: "2026-10-17",
      pickupTime: "09:00",
      dropoffTime: "17:30",
      transmission: "automatic",
      fuelType: "electric",
      differentDropoffAddress: false,
      dropoffAddress: "",
    },
    sightseeings: [
      { sightseeing: "Belém Tower", coordinates: [-9.2159, 38.6916] },
      { sightseeing: "São Jorge Castle", coordinates: [-9.1335, 38.7139] },
      { sightseeing: "Tram 28", coordinates: [-9.1374, 38.7142] },
    ],
    expenses: [
      { name: "Hotel", value: 720, currency: "€" },
      { name: "Flight", value: 340, currency: "€" },
      { name: "Food budget", value: 250, currency: "€" },
    ],
    notes: [
      {
        id: "lisbon-note",
        message: "Book a sunset table in Alfama and take comfortable shoes for the hills.",
      },
    ],
  },
  {
    id: "prague-2026-11-06",
    name: "Prague",
    start: "2026-11-06",
    end: "2026-11-09",
    transportation: "train",
    departure: "08:28",
    arrival: "12:45",
    accommodation: "Mala Strana Residence",
    checkinDate: "2026-11-06",
    checkinTime: "14:00",
    checkoutDate: "2026-11-09",
    checkoutTime: "10:30",
    transportLegs: [
      {
        id: "prague-train",
        type: "train",
        company: "Deutsche Bahn",
        bookingReference: "ICE 742 / PRG8K2",
        vehicleNumber: "ICE 742",
        departureLocation: "Berlin",
        departureLocationCoordinates: [13.405, 52.52],
        arrivalLocation: "Prague",
        arrivalLocationCoordinates: [14.4378, 50.0755],
        departureDate: "2026-11-06",
        arrivalDate: "2026-11-06",
        departureTime: "08:28",
        arrivalTime: "12:45",
        seat: "Car 21 · Seats 61, 62",
        hasConnection: false,
      },
    ],
    accommodations: [
      {
        id: "prague-stay",
        name: "Mala Strana Residence",
        provider: "Airbnb",
        reservationNumber: "HM8K3P",
        type: "Apartment",
        address: "Malostranské náměstí 5, Prague",
        addressCoordinates: [14.4043, 50.087],
        checkinDate: "2026-11-06",
        checkinTime: "14:00",
        checkoutDate: "2026-11-09",
        checkoutTime: "10:30",
      },
    ],
    carRental: { enabled: false },
    sightseeings: [
      { sightseeing: "Charles Bridge", coordinates: [14.4114, 50.0865] },
      { sightseeing: "Old Town Square", coordinates: [14.4208, 50.087] },
    ],
    expenses: [
      { name: "Train tickets", value: 118, currency: "€" },
      { name: "Apartment", value: 360, currency: "€" },
    ],
    notes: [
      { id: "prague-note", message: "Reserve the Astronomical Clock tower time slot." },
    ],
  },
  {
    id: "rio-2027-02-14",
    name: "Rio de Janeiro",
    start: "2027-02-14",
    end: "2027-02-21",
    transportation: "bus",
    departure: "07:30",
    arrival: "13:45",
    accommodation: "Ipanema Guest House",
    checkinDate: "2027-02-14",
    checkinTime: "15:00",
    checkoutDate: "2027-02-21",
    checkoutTime: "11:00",
    transportLegs: [
      {
        id: "rio-bus",
        type: "bus",
        company: "Cometa",
        bookingReference: "RIO-4029",
        departureLocation: "São Paulo",
        departureLocationCoordinates: [-46.6333, -23.5505],
        arrivalLocation: "Rio de Janeiro",
        arrivalLocationCoordinates: [-43.1729, -22.9068],
        departureDate: "2027-02-14",
        arrivalDate: "2027-02-14",
        departureTime: "07:30",
        arrivalTime: "13:45",
        seat: "18, 19",
        hasConnection: false,
      },
    ],
    accommodations: [
      {
        id: "rio-stay",
        name: "Ipanema Guest House",
        provider: "Booking.com",
        reservationNumber: "RIO-77015",
        type: "Guest house",
        address: "Rua Visconde de Pirajá 340, Rio de Janeiro",
        addressCoordinates: [-43.2013, -22.9846],
        checkinDate: "2027-02-14",
        checkinTime: "15:00",
        checkoutDate: "2027-02-21",
        checkoutTime: "11:00",
      },
    ],
    carRental: { enabled: false },
    sightseeings: [
      { sightseeing: "Christ the Redeemer", coordinates: [-43.2105, -22.9519] },
      { sightseeing: "Sugarloaf Mountain", coordinates: [-43.1566, -22.9486] },
      { sightseeing: "Ipanema Beach", coordinates: [-43.2096, -22.9848] },
    ],
    expenses: [
      { name: "Bus tickets", value: 260, currency: "R$" },
      { name: "Accommodation", value: 2100, currency: "R$" },
    ],
    notes: [
      { id: "rio-note", message: "Check the weather before booking the Sugarloaf cable car." },
    ],
  },
];

const demoMarkers = [
  { name: "Portugal", latlng: [39.3999, -8.2245] },
  { name: "Germany", latlng: [51.1657, 10.4515] },
  { name: "Czechia", latlng: [49.8175, 15.473] },
  { name: "Brazil", latlng: [-14.235, -51.9253] },
  { name: "Japan", latlng: [36.2048, 138.2529] },
  { name: "Canada", latlng: [56.1304, -106.3468] },
];

function hasCoordinates(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(Number.isFinite)
  );
}

function enrichExistingDemoTrips(trips) {
  let changed = false;
  const enrichedTrips = trips.map((trip) => {
    const demoTrip = demoTrips.find((item) => item.id === trip.id);
    if (!demoTrip) return trip;

    const accommodations = (trip.accommodations || []).map((stay) => {
      const demoStay = (demoTrip.accommodations || []).find(
        (item) => item.id === stay.id,
      );
      if (!demoStay || hasCoordinates(stay.addressCoordinates)) return stay;
      changed = true;
      return { ...stay, addressCoordinates: demoStay.addressCoordinates };
    });
    const sightseeings = (trip.sightseeings || []).map((item) => {
      const demoSightseeing = (demoTrip.sightseeings || []).find(
        (demoItem) => demoItem.sightseeing === item.sightseeing,
      );
      if (!demoSightseeing || hasCoordinates(item.coordinates)) return item;
      changed = true;
      return { ...item, coordinates: demoSightseeing.coordinates };
    });

    return changed ? { ...trip, accommodations, sightseeings } : trip;
  });

  return changed ? enrichedTrips : trips;
}

export function initializeDemoData() {
  if (typeof window === "undefined") return;

  if (localStorage.getItem("tripData") === null) {
    localStorage.setItem("tripData", JSON.stringify(demoTrips));
  } else {
    try {
      const existingTrips = JSON.parse(localStorage.getItem("tripData"));
      if (Array.isArray(existingTrips)) {
        const enrichedTrips = enrichExistingDemoTrips(existingTrips);
        if (enrichedTrips !== existingTrips) {
          localStorage.setItem("tripData", JSON.stringify(enrichedTrips));
        }
      }
    } catch {
      // Keep user data untouched when it cannot be parsed.
    }
  }

  try {
    const storedMarkers = JSON.parse(localStorage.getItem("markerData") || "[]");
    const currentMarkers = Array.isArray(storedMarkers) ? storedMarkers : [];
    const mergedMarkers = [...currentMarkers];
    demoMarkers.forEach((marker) => {
      if (!mergedMarkers.some((item) => item?.name === marker.name)) mergedMarkers.push(marker);
    });
    if (mergedMarkers.length !== currentMarkers.length || localStorage.getItem("markerData") === null) {
      localStorage.setItem("markerData", JSON.stringify(mergedMarkers));
    }
  } catch {
    localStorage.setItem("markerData", JSON.stringify(demoMarkers));
  }
}
