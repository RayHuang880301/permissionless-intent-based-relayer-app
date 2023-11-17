import {
  Flex,
  Text,
  Image,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import React from "react";
import ethIcon from "../assets/icon/ethereum-pos.png";
import usdcIcon from "../assets/icon/usd-coin-wormhole-from-ethereum.png";
import RelayerCard from "./RelayerCard";
import { useAccount, useBalance, useContractRead } from "wagmi";
import AGGREGATOR_V3_ABI from "../assets/abi/AggregatorV3.json";
import API3_ABI from "../assets/abi/API3.json";
import { formatUnits } from "viem";

const CHAINLINK_ETH_USD_PRICE_FEED =
  "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";

const API3_ETH_USD_PRICE_FEED = "0x26690F9f17FdC26D419371315bc17950a0FC90eD";

export default function SwapCard() {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
  });

  const {
    data: chainlinkPrice,
    isError: isChainlinkPriceError,
    isLoading: isChainlinkPriceLoading,
    refetch: refetchChainlinkPrice,
  } = useContractRead({
    address: CHAINLINK_ETH_USD_PRICE_FEED,
    abi: AGGREGATOR_V3_ABI,
    functionName: "latestAnswer",
  });

  const {
    data: api3Price,
    isError: isApi3PriceError,
    isLoading: isApi3PriceLoading,
    refetch: refetchApi3Price,
  } = useContractRead({
    address: API3_ETH_USD_PRICE_FEED,
    abi: API3_ABI,
    functionName: "read",
  });

  console.log("api3Price", api3Price);

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
        Balance: &nbsp;
        {data?.value ? Number(data.formatted).toFixed(4) : 0}
      </Text>
      <NumberInput borderRadius={"full"} w={"100%"} my={1} min={0}>
        <NumberInputField placeholder="Amount" px={6} fontSize={"lg"} />
      </NumberInput>
      <NumberInput borderRadius={"full"} w={"100%"} my={1} min={0}>
        <NumberInputField placeholder="Price" px={6} fontSize={"lg"} />
      </NumberInput>
      <Text fontSize="md" className="w-full text-left">
        {`API3 Price: ${
          api3Price
            ? Number(formatUnits(api3Price[0] as bigint, 18)).toFixed(4)
            : "No Supported"
        } ETH/USD
        `}
      </Text>
      <Text fontSize="md" className="w-full text-left">
        {`Chainlink Price: ${
          chainlinkPrice
            ? Number(formatUnits(chainlinkPrice as bigint, 8)).toFixed(4)
            : "No Supported"
        } ETH/USD`}
      </Text>
      {/* <RelayerCard calldata={calldata} erc20PermitAddr={erc20PermitAddr} /> */}
    </Flex>
  );
}
