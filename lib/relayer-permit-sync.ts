import { PublicClient, parseAbiItem } from "viem";

import { retry, delay } from "./relayer-helper";

// import ERC20PermitAbi from "../assets/abi/ERC20Permit.json";
const PermitAbiItem = parseAbiItem(
  "event Approval(address indexed owner,address indexed spender,uint256 value)"
);
export type PermitLogType = {
  blockNumber: string;
  txHash: string;
  logIndex: string;
  owner: string;
  spender: string;
  amount: string;
}

export interface RelayerCountInfo {
  lastBlockNumber: number;
  count: number;
  // amount: bigint;
}
export interface RelayerCountInfoMap {
  [spender: string]: RelayerCountInfo,
}

export interface EventCacheItem {
  permittedCountMap: RelayerCountInfoMap;
  fromBlock: bigint;
  endBlock: bigint;
  events: Array<PermitLogType>;
  isSyncing: boolean;
}
export interface SyncingQueueContext {
  publicClient: PublicClient,
  currentStartBlock: bigint,
  currentEndBlock: bigint,
  batchSize: bigint,
  latestBlockNumber: bigint,
  isStop: boolean,
}
export interface TreeSyncingQueueItem {
  promise: Promise<EventCacheItem>,
  context: SyncingQueueContext,
}
export type PermitLogsType = PermitLogType[];



export type RelayerPermitDataCache = Map<string, EventCacheItem>;

export interface ChainConfig {
  chainId: number;
  contractAddress: string;
}
// `chainId-contractAddress` => EventCacheItem
const contractPermitCache = new Map<string, EventCacheItem>();


export class RelayerPermitDataCollector {
  config!: ChainConfig;

  constructor(config: ChainConfig) {
    if(!config.contractAddress) throw new Error("contractAddress is undefined");
    this.config = config;
    console.log({
      message: "RelayerPermitDataCollector constructor",
      config,
    });
  }

  get key() {
    return `${this.config.chainId}-${this.config.contractAddress}`;
  }

  get cache() {
    return contractPermitCache.get(this.key);
  }

  setCache(cache: EventCacheItem) {
    contractPermitCache.set(this.key, cache);
  }

  async syncPermitEvent(
    EventCacheItem: EventCacheItem,
    context: SyncingQueueContext
  ) {
    if(!this.config.contractAddress) return Promise.reject("contractAddress is undefined");
    return new Promise<EventCacheItem>(async (resolve, reject) => {
      try {
        const result = await this.syncPermitEventFromRpc(EventCacheItem, context);
        return resolve(result);
      } catch (error) {
        console.error("syncPermitEventFromRpc error, stop");
        reject(error);
      }
    });
  }
  
  async syncPermitEventFromRpc(
    EventCacheItem: EventCacheItem,
    context: SyncingQueueContext
  ) {
    console.log({
      message: "start syncPermitEventFromRpc",
      EventCacheItem,
      config: context,
    });
    let tmpEvents: PermitLogsType = [];
    while (context.currentEndBlock <= context.latestBlockNumber) {
      try {
        if (context.isStop) {
          break;
        }
        console.log(
          `parsing ${context.currentStartBlock} ~ ${context.currentEndBlock} (EndBlockNumber=${context.latestBlockNumber}) ......`
        );
        const rawEvents = await retry(
          async () => {
            const tmpLogs = await getPermitLogs(
              context.publicClient,
              this.config.contractAddress,
              context.currentStartBlock,
              context.currentEndBlock
            );
            console.log({
              message: "getPermitLogs",
              tmpLogs,
            });
            return tmpLogs;
          },
          5,
          5000,
          async (error, retryTimes) => {
            console.error(
              `ERROR: getPermitLogs RETRY, errorTimes=${retryTimes}`
            );
            console.error(error);
          }
        );
        tmpEvents = tmpEvents.concat(
          rawEvents.map((rawEvent) => {
            const r: PermitLogType = {
              blockNumber: rawEvent.blockNumber.toString(),
              txHash: rawEvent.transactionHash,
              logIndex: rawEvent.logIndex.toString(),
              owner: rawEvent.args.owner as string,
              spender: rawEvent.args.spender as string,
              amount: (rawEvent.args.value as any).toString(),
            };
            return r;
          })
        );
  
        context.currentStartBlock = context.currentEndBlock + 1n;
        context.currentEndBlock =
          context.currentEndBlock + context.batchSize > context.latestBlockNumber
            ? context.latestBlockNumber
            : context.currentEndBlock + context.batchSize;
        if (context.currentStartBlock > context.latestBlockNumber) {
          break;
        }
      } catch (error) {
        console.error(error);
        EventCacheItem.isSyncing = false;
        await updateRelayerPermitFromEvents(context.publicClient, EventCacheItem, tmpEvents);
        contractPermitCache.set(this.key, EventCacheItem);
        throw error;
      }
      await delay(Math.floor(Math.random() * 500 + 300)); // avoid rate limit, 300ms ~ 800ms
    }
    EventCacheItem.isSyncing = false;
    console.log({
      message: "end syncPermitEventFromRpc",
      EventCacheItem,
      context,
      tmpEvents,
    });
    await updateRelayerPermitFromEvents(context.publicClient, EventCacheItem, tmpEvents);
    EventCacheItem.isSyncing = false;

    // NOTE: only sync from rpc would assign `context.currentEndBlock` to EventCacheItem.endBlock
    // due to subgraph doesn't provide latest blockNumber what it has been synced
    EventCacheItem.endBlock = context.currentEndBlock;
    contractPermitCache.set(this.key, EventCacheItem);
  
    return EventCacheItem;
  }
}

