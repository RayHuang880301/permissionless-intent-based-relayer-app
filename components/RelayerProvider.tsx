import { createContext, use, useEffect, useState } from "react";
import { RelayerInfo } from "../type";
import axios from "axios";
import { RelayerCountInfo } from "../lib/relayer-permit-sync";
import { usePublicClient } from "wagmi";
import dayjs from "dayjs";

export const RelayerContext = createContext<{
  status: string;
  lastTxTime: string;
  totalTx: number;
}>({
  status: "offline",
  lastTxTime: "",
  totalTx: 0,
});


export const RelayerProvider = ({ 
  relayer,
  relayerInfo,
  children
}: { 
    relayer: RelayerInfo,
    relayerInfo: RelayerCountInfo | undefined,
    children: React.ReactNode
}) => {
  const [status, setStatus] = useState(relayer.status);
  const [lastTxTime, setLastTxTime] = useState<string>('');
  const [totalTx, setTotalTx] = useState(0);
  const publicClient = usePublicClient();

  useEffect(() => {
    console.log('RelayerProvider health check', relayer);
    axios.get(relayer.healthCheckUrl).then((res) => {
        setStatus('online');
      })
      .catch((err) => {
        setStatus('offline');
      });
  }, [
    relayer
  ]);

  useEffect(() => {
    if (relayerInfo) {
      setTotalTx(relayerInfo.count);
      publicClient.getBlock({
        blockNumber: BigInt(relayerInfo.lastBlockNumber),
      }).then((block) => {
        console.log({
          '(block.timestamp': block.timestamp
        })
        setLastTxTime(dayjs
          .unix(Number(block.timestamp))
          .format("YYYY-MM-DD HH:mm:ss"));
      })
    } else {
      setLastTxTime('');
      setTotalTx(0);
    }
  }, [relayerInfo]);

  return (
    <RelayerContext.Provider value={{ status, lastTxTime, totalTx }}>
      {children}
    </RelayerContext.Provider>
  );


}