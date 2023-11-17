import { ERC20PERMIT_ADDRESS } from "../config";

export const getERC20PermitAddr = (chainId: number): `0x${string}` => {
  if (chainId === 5) {
    return ERC20PERMIT_ADDRESS.GOERLI;
  } else {
    throw new Error("Unsupported chainId");
  }
};
