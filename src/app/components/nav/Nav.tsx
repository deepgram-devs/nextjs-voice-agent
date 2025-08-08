import Image from "next/image.js";
import { ButtonLink } from "../buttonLink/ButtonLink";
import Styles from "./Nav.module.css";

export const Nav = () => {
  return (
    <nav className={Styles.nav}>
      <div className={Styles["nav-margin"]}>
        <div className={Styles["nav-brand"]}>
          <Image
            src="assets/dg.svg"
            className={Styles["nav-logo"]}
            alt="Deepgram Logo"
            width="165"
            height="32"
          />
          <div>Starter Apps</div>
        </div>

        <ButtonLink url="https://github.com/deepgram-starters" size="large">
          <span style={{ marginRight: "10px" }}>Get the code on Github</span>
        </ButtonLink>
      </div>
    </nav>
  );
};
