import { Flex, Tab, TabList, Tabs } from "@chakra-ui/react";
import React from "react";
import RelayerCard from "./RelayerCard";
import PermitCard from "./PermitCard";
import SwapCard from "./SwapCard";

export default function Container() {
  const [mode, setMode] = React.useState(0);
  return (
    <Flex className="flex flex-col w-full h-full justify-start items-center py-10">
      <Tabs
        variant="soft-rounded"
        borderRadius="full"
        className="p-1"
        onChange={(index) => setMode(index)}
        bgColor="blue.400"
      >
        <TabList>
          <Tab
            _hover={{ bg: "blue.500" }}
            _selected={{ bg: "white", textColor: "blue.500" }}
            textColor="white"
            className="w-36"
          >
            Permit
          </Tab>
          <Tab
            _hover={{ bg: "blue.400" }}
            _selected={{ bg: "white", textColor: "blue.500" }}
            textColor="white"
            className="w-36"
          >
            Swap
          </Tab>
        </TabList>
      </Tabs>
      {mode === 0 ? <PermitCard /> : <SwapCard />}
    </Flex>
  );
}
