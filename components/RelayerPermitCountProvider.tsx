import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { EventCacheItem, RelayerCountInfo, RelayerCountInfoMap, RelayerPermitDataCollector, SyncingQueueContext } from "../lib/relayer-permit-sync";
import { usePublicClient } from "wagmi";

export interface RelayerCollectorCache {
  promise: Promise<EventCacheItem>;
  context: SyncingQueueContext;
  isSyncing: boolean;
  isError: boolean;
  resolve: (value: EventCacheItem) => void;
  reject: (reason?: any) => void;
}

export const RelayerPermitCountContext = createContext<{
  countMap: RelayerCountInfoMap;
  dataCollector: RelayerPermitDataCollector | null;
  getAndSyncPermitCountMap: () => Promise<RelayerCollectorCache | null>;
}>({
  countMap: {},
  dataCollector: null,
  getAndSyncPermitCountMap: async function (): Promise<RelayerCollectorCache | null> {
    throw new Error("Function not implemented.");
  }
});

const CollectorCache = new Map<string, RelayerCollectorCache>();

export function RelayerPermitCountProvider({
  chainConfig,
  children
}: {
  chainConfig: {
    chainId: number,
    contractAddress: string,
    batchSize: number,
    startBlock: number,
  },
  children: React.ReactNode
}) {
  const publicClient = usePublicClient();
  const [countMap, setCountMap] = useState<RelayerCountInfoMap>({});

  const dataCollector = useMemo(() => {
    const { chainId, contractAddress } = chainConfig;
    if(chainId === undefined || contractAddress === undefined) {
      return null;
    }

    const collector = new RelayerPermitDataCollector({
      chainId,
      contractAddress,
    });
    return collector;
  }, [chainConfig]);

  const getAndSyncPermitCountMap = useCallback(async () => {
    if (!dataCollector) return null;
    try {
      const latestBlockNumber = await publicClient.getBlockNumber();
      const batchSize = BigInt(chainConfig.batchSize);
      // TODO: start block
      let currentStartBlock = BigInt(chainConfig.startBlock);
      let currentEndBlock = currentStartBlock + batchSize;

      // let cache = dataCollector.cache;
      const collectorCache = CollectorCache.get(chainConfig.contractAddress);

      let cache!: EventCacheItem;
      if(collectorCache && !collectorCache.isError) {
        if(collectorCache.isSyncing) {
          return collectorCache;
        }
        cache = await collectorCache.promise;
        if(latestBlockNumber < cache.endBlock) {
          return collectorCache;
        }
        currentStartBlock = cache.endBlock;
        currentEndBlock = currentStartBlock + batchSize > latestBlockNumber ? latestBlockNumber : currentStartBlock + batchSize;
      } else {
        const newCache: EventCacheItem = {
          permittedCountMap: {},
          fromBlock: currentStartBlock,
          endBlock: latestBlockNumber,
          events: [],
          isSyncing: true,
        }
        cache = newCache;  
      }
      const context = {
        publicClient,
        currentStartBlock,
        currentEndBlock,
        batchSize,
        latestBlockNumber,
        isStop: false
      };
      // let resolve!: (value: EventCacheItem) => void;
      // let reject!: (reason?: any) => void;


      const newCollectorCache: RelayerCollectorCache = {
        promise: null as any,
        context,
        isSyncing: true,
        isError: false,
        resolve: null as any,
        reject: null as any,
      };
      newCollectorCache.promise = new Promise<EventCacheItem>(async (res, rej) => {
        newCollectorCache.resolve = res;
        newCollectorCache.reject = rej;
        try {
          const r = await dataCollector.syncPermitEvent(cache, context);
          newCollectorCache.isSyncing = false;
          res(r);
        } catch (error) {
          newCollectorCache.isSyncing = false;
          newCollectorCache.isError = true;
          rej(error);
        }
      });
      CollectorCache.set(dataCollector.key, newCollectorCache);
      return newCollectorCache;
    } catch (error) {
      console.error(`getAndSyncPermitCountMap error, chainId: ${chainConfig.chainId}, contractAddress: ${chainConfig.contractAddress}`, error);
      throw error; 
    }
  }, [chainConfig.batchSize, chainConfig.chainId, chainConfig.contractAddress, chainConfig.startBlock, dataCollector, publicClient]);



  useEffect(() => {
    if(!dataCollector) return;
    setCountMap({});
    const CollectorCacheList = Array.from(CollectorCache);
    CollectorCacheList.forEach(([key, cache]) => {
      if(cache.isSyncing && key !== dataCollector.key) {
        console.warn(`key=${key} isSyncing, cancel`);
        cache.reject('new collector created');
      }
    });

    console.log('getAndSyncPermitCountMap', dataCollector.key);
    getAndSyncPermitCountMap()
      .then(async (c) => {
        if(c?.promise) {
          const cache = await c.promise;
          setCountMap(cache.permittedCountMap);
        }
      });
  }, [dataCollector])


  return <RelayerPermitCountContext.Provider value={{
    countMap,
    dataCollector,
    getAndSyncPermitCountMap,
  }}>{children}</RelayerPermitCountContext.Provider>;
}