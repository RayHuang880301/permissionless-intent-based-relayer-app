import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import mockRelayers from "../mockData/relayers.json";
import { shortenAddress } from "../utils/helper";
import { ChevronDownIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNetwork } from "wagmi";
import dayjs from "dayjs";
import { RelayerInfo } from "../type";

const END_POINT = "https://intent-relayer.vercel.app/send-tx";

type Props = {
  toAddress: `0x${string}` | undefined;
  calldata: `0x${string}` | undefined;
};

type SendTxRequest = {
  chainId: number;
  toAddress: string;
  fee: string;
  feeToken: string;
  value: string;
  calldata: string;
};

export default function RelayerCard(props: Props) {
  const { calldata, toAddress } = props;
  const [relayers, setRelayers] = useState(mockRelayers);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chain } = useNetwork();
  const [req, setReq] = useState<SendTxRequest>({
    chainId: chain?.id || 1,
    toAddress: toAddress!,
    fee: "0",
    feeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    value: "0",
    calldata: calldata!,
  });

  useEffect(() => {
    if (chain) {
      setReq({
        ...req,
        chainId: chain.id,
      });
    }
  }, [chain]);

  const send = async (req: SendTxRequest) => {
    if (!calldata || !toAddress) return;
    try {
      const res = await axios.post(END_POINT, {
        req,
      });
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sortedByTotalTx = () => {
    const sorted = mockRelayers.sort((a, b) => {
      return Number(b.totalRelayed) - Number(a.totalRelayed);
    });
    setRelayers(sorted);
    console.log(relayers);
  };

  const sortedByLastTx = () => {
    const sorted = mockRelayers.sort((a, b) => {
      return Number(b.lastRelayed) - Number(a.lastRelayed);
    });
    setRelayers(sorted);
    console.log(relayers);
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
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select relayers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex className="flex flex-col w-full gap-2">
              <div className="grid grid-cols-12 gap-4 w-full text-right font-bold text-xl">
                <Text className="col-span-3 text-left">Relayer Address</Text>
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
                  onClick={() => sortedByTotalTx()}
                >
                  Total Tx <ChevronDownIcon boxSize={8} />
                </Text>
                <Text
                  className="col-span-4"
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
              {relayers.map((relayer, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 w-full text-right font-base text-lg"
                >
                  <Checkbox
                    className="col-span-3"
                    isChecked={checkedItems[index]}
                    onChange={(e) => {
                      const newCheckedItems = [...checkedItems];
                      newCheckedItems[index] = e.target.checked;
                      setCheckedItems(newCheckedItems);
                    }}
                  >
                    {shortenAddress(relayer.address)}
                  </Checkbox>
                  <Text className="col-span-3">{relayer.totalRelayed}</Text>
                  <Text className="col-span-4">
                    {dayjs
                      .unix(Number(relayer.lastRelayed))
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </Text>
                  <Text className="col-span-2">
                    <Icon
                      viewBox="0 0 200 200"
                      color={
                        relayer.status === "online" ? "green.500" : "red.500"
                      }
                    >
                      <path
                        fill="currentColor"
                        d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                      />
                    </Icon>
                    {relayer.status}
                  </Text>
                </div>
              ))}
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
