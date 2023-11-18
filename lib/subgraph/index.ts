import { ApolloClient, InMemoryCache } from '@apollo/client';
import RelayerQuery from './relayer-query.gql';

export function initializeGqlClient(clientUrl: string) {
  return new ApolloClient({
    uri: clientUrl,
    cache: new InMemoryCache(),
  });
}

export class RelayerSubgraph {
  client!: ApolloClient<any>;
  constructor(
    public readonly clientUrl: string,
  ) {
    this.client = initializeGqlClient(clientUrl);
  }

  fetchRelayers() {
    return this.client.query<{
      newRelayers: Array<{
        id: string,
        relayer: string,
        relayerMetadataUri: string,
        blockNumber: string,
        blockTimestamp: string,
        transactionHash: string,
      }>
    }>({
      query: RelayerQuery,
      variables: {}
    });
  }
}

export const subgraph = new RelayerSubgraph('https://api.studio.thegraph.com/query/58839/intent-relayer-goerli/version/latest');