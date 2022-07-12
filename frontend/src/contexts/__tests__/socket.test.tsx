import React, { PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react-hooks";
import { Socket } from "socket.io-client";
import { SocketProvider, useSocket } from "../socket";

const SocketWrapper = ({ children }: PropsWithChildren<unknown>) => (
  <SocketProvider socket={true as unknown as Socket}>{children}</SocketProvider>
);

describe("useSocket()", () => {
  it("returns rounds context when used inside SocketProvider", () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketWrapper,
    });

    const socket = result.current;
    expect(socket).toBe(true);
  });

  it("throws error when used outside SocketProvider", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.error).toEqual(
      Error("useSocket() must be used within a SocketProvider")
    );
  });
});
