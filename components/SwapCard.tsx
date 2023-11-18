import {
  Flex,
  Text,
  Image,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ethIcon from "../assets/icon/ethereum-pos.png";
import usdcIcon from "../assets/icon/usd-coin-wormhole-from-ethereum.png";
import RelayerCard from "./RelayerCard";
import { useAccount, useBalance, useContractRead, useNetwork } from "wagmi";
import AGGREGATOR_V3_ABI from "../assets/abi/AggregatorV3.json";
import API3_ABI from "../assets/abi/API3.json";
import CHRONICLE_ABI from "../assets/abi/ChronicleOracle.json";
import {
  createPublicClient,
  encodeFunctionData,
  formatUnits,
  hexToSignature,
  http,
  maxUint256,
  parseUnits,
} from "viem";
import { goerli } from "viem/chains";
import { useSignPermit } from "../hooks/useSignPermit";
import { useSignSwap } from "../hooks/useSignSwap";
import { DEFAULT_NATIVE_TOKEN } from "../config";
import ERC20PERMIT_ABI from "../assets/abi/ERC20Permit.json";
import MOCKSWAP_ABI from "../assets/abi/MockSwap.json";

const MOCK_CONTRACT_ADDR = "0x6Fe56FaE34a83507958Ef024A5490B01EFbFc80D";
const MOCK_USDC_ADDR = "0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4";
const MOCK_ZERO_FOR_ONE = true;

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

const MOCK_VALUE = parseUnits("1", 18);
const deadline = maxUint256;
const MINT_VALUE = parseUnits("10", 18);
const MOCK_NONCE = 0;

export default function SwapCard() {
  const toast = useToast();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [chainlinkPrice, setChainlinkPrice] = useState<bigint>();
  const [api3Price, setApi3Price] = useState<bigint>();
  const [chroniclePrice, setChroniclePrice] = useState<bigint>();
  const [amount, setAmount] = useState<bigint>();
  const [price, setPrice] = useState<bigint>();
  const [calldata, setCalldata] = useState<`0x${string}`>();
  const {
    data: balance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useBalance({
    address: address,
  });

  const {
    data: signatureHex,
    isError,
    isLoading,
    isSuccess,
    signTypedDataAsync,
  } = useSignSwap(
    chain?.id || 1,
    MOCK_CONTRACT_ADDR,
    DEFAULT_NATIVE_TOKEN,
    MOCK_USDC_ADDR,
    MOCK_ZERO_FOR_ONE,
    amount!,
    MOCK_NONCE,
    deadline
  );

  const handleSignSwap = async () => {
    if (address && chain && amount && price) {
      try {
        await signTypedDataAsync();
      } catch (error) {
        console.log(error);
      }
    } else if (!address || !chain) {
      toast({
        title: "Please connect your wallet",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else if (!amount || !price) {
      toast({
        title: "Please input amount and price",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (signatureHex) {
      const { r, s, v } = hexToSignature(signatureHex);
      const calldata = encodeFunctionData({
        abi: MOCKSWAP_ABI,
        functionName: "swapPermit",
        args: [
          DEFAULT_NATIVE_TOKEN,
          MOCK_USDC_ADDR,
          MOCK_ZERO_FOR_ONE,
          amount,
          MOCK_NONCE,
          deadline,
          v,
          r,
          s,
        ],
      });
      setCalldata(calldata);
    } else {
      console.log("Please sign first");
    }
  }, [signatureHex]);

  const getChainlinkPrice = async () => {
    const chainlinkPrice = await goerliClient.readContract({
      address: CHAINLINK_ETH_USD_PRICE_FEED,
      abi: AGGREGATOR_V3_ABI,
      functionName: "latestAnswer",
    });
    setChainlinkPrice(chainlinkPrice as bigint);
  };

  const getApi3Price = async () => {
    const api3Price = (await goerliClient.readContract({
      address: API3_ETH_USD_PRICE_FEED,
      abi: API3_ABI,
      functionName: "read",
    })) as any;
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
        <NumberInputField
          placeholder="Amount"
          px={6}
          fontSize={"lg"}
          onChange={(e) => setAmount(parseUnits(e.target.value, 18))}
        />
      </NumberInput>
      <NumberInput borderRadius={"full"} w={"100%"} my={1} min={0}>
        <NumberInputField
          placeholder="Price"
          px={6}
          fontSize={"lg"}
          onChange={(e) => setPrice(BigInt(e.target.value))}
        />
      </NumberInput>
      <Button
        disabled={isLoading}
        className="w-80 py-6"
        borderRadius="full"
        textColor={"white"}
        bgColor="blue.400"
        _hover={{
          bgColor: "blue.500",
        }}
        _active={{
          bgColor: "blue.400",
        }}
        transitionDuration={"0.2s"}
        onClick={() => handleSignSwap()}
      >
        Sign
      </Button>
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
      <Text fontSize="xl" className="w-full text-left mb-8">
        {`Chronicle Price: ${
          chroniclePrice
            ? Number(formatUnits(chroniclePrice, 18)).toFixed(4)
            : "No Supported"
        } ETH/USD`}
      </Text>
      <RelayerCard calldata={calldata} toAddress={MOCK_CONTRACT_ADDR} />
    </Flex>
  );
}
