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
  } else {
    throw new Error("Unsupported chainId");
  }
};
