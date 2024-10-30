import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Cache, CacheCategory } from "./cache"; 
import { getRpcUrl } from './utils';
const erc20ABI = require("./ERC20.json");

const client = createPublicClient({ 
  chain: mainnet, 
  transport: http('https://eth-mainnet.g.alchemy.com/v2/ajCKOdS13oIjMV9BlDqdFJUZOve2Oth3'), 
}) 

export async function getTokenDetails(
  contractAddress: string,
  chainId: number
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

  // RPC URL
  // const rpcURL = getRpcUrl();

  console.log("attempting to get")
  console.log(erc20ABI)
  try {
    const name = await client.readContract({ 
      ...erc20ABI, 
      functionName: 'name',
    })
    console.log("got name", name)
    const symbol = await client.readContract({
      ...erc20ABI,
      functionName: 'symbol',
    })
  
    const decimals = await client.readContract({
      ...erc20ABI,
      functionName: 'decimals',
    })

    const entry = {
      name: name?.toString() || "",
      symbol: symbol?.toString() || "",
      decimals: decimals as number,
    } as const;

    console.log("got")

    cache.add({ [contractAddress.toLowerCase()]: entry as any});

    return entry;
  } catch (err) {
    console.error("An error occurred for token ", contractAddress, err);
    throw err
  }
}