import { createContext, use, useEffect, useState } from "react";
import { RelayerInfo } from "../type";
import axios from "axios";

export const RelayerContext = createContext<{
  status: string;
}>({
  status: "offline",
});


export const RelayerProvider = ({ 
  relayer,
  children
}: { 
    relayer: RelayerInfo,
    children: React.ReactNode
}) => {
  const [status, setStatus] = useState(relayer.status);

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

  return (
    <RelayerContext.Provider value={{ status }}>
      {children}
    </RelayerContext.Provider>
  );


}