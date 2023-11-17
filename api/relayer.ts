import axios from "axios";

export interface RelayerTxPayload {
  chainId: number;
  toAddress: string;
  fee?: string;
  feeToken?: string;
  value?: string;
  calldata: string;
}

export async function sendTxToRelayer(url: string, payload: RelayerTxPayload) {
  try {
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err: any) {
    console.error(err);
    throw new Error(`Failed to send permit tx: ${err.message}`);
  }
}