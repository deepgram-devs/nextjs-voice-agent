import Image from "next/image.js";
import { ButtonLink } from "../buttonLink/ButtonLink";
import styles from "./Nav.module.css";

export const Nav = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <a href="/" className={styles.logo}>
          <Image
            src="assets/dg.svg"
            className={styles.logoImage}
            alt="Deepgram Logo"
            width="165"
            height="32"
          />
          <div className={styles.logoText}>Starter Apps</div>
        </a>

        <ButtonLink url="https://github.com/deepgram-starters" size="large">
          <span style={{ marginRight: "10px" }}>Get the code on Github</span>
        </ButtonLink>
      </div>
    </nav>
  );
};
