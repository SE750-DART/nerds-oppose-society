import React from "react";
import { useHistory } from "react-router-dom";

const HomePage = () => {
  const history = useHistory();

  return (
    <>
      <p>Home</p>
      <button type="button" onClick={() => history.push("/123")}>
        game
      </button>
    </>
  );
};

export default HomePage;
