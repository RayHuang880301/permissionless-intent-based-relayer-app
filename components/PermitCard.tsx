import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useContractRead, useNetwork } from "wagmi";
import { useSignPermit } from "../hooks/useSignPermit";
import {
  encodeFunctionData,
  formatUnits,
  hexToSignature,
  maxUint256,
  parseUnits,
  recoverAddress,
} from "viem";
import ERC20PERMIT_ABI from "../assets/abi/ERC20Permit.json";
import { getERC20PermitAddr } from "../utils/getContractAddr";
import RelayerCard from "./RelayerCard";
import axios from "axios";
import { RelayerTxPayload, sendTxToRelayer } from "../api/relayer";

const MOCK_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";
const MOCK_SPENDER = "0x6Fe56FaE34a83507958Ef024A5490B01EFbFc80D";
const MOCK_VALUE = parseUnits("1", 18); // maxUint256;
const MOCK_NONCE = 0;
const deadline = maxUint256;

export default function PermitCard() {
  const toast = useToast();
  const [erc20PermitAddr, setErc20PermitAddr] = useState<`0x${string}`>();
  const [calldata, setCalldata] = useState<`0x${string}`>();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
  });
  const {
    data: nonce,
    isError: isNonceError,
    isLoading: isNonceLoading,
    refetch: refetchNonce,
  } = useContractRead({
    address: erc20PermitAddr,
    abi: ERC20PERMIT_ABI,
    functionName: "nonces",
    args: [address],
  });

  const {
    data: signatureHex,
    isError,
    isLoading,
    isSuccess,
    signTypedDataAsync,
  } = useSignPermit(
    chain?.id || 1,
    erc20PermitAddr!,
    address!,
    MOCK_SPENDER,
    MOCK_VALUE,
    Number(nonce),
    deadline
  );

  useEffect(() => {
    setInterval(() => {
      refetchBalance();
    }, 5000);
  }, []);

  useEffect(() => {
    if (signatureHex) {
      const { r, s, v } = hexToSignature(signatureHex);
      const calldata = encodeFunctionData({
        abi: ERC20PERMIT_ABI,
        functionName: "permit",
        args: [address, MOCK_SPENDER, MOCK_VALUE, deadline, v, r, s],
      });
      setCalldata(calldata);
      console.log("calldata", calldata);
    } else {
      console.log("Please sign first");
    }
  }, [signatureHex]);

  useEffect(() => {
    if (chain) {
      setErc20PermitAddr(getERC20PermitAddr(chain.id) || undefined);
    }
  }, [chain]);

  /** Step 1 */
  const handleSignPermit = async () => {
    if (erc20PermitAddr && chain && address && nonce !== undefined) {
      try {
        await signTypedDataAsync();
      } catch (error) {
        console.log(error);
      }
    } else {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  /** Step 2 */
  useEffect(() => {
    if (signatureHex) {
      const { r, s, v } = hexToSignature(signatureHex);
      const calldata = encodeFunctionData({
        abi: ERC20PERMIT_ABI,
        functionName: "permit",
        args: [address, MOCK_SPENDER, MOCK_VALUE, deadline, v, r, s],
      });
      setCalldata(calldata);
    } else {
      console.log("Please sign first");
    }
  }, [signatureHex]);

  return (
    <Flex className="flex flex-col justify-between items-center h-full">
      <Flex className="flex flex-col justify-center items-center h-full">
        <Text className="flex flex-row text-5xl my-8">Sign to permit</Text>
        <Text fontSize="md" className="w-full text-right">
          {`Balance:
        ${balance ? Number(balance.formatted).toFixed(4) : "0"}
        ETH`}
        </Text>
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
          onClick={() => handleSignPermit()}
        >
          Sign
        </Button>
      </Flex>
      <RelayerCard calldata={calldata} toAddress={erc20PermitAddr} />
    </Flex>
  );
}
