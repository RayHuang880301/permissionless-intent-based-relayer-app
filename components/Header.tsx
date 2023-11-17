import { Flex, Spacer } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from "react";

export default function Header() {
  // const [account, setAccount] = useState<string>();
  // const { sdk, connected, connecting, provider, chainId } = useSDK();

  // const connect = async () => {
  //   try {
  //     const accounts = await sdk?.connect();
  //     setAccount(accounts?.[0]);
  //   } catch (err) {
  //     console.warn(`failed to connect..`, err);
  //   }
  // };
  return (
    <Flex className="flex flex-row w-[90%] m-auto py-4 justify-between">
      <Spacer />
      <ConnectButton
        chainStatus="icon"
        accountStatus="address"
        showBalance={false}
      />
      {/* <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>
          <>
            {chainId && `Connected chain: ${chainId}`}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )} */}
    </Flex>
  );
}
