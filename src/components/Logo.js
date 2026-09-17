import { Link } from "react-router-dom";

export default function Logo2() {
  return (
    <Link className="appLogoLink" to="/" aria-label="Go to home page">
      <img className="logo2" alt="Atlas Travel Organizer" src="/images/logo2.png" />
    </Link>
  );
}

export function Logo() {
  return <img className="logo" alt="logo" src="/images/logo.png"></img>;
}
