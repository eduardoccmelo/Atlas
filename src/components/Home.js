import "./styles/Home.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { useTranslation } from "../i18n";

export default function Home() {
  const { t } = useTranslation();
  const container = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
  };
  return (
    <div className="Home">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="homePageContent"
      >
        <div className="homeIntro">
          <Logo />
          <h1>{t("Every journey, beautifully remembered.")}</h1>
          <p>{t("Plan the details, keep the memories, and see your world unfold.")}</p>
        </div>
        <Link className="homeLink1" to="/myTrips">
          <div className="homePageLinksTitles">
            <span className="myTravelsHome"></span>{t("MY TRIPS")}
          </div>
        </Link>
        <Link className="homeLink2" to="/worldMap">
          <div className="homePageLinksTitles">
            <span className="earth"></span>{t("MY TRAVEL MAP")}
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
