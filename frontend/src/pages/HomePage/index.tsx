import React from "react";
import { useHistory } from "react-router-dom";

const HomePage = () => {
  const browserHistory = useHistory();

  return (
    <>
      <p>Home</p>
      <button type="button" onClick={() => browserHistory.push("/123")}>
        game
      </button>
    </>
  );
};

export default HomePage;
