import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { SocketProvider, useSocket } from "../socket";
import { Socket } from "socket.io-client";

const SocketWrapper = ({ children }: PropsWithChildren<unknown>) => (
  <SocketProvider socket={true as unknown as Socket}>{children}</SocketProvider>
);

describe("useSocket()", () => {
  const Component = () => {
    const socket = useSocket();
    expect(socket).toBe(true);
    return <></>;
  };

  it("returns rounds context when used inside SocketProvider", () => {
    render(<Component />, { wrapper: SocketWrapper });
  });

  it("throws error when used outside SocketProvider", () => {
    /*
    Note: This throws an error in the test console:
    Uncaught [Error: useSocket() must be used within a SocketProvider]
    There does not appear to be a way to disable this however the test is caught
    in the code below - nothing to see here!
     */
    expect(() => render(<Component />)).toThrow(
      "useSocket() must be used within a SocketProvider"
    );
  });
});
