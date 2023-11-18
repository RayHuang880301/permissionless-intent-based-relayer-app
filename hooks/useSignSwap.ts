import { useSignTypedData } from "wagmi";

export const useSignSwap = (
  chainId: number,
  contractAddr: `0x${string}`,
  token0: `0x${string}`,
  token1: `0x${string}`,
  zeroForOne: boolean,
  amountSpecified: bigint,
  nonce: number,
  deadline: bigint
) => {
  const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
    useSignTypedData({
      domain: getDomain(chainId, contractAddr),
      message: getMessage(
        token0,
        token1,
        zeroForOne,
        amountSpecified,
        nonce,
        deadline
      ),
      primaryType: "Swap",
      types,
    });

  return {
    data,
    isError,
    isLoading,
    isSuccess,
    signTypedDataAsync,
  };
};

const getDomain = (chainId: number, verifyingContract: `0x${string}`) => {
  return {
    name: "Swap",
    version: "1",
    chainId,
    verifyingContract,
  };
};

const getMessage = (
  token0: `0x${string}`,
  token1: `0x${string}`,
  zeroForOne: boolean,
  amountSpecified: bigint,
  nonce: number,
  deadline: bigint
) => {
  return {
    token0,
    token1,
    zeroForOne,
    amountSpecified,
    nonce,
    deadline,
  };
};

const types = {
  Swap: [
    {
      name: "token0",
      type: "address",
    },
    {
      name: "token1",
      type: "address",
    },
    {
      name: "zeroForOne",
      type: "bool",
    },
    {
      name: "amountSpecified",
      type: "int256",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
  ],
};
