/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  UniswapV3Factory,
  Pool,
} from "generated";
import { getTokenDetails } from "./tokenDetails";

UniswapV3Factory.PoolCreated.handler(async ({ event, context }) => {
  const entity: Pool = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    token0_id: event.params.token0.replace(/\0/g, ''),
    token1_id: event.params.token1.replace(/\0/g, ''),
    fee: event.params.fee,
    tickSpacing: event.params.tickSpacing,
    pool: event.params.pool.replace(/\0/g, ''),
  };
  context.Pool.set(entity)


  try {
    const {name: name0, symbol: symbol0, decimals: decimals0} = await getTokenDetails(event.params.token0, event.chainId, event.params.pool);
    context.Token.set({
      id: event.params.token0.replace(/\0/g, ''),
      name: name0.replace(/\0/g, ''),
      symbol: symbol0.replace(/\0/g, ''),
      decimals: decimals0
    })    
  } catch (error) {
    console.log('failed token0 with address', event.params.token0)
    return
  }

  try {
    const {name: name1, symbol: symbol1, decimals: decimals1} = await getTokenDetails(event.params.token1, event.chainId, event.params.pool);
    context.Token.set({
      id: event.params.token1.replace(/\0/g, ''),
      name: name1.replace(/\0/g, ''),
      symbol: symbol1.replace(/\0/g, ''),
      decimals: decimals1,
    })
  } catch (error) {
    console.log('failed token1 with address', event.params.token1)
    return
  }
});
