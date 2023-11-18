import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Checkbox,
  Flex,
  Text,
  ModalFooter,
  Icon,
  useToast,
} from "@chakra-ui/react";
import mockRelayers from "../mockData/relayers.json";
import { shortenAddress } from "../utils/helper";
import { ChevronDownIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNetwork } from "wagmi";
import dayjs from "dayjs";
import { RelayerInfo } from "../type";
import { RelayerTxPayload, sendTxToRelayer } from "../api/relayer";
import { subgraph } from "../lib/subgraph";
import { RelayerProvider, RelayerContext } from "./RelayerProvider";
import {
  RelayerPermitCountProvider,
  RelayerPermitCountContext,
} from "./RelayerPermitCountProvider";
import { getChainInfo } from "../utils/getContractAddr";

const API_URL = "http://194.195.123.201:8888/send-tx";

type Props = {
  toAddress: `0x${string}` | undefined;
  calldata: `0x${string}` | undefined;
};

export default function RelayerCard(props: Props) {
  const { calldata, toAddress } = props;
  const toast = useToast();
  const [relayers, setRelayers] = useState<Array<RelayerInfo>>([]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chain } = useNetwork();
  const [req, setReq] = useState<RelayerTxPayload>({
    chainId: chain?.id || 1,
    toAddress: toAddress!,
    fee: "0",
    feeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    value: "0",
    calldata: calldata!,
  });

  useEffect(() => {
    getRelayers();
  }, []);

  const fetchRelayerMetadata = async (url: string) => {
    try {
    } catch (err) {}
  };

  const getRelayers = useCallback(async () => {
    console.log("getRelayers");
    try {
      const { data } = await subgraph.fetchRelayers();
      console.log({
        data,
      });
      const currentRelayers = relayers;
      for (let index = 0; index < data.newRelayers.length; index++) {
        const item = data.newRelayers[index];
        const metadataUri = item.relayerMetadataUri;
        if (metadataUri) {
          try {
            const { data: metadataData } = await axios.get(metadataUri);
            if (metadataData.relayers instanceof Array) {
              for (
                let index = 0;
                index < metadataData.relayers.length;
                index++
              ) {
                // const currentRelayInfo = currentRelayers.find((relayer) => );
                const relayer = metadataData.relayers[index];
                const info: RelayerInfo = {
                  metadataId: item.id,
                  name: relayer.name,
                  address: item.relayer.toLowerCase(),
                  relayerMetadataUri: metadataUri,
                  healthCheckUrl: relayer.healthCheckUrl,
                  sendTxUrl: relayer.sendTxUrl,
                  totalRelayed: "0",
                  lastRelayed: "0",
                  status: "loading",
                };
                const key = `${info.metadataId}-${info.name}-${info.address}}`;
                setRelayers((prev) => {
                  const isExist = prev.some(
                    (relayer) =>
                      key ===
                      `${relayer.metadataId}-${
                        relayer.name
                      }-${relayer.address.toLowerCase()}}`
                  );
                  if (!isExist) {
                    return [...prev, info];
                  }
                  return prev;
                });
              }
            }
          } catch (err) {
            console.warn(
              `Error fetching metadata for relayer ${item.id}, metadataUri: ${metadataUri}`
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (chain) {
      setReq({
        ...req,
        toAddress: toAddress!,
        chainId: chain.id,
        calldata: calldata!,
      });
    }
  }, [toAddress, chain, calldata]);

  console.log("req", req);

  const sortedByTotalTx = () => {
    const sorted = relayers.sort((a, b) => {
      return Number(b.totalRelayed) - Number(a.totalRelayed);
    });
    setRelayers(sorted);
    console.log("sortedByTotalTx", relayers);
  };

  const sortedByLastTx = () => {
    const sorted = relayers.sort((a, b) => {
      return Number(b.lastRelayed) - Number(a.lastRelayed);
    });
    setRelayers(sorted);
    console.log("sortedByLastTx", relayers);
  };

  const toggleSelectAll = () => {
    const newCheckedItems = [...checkedItems];
    if (checkedItems.every(Boolean)) {
      newCheckedItems.fill(false);
    } else {
      newCheckedItems.fill(true);
    }
    setCheckedItems(newCheckedItems);
  };
  const send = async (req: RelayerTxPayload) => {
    if (!calldata || !toAddress) return;
    try {
      const res = await doSendTxToRelayer(req);
    } catch (err) {
      console.log(err);
    }
  };

  const doSendTxToRelayer = async (payload: RelayerTxPayload) => {
    try {
      console.log({
        checkedItems,
      });
      const selectedRelayers = relayers.filter(
        (relayer, index) => checkedItems[index]
      );

      toast({
        title: "Sending request to relayer",
        description: "Please wait",
        status: "info",
        position: "top",
        duration: 10000,
        isClosable: true,
      });
      const promiseList = selectedRelayers.map(async (relayer) => {
        return await sendTxToRelayer(relayer.sendTxUrl, payload);
      });
      const resultList = await Promise.all(promiseList);
      console.log({
        resultList,
      });
      toast({
        title: "Success",
        description: "Relayer request sent",
        status: "success",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error: sendTxToRelayer",
        description: error.message,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button
        className="w-80 py-6"
        borderRadius="full"
        textColor={"white"}
        bgColor={calldata ? "blue.400" : "gray.400"}
        _hover={
          calldata
            ? {
                bgColor: "blue.500",
              }
            : {
                bgColor: "gray.400",
                cursor: "not-allowed",
              }
        }
        _active={
          calldata
            ? {
                bgColor: "blue.400",
              }
            : {
                bgColor: "gray.400",
              }
        }
        transitionDuration={"0.2s"}
        onClick={calldata ? onOpen : () => {}}
      >
        select relayer
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select relayers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex className="flex flex-col w-full gap-2">
              <div className="grid grid-cols-12 gap-4 w-full text-right font-bold text-xl">
                <Text className="col-span-3 text-left">Relayer Name</Text>
                <Text className="col-span-2 text-left">Relayer Address</Text>
                <Text
                  className="col-span-2"
                  _hover={{
                    cursor: "pointer",
                    bgColor: "gray.100",
                  }}
                  _active={{
                    bgColor: "gray.200",
                  }}
                  transition={"0.2s"}
                  onClick={() => sortedByTotalTx()}
                >
                  Total Tx <ChevronDownIcon boxSize={8} />
                </Text>
                <Text
                  className="col-span-3"
                  _hover={{
                    cursor: "pointer",
                    bgColor: "gray.100",
                  }}
                  _active={{
                    bgColor: "gray.200",
                  }}
                  transition={"0.2s"}
                  onClick={() => sortedByLastTx()}
                >
                  Last Tx <ChevronDownIcon boxSize={8} />
                </Text>
                <Text className="col-span-2">Status</Text>
              </div>
              <RelayerPermitCountProvider
                chainConfig={getChainInfo(chain?.id || 5)}
              >
                <RelayerPermitCountContext.Consumer>
                  {({ countMap }) => (
                    <>
                      {relayers.map((relayer, index) => (
                        <RelayerProvider
                          key={index}
                          relayer={relayer}
                          relayerInfo={countMap[relayer.address]}
                        >
                          <RelayerContext.Consumer>
                            {({ status, lastTxTime, totalTx }) => (
                              <div className="grid grid-cols-12 gap-4 w-full text-right font-base text-lg">
                                <Checkbox
                                  className="col-span-3"
                                  isChecked={checkedItems[index]}
                                  onChange={(e) => {
                                    const newCheckedItems = [...checkedItems];
                                    newCheckedItems[index] = e.target.checked;
                                    setCheckedItems(newCheckedItems);
                                  }}
                                >
                                  {relayer.name}
                                </Checkbox>
                                <Text className="col-span-2">
                                  {shortenAddress(relayer.address)}
                                </Text>
                                <Text className="col-span-2">{totalTx}</Text>
                                <Text className="col-span-3">{lastTxTime}</Text>
                                <Text className="col-span-2">
                                  <Icon
                                    viewBox="0 0 200 200"
                                    color={
                                      status === "online"
                                        ? "green.500"
                                        : "red.500"
                                    }
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                                    />
                                  </Icon>
                                  {status}
                                </Text>
                              </div>
                            )}
                          </RelayerContext.Consumer>
                        </RelayerProvider>
                      ))}
                    </>
                  )}
                </RelayerPermitCountContext.Consumer>
              </RelayerPermitCountProvider>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-80 py-6 mx-auto"
              borderRadius="full"
              textColor={"white"}
              bgColor={calldata ? "blue.400" : "gray.400"}
              _hover={
                calldata
                  ? {
                      bgColor: "blue.500",
                    }
                  : {
                      bgColor: "gray.400",
                      cursor: "not-allowed",
                    }
              }
              _active={
                calldata
                  ? {
                      bgColor: "blue.400",
                    }
                  : {
                      bgColor: "gray.400",
                    }
              }
              transitionDuration={"0.2s"}
              onClick={calldata ? () => send(req) : () => {}}
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
