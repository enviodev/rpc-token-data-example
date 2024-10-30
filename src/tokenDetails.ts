import { createPublicClient, getContract, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Cache, CacheCategory } from "./cache";
import { ERC20ABI } from './constants';

const apiKey = process.env.ALCHEMY_API_KEY;

const client = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`),
  batch: { multicall: true }
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

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: ERC20ABI,
    client: { public: client },
  });

  try {
    const [name, symbol, decimals] = await Promise.all([
      contract.read.name(),
      contract.read.symbol(),
      contract.read.decimals(),
    ]);
    console.log(`symbol ${symbol} decimals ${decimals} name ${name}`);

    const entry = {
      name: name?.toString() || "",
      symbol: symbol?.toString() || "",
      decimals: decimals as number,
    } as const;

    cache.add({ [contractAddress.toLowerCase()]: entry as any });

    return entry;
  } catch (err) {
    throw err;
  }
}