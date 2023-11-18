import {
  MetaMaskButton,
  MetaMaskUIProvider,
  useSDK,
} from "@metamask/sdk-react-ui";
import NonSSRWrapper from "./NoSSR";

export default function Metamask() {
  const {
    sdk,
    connected,
    connecting,
    provider,
    chainId,
    account,
    balance,
    status,
    readOnlyCalls,
  } = useSDK();

  return (
    <NonSSRWrapper>
      {/* <p>connected = {connected}</p>
      <p>connecting = {connecting}</p>
      <p>chainId = {chainId}</p>
      <p>account = {account}</p> */}
      {/* <p>balance = {balance}</p> */}
      {/* <p>status = {status ? status.connectionStatus : ""}</p>
      <p>readOnlyCalls = {readOnlyCalls}</p> */}

      <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>
    </NonSSRWrapper>
  );
}
