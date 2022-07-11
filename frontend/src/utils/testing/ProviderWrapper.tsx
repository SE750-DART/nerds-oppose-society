import React, { ComponentType, PropsWithChildren } from "react";

interface ProviderWrapper {
  Provider: ComponentType<PropsWithChildren<unknown>>;
}

const Wrapper = ({
  children,
  Provider,
}: PropsWithChildren<ProviderWrapper>) => {
  return <Provider>{children}</Provider>;
};

export default Wrapper;
