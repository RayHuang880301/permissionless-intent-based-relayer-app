import { Flex, Spacer, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from "react";
import Metamask from "./Metamask";

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
      <Flex
        fontSize={"6xl"}
        className="flex flex-row justify-center items-center gap-4"
      >
        🐸
        <Flex className="flex flex-col">
          <Text pb={0} fontSize={"3xl"} fontWeight={"700"}>
            Frog Relayer
          </Text>
          <Text py={0} fontSize={"md"} fontWeight={"400"}>
            Permissionless Intent-based Relayer
          </Text>
        </Flex>
      </Flex>
      <Flex py={6}>
        <ConnectButton
          chainStatus="icon"
          accountStatus="address"
          showBalance={false}
        />
      </Flex>
      {/* <Metamask /> */}
    </Flex>
  );
}
