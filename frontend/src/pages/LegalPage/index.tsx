import React from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import styles from "./style.module.css";

const LegalPage = () => {
  const browserHistory = useHistory();

  return (
    <div className={styles.container}>
      <h1>Legal</h1>
      <p className={styles.text}>
        Nerds Oppose Society is a remix of{" "}
        <a
          href="https://cardsagainsthumanity.com/"
          rel="noreferrer"
          target="_blank"
        >
          Cards Against Humanity®
        </a>{" "}
        , and is distributed under a{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          rel="noreferrer"
          target="_blank"
        >
          Creative Commons BY-NC-SA 4.0 license
        </a>
        .
      </p>
      <p className={styles.text}>
        Accordingly, Nerds Oppose Society only makes use of the original writing
        of Cards Against Humanity®. No other aspects of their intellectual
        property, such as their name, logos, slogan, or design, have been used,
        except here to give credit as required.
      </p>
      <p className={styles.text}>
        Nerds Oppose Society is in no way endorsed or sponsored by Cards Against
        Humanity®, and you should buy the physical game from them.
      </p>
      <p className={styles.text}>
        Nerds Oppose Society is an independent, not-for-profit university
        project that solicits no proceeds or donations. All of our work is
        freely available{" "}
        <a
          href="https://github.com/SE750-DART/nerds-oppose-society"
          rel="noreferrer"
          target="_blank"
        >
          on our GitHub.
        </a>
      </p>
      <p className={styles.text}>Please don&apos;t sue us :)</p>
      <div className={styles.btnContainer}>
        <Button
          text="Good for you bro"
          handleOnClick={() => browserHistory.push("/")}
        />
      </div>
    </div>
  );
};

export default LegalPage;