export async function updateRelayerPermitFromEvents(
  PublicClient: PublicClient,
  EventCacheItem: EventCacheItem,
  newEvents: PermitLogsType
) {
  // merge old events and new events, new events will overwrite old events
  const eventMap = new Map<string, PermitLogType>();
  const oldEvents = EventCacheItem.events;

  oldEvents.forEach((event) => {
    eventMap.set(`${event.txHash}-${event.logIndex}`, event);
  });
  newEvents.forEach((event) => {
    eventMap.set(`${event.txHash}-${event.logIndex}`, event);
  });

  console.log({
    newEvents
  })

  const mergedEvents = Array.from(eventMap.values());

  for(let i = 0; i < mergedEvents.length; i++) {
    const ev = mergedEvents[i];
    console.log({
      ev
    })
    // const spender = ev.spender.toLowerCase();
    // const amount = ev.amount;
    const blockNumber = Number(ev.blockNumber);
    const tx = await PublicClient.getTransaction({
      hash: ev.txHash as any as `0x${string}`,
    })
    const from = tx.from.toLowerCase();

    if (!EventCacheItem.permittedCountMap[from]) {
      EventCacheItem.permittedCountMap[from] = {
        count: 0,
        lastBlockNumber: 0,
      };
    }
    EventCacheItem.permittedCountMap[from].count += 1;
    if (blockNumber > EventCacheItem.permittedCountMap[from].lastBlockNumber) {
      EventCacheItem.permittedCountMap[from].lastBlockNumber = blockNumber;
    }
  }

  return {
    EventCacheItem,
    events: mergedEvents,
  };
}

export async function getPermitLogs(
  publicClient: PublicClient,
  contractAddress: string,
  fromBlock: bigint,
  toBlock: bigint
) {
  try {
    const filter = await publicClient.createEventFilter({
      address: contractAddress as any as `0x${string}`,
      event: PermitAbiItem,
      fromBlock,
      toBlock,
    });
  
    const logs = await publicClient.getFilterLogs({
      filter,
    });
    return logs;
  } catch (error: any) {
    // if(error.code === -32601) {
    //   // the method eth_newFilter does not exist/is not available
    // }
    console.warn("eth_newFilter is not available, try eth_getLogs");
    return await getRawLogs(publicClient, contractAddress, fromBlock, toBlock);
    // throw error;
  }
}

export async function getRawLogs(
  publicClient: PublicClient,
  contractAddress: string,
  fromBlock: bigint,
  toBlock: bigint
) {
  const logs = await publicClient.getLogs({
    address: contractAddress as any as `0x${string}`,
    event: PermitAbiItem,
    fromBlock,
    toBlock,
  })
  return logs;
}
