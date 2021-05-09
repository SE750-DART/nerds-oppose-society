import React from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "../../components/Button";
import styles from "./style.module.css";

const AboutPage = () => {
  const browserHistory = useHistory();

  return (
    <div className={styles.container}>
      <h1>About</h1>
      <p className={styles.text}>
        Nerds Oppose Society is a fun online game that just happens to also be a
        clone of{" "}
        <a
          href="https://cardsagainsthumanity.com/"
          rel="noreferrer"
          target="_blank"
        >
          Cards Against Humanity®
        </a>
        .
      </p>
      <p className={styles.text}>
        Nerds Opposite Society was built over two weeks by the following
        over-worked University of Auckland students for a Software Engineering
        course project (SOFTENG 750):
      </p>
      <ul>
        <li>Di Kun Ong (design, frontend)</li>
        <li>Alexander Verkerk (backend, CI/CD)</li>
        <li>Rawiri Hohepa (frontend)</li>
        <li>Tait Fuller (backend)</li>
      </ul>
      <p className={styles.text}>
        Under the Cards Against Humanity license, we aren&apos;t allowed to use
        this project for self-promotion, so please look us up on your own accord
        if you&apos;re interested in any other work we&apos;ve done (or
        employing us, heh).
      </p>
      <p className={styles.text}>
        For the legal details as to how this is allowed (we&apos;re pretty sure
        it is), check out the boring <Link to="/legal">Legal</Link> section.
      </p>
      <div className={styles.btnContainer}>
        <Button
          text="I don't care"
          handleOnClick={() => browserHistory.push("/")}
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default AboutPage;
