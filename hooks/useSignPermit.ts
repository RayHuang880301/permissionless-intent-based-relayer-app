import { useSignTypedData } from "wagmi";

export const useSignPermit = (
  chainId: number,
  contractAddr: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  nonce: number,
  deadline: bigint
) => {
  const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
    useSignTypedData({
      domain: getDomain(chainId, contractAddr),
      message: getMessage(owner, spender, value, nonce, deadline),
      primaryType: "Permit",
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
    name: "ERC20PermitMock",
    version: "1",
    chainId,
    verifyingContract,
  };
};

const getMessage = (
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  nonce: number,
  deadline: bigint
) => {
  return {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };
};

const types = {
  Permit: [
    {
      name: "owner",
      type: "address",
    },
    {
      name: "spender",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
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
