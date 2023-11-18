import {
  Flex,
  Text,
  Image,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ethIcon from "../assets/icon/ethereum-pos.png";
import usdcIcon from "../assets/icon/usd-coin-wormhole-from-ethereum.png";
import RelayerCard from "./RelayerCard";
import { useAccount, useBalance, useContractRead } from "wagmi";
import AGGREGATOR_V3_ABI from "../assets/abi/AggregatorV3.json";
import API3_ABI from "../assets/abi/API3.json";
import CHRONICLE_ABI from "../assets/abi/ChronicleOracle.json";
import { createPublicClient, formatUnits, http } from "viem";
import { goerli } from "viem/chains";

const CHAINLINK_ETH_USD_PRICE_FEED =
  "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";

const API3_ETH_USD_PRICE_FEED = "0x26690F9f17FdC26D419371315bc17950a0FC90eD";

const CHRONICLE_ETH_USD_PRICE_FEED =
  "0x90430C5b8045a1E2A0Fc4e959542a0c75b576439";

const goerliTransport = http(
  "https://eth-goerli.g.alchemy.com/v2/jeFJuYIBL2oK6D2faoJ5y3HT8uJtyUkt"
);

const sepoliaTransport = http(
  "https://eth-sepolia.g.alchemy.com/v2/SFDKOfaYqT5PC4z-XkemespE2XbBUmaW"
);

const goerliClient = createPublicClient({
  chain: goerli,
  transport: goerliTransport,
});

const sepoliaClient = createPublicClient({
  chain: goerli,
  transport: sepoliaTransport,
});

export default function SwapCard() {
  const { address } = useAccount();
  const [chainlinkPrice, setChainlinkPrice] = useState<bigint>();
  const [api3Price, setApi3Price] = useState<bigint>();
  const [chroniclePrice, setChroniclePrice] = useState<bigint>();
  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: address,
  });

  const getChainlinkPrice = async () => {
    const chainlinkPrice = await goerliClient.readContract({
      address: CHAINLINK_ETH_USD_PRICE_FEED,
      abi: AGGREGATOR_V3_ABI,
      functionName: "latestAnswer",
    });
    setChainlinkPrice(chainlinkPrice as bigint);
  };

  const getApi3Price = async () => {
    const api3Price = await goerliClient.readContract({
      address: API3_ETH_USD_PRICE_FEED,
      abi: API3_ABI,
      functionName: "read",
    });
    setApi3Price(api3Price[0] as bigint);
  };

  const getChroniclePrice = async () => {
    const chroniclePrice = await sepoliaClient.readContract({
      address: CHRONICLE_ETH_USD_PRICE_FEED,
      abi: CHRONICLE_ABI,
      functionName: "latestAnswer",
    });
    setChroniclePrice(chroniclePrice as bigint);
  };

  useEffect(() => {
    getChainlinkPrice();
    getApi3Price();
    getChroniclePrice();
    setInterval(() => {
      getChainlinkPrice();
      getApi3Price();
      getChroniclePrice();
    }, 5000);
  }, []);

  return (
    <Flex className="flex flex-col justify-center items-center">
      <Text className="flex flex-row text-5xl mt-8">My intention</Text>
      <Text className="flex flex-row text-3xl my-8">
        I want to Swap{" "}
        <Image
          className="rounded-full mx-2"
          boxSize="30px"
          src={ethIcon.src}
          alt=""
        />{" "}
        ETH to{" "}
        <Image
          className="rounded-full mx-2"
          boxSize="30px"
          src={usdcIcon.src}
          alt=""
        />{" "}
        USDC
      </Text>
      <Text fontSize="md" className="w-full text-right">
        {`Balance:
        ${balance ? Number(balance.formatted).toFixed(4) : "0"}
        ETH`}
      </Text>
      <NumberInput borderRadius={"full"} w={"100%"} my={1} min={0}>
        <NumberInputField placeholder="Amount" px={6} fontSize={"lg"} />
      </NumberInput>
      <NumberInput borderRadius={"full"} w={"100%"} my={1} min={0}>
        <NumberInputField placeholder="Price" px={6} fontSize={"lg"} />
      </NumberInput>
      <Text fontSize="xl" className="w-full text-left">
        {`API3 Price: ${
          api3Price
            ? Number(formatUnits(api3Price, 18)).toFixed(4)
            : "No Supported"
        } ETH/USD
        `}
      </Text>
      <Text fontSize="xl" className="w-full text-left">
        {`Chainlink Price: ${
          chainlinkPrice
            ? Number(formatUnits(chainlinkPrice, 8)).toFixed(4)
            : "No Supported"
        } ETH/USD`}
      </Text>
      <Text fontSize="xl" className="w-full text-left">
        {`Chronicle Price: ${
          chroniclePrice
            ? Number(formatUnits(chroniclePrice, 18)).toFixed(4)
            : "No Supported"
        } ETH/USD`}
      </Text>
      {/* <RelayerCard calldata={calldata} erc20PermitAddr={erc20PermitAddr} /> */}
    </Flex>
  );
}
