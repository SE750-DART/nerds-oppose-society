import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";

const SubmitPunchlinePage = () => {
  const memoryHistory = useHistory();

  const dummyPunchlines: {
    id: string;
    text: string;
    status: "available" | "selected" | "submitted";
    new?: boolean;
  }[] = [
    {
      id: "1",
      text: "Me time.",
      status: "available",
      new: true,
    },
    {
      id: "2",
      text:
        "Looking in the mirror, applying lipstick, and whispering “tonight, you will have sex with Tom Cruise.”",
      status: "available",
    },
    {
      id: "3",
      text: "The violation of our most basic human rights.",
      status: "available",
    },
    {
      id: "4",
      text:
        "Getting married, having a few kids, buying some stuff, retiring to Florida, and dying..",
      status: "available",
    },
    {
      id: "5",
      text: "Dark and mysterious forces beyond our control.",
      status: "available",
    },
    {
      id: "6",
      text: "Not vaccinating my children because I am stupid.",
      status: "available",
    },
    {
      id: "7",
      text: "Rap music.",
      status: "available",
    },
    {
      id: "8",
      text: "Listening to her problems without trying to solve them.",
      status: "available",
    },
    {
      id: "9",
      text: "Preteens.",
      status: "available",
    },
    {
      id: "10",
      text: "Alcoholism.",
      status: "available",
    },
  ];

  const [punchlineSelected, setPunchlineSelected] = useState("");
  const [punchlineSubmitted, setPunchlineSubmitted] = useState("");
  const [punchlines] = useState(dummyPunchlines);

  const selectPunchline = (text: string) => {
    if (punchlineSubmitted) {
      return;
    }
    if (text === punchlineSelected) {
      setPunchlineSelected("");
    } else {
      setPunchlineSelected(text);
    }
  };

  return (
    <>
      <Dropdown
        aboveDrop={<h4 style={{ textAlign: `center` }}>Round X of X</h4>}
        belowDrop={<PlayerList gameState="midround" />}
        header="Scoreboard"
      />
      <div className={styles.container}>
        <div className={styles.spacer}>
          <h5>The Setup:</h5>
          <h2>Daddy, why is mommy crying?</h2>
        </div>
        <div className={styles.spacer}>
          <ProgressBar playersChosen={0} playersTotal={0} />
        </div>

        <h5 style={{ marginBottom: `18px` }}>
          {punchlineSubmitted ? `Punchline sent!` : `Choose a Punchline:`}
        </h5>
        {punchlines.map((punchline) => {
          let punchlineStatus: "available" | "selected" | "submitted";
          if (punchline.text === punchlineSubmitted) {
            punchlineStatus = "submitted";
          } else if (punchline.text === punchlineSelected) {
            punchlineStatus = "selected";
          } else {
            punchlineStatus = "available";
          }

          return (
            <PunchlineCard
              key={punchline.id}
              text={punchline.text}
              handleOnClick={() => selectPunchline(punchline.text)}
              status={punchlineStatus}
              newCard={punchline.new}
            />
          );
        })}
      </div>
      {punchlineSelected && (
        <div className={styles.bottomBtns}>
          <div className={styles.btnNah}>
            <Button
              text="Nah"
              handleOnClick={() => setPunchlineSelected("")}
              variant="secondary"
            />
          </div>
          <div className={styles.btnSend}>
            <Button
              text="Send it"
              handleOnClick={() => {
                setPunchlineSubmitted(punchlineSelected);
                setPunchlineSelected("");
                memoryHistory.push("/postRound");
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitPunchlinePage;
