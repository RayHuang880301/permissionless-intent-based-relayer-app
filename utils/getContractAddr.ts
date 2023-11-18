import { ERC20PERMIT_ADDRESS } from "../config";

export const getERC20PermitAddr = (chainId: number): `0x${string}` => {
  if (chainId === 5) {
    return ERC20PERMIT_ADDRESS.GOERLI;
  } else if (chainId === 100) {
    return ERC20PERMIT_ADDRESS.GNOSIS;
  } else if (chainId === 421613) {
    return ERC20PERMIT_ADDRESS.ARBITRUM_GOERLI;
  } else if (chainId === 534351) {
    return ERC20PERMIT_ADDRESS.SCROLL_SEPOLIA;
  } else if (chainId === 59140) {
    return ERC20PERMIT_ADDRESS.LINEA_TESTNET;
  } else if (chainId === 1442) {
    return ERC20PERMIT_ADDRESS.POLYGON_ZKEVM_TESTNET;
  } else if (chainId === 5001) {
    return ERC20PERMIT_ADDRESS.MANTLE_TESTNET;
  } else if (chainId === 84531) {
    return ERC20PERMIT_ADDRESS.BASE_GOERLI;
  } else if (chainId === 280) {
    return ERC20PERMIT_ADDRESS.ZKSYNC_TESTNET;
  } else {
    throw new Error("Unsupported chainId");
  }
};

export const getChainInfo = (
  chainId: number
): {
  chainId: number;
  contractAddress: string;
  batchSize: number;
  startBlock: number;
} => {
  if (chainId === 5) {
    return {
      chainId: 5,
      contractAddress: ERC20PERMIT_ADDRESS.GOERLI,
      startBlock: 10060524,
      batchSize: 1000,
    };
  } else if (chainId === 100) {
    return {
      chainId: 100,
      contractAddress: ERC20PERMIT_ADDRESS.GNOSIS,
      startBlock: 31009945,
      batchSize: 3000,
    };
  } else if (chainId === 421613) {
    return {
      chainId: 421613,
      contractAddress: ERC20PERMIT_ADDRESS.ARBITRUM_GOERLI,
      startBlock: 55698126,
      batchSize: 10000,
    };
  } else if (chainId === 534351) {
    return {
      chainId: 534351,
      contractAddress: ERC20PERMIT_ADDRESS.SCROLL_SEPOLIA,
      startBlock: 2302676,
      batchSize: 1000,
    };
  } else if (chainId === 59140) {
    return {
      chainId: 59140,
      contractAddress: ERC20PERMIT_ADDRESS.LINEA_TESTNET,
      startBlock: 2049654,
      batchSize: 1000,
    };
  } else if (chainId === 1442) {
    return {
      chainId: 1442,
      contractAddress: ERC20PERMIT_ADDRESS.POLYGON_ZKEVM_TESTNET,
      startBlock: 3220752,
      batchSize: 1000,
    };
  } else if (chainId === 5001) {
    return {
      chainId: 5001,
      contractAddress: ERC20PERMIT_ADDRESS.MANTLE_TESTNET,
      startBlock: 26016750,
      batchSize: 1000,
    };
  } else if (chainId === 84531) {
    return {
      chainId: 84531,
      contractAddress: ERC20PERMIT_ADDRESS.BASE_GOERLI,
      startBlock: 12561733,
      batchSize: 1000,
    };
  } else if (chainId === 280) {
    return {
      chainId: 280,
      contractAddress: ERC20PERMIT_ADDRESS.ZKSYNC_TESTNET,
      startBlock: 13680823,
      batchSize: 1000,
    };
  } else {
    throw new Error("Unsupported chainId");
  }
};
