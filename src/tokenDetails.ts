import { createPublicClient, http, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { Cache, CacheCategory } from "./cache";
import { getERC20BytesContract, getERC20Contract } from './utils';

const RPC_URL = process.env.RPC_URL;

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
  batch: { multicall: true }
})

export async function getTokenDetails(
  contractAddress: string,
  chainId: number,
  pool: string,
): Promise<{
  readonly name: string,
  readonly symbol: string,
  readonly decimals: number,
}> {
  const cache = await Cache.init(CacheCategory.Token, chainId);
  const token = await cache.read(contractAddress.toLowerCase());

  if (token) {
    return token;
  }

  const erc20 = getERC20Contract(contractAddress as `0x${string}`);
  const erc20Bytes = getERC20BytesContract(contractAddress as `0x${string}`);

  let results: [number, string, string];
  try {
    results = await client.multicall({
      allowFailure: false,
      contracts: [
        {
          ...erc20,
          functionName: "decimals",
        },
        {
          ...erc20,
          functionName: "name",
        },
        {
          ...erc20,
          functionName: "symbol",
        },
      ],
    });
  } catch (error) {
    console.log("First multicall failed, trying alternate method");
    try {
      const alternateResults = await client.multicall({
        allowFailure: false,
        contracts: [
          {
            ...erc20Bytes,
            functionName: "decimals",
          },
          {
            ...erc20Bytes,
            functionName: "name",
          },
          {
            ...erc20Bytes,
            functionName: "symbol",
          },
        ],
      });
      results = [
        alternateResults[0],
        hexToString(alternateResults[1]).replace(/\u0000/g, ''),
        hexToString(alternateResults[2]).replace(/\u0000/g, ''),
      ];
    } catch (alternateError) {
      console.error(`Alternate method failed for pool ${pool}:`);
      results = [0,"unknown","unknown"];
    }
  }

  const [decimals, name, symbol] = results;
  
  console.log(`Got token details for ${contractAddress}: ${name} (${symbol}) with ${decimals} decimals`);

  const entry = {
    name,
    symbol,
    decimals
  } as const;

  cache.add({ [contractAddress.toLowerCase()]: entry as any });
  return entry;
}