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
    token0_id: event.params.token0,
    token1_id: event.params.token1,
    fee: event.params.fee,
    tickSpacing: event.params.tickSpacing,
    pool: event.params.pool,
  };
  context.Pool.set(entity)


  try {
    const {name: name0, symbol: symbol0, decimals: decimals0} = await getTokenDetails(event.params.token0, event.chainId);
    context.Token.set({
      id: event.params.token0,
      name: name0,
      symbol: symbol0,
      decimals: decimals0
    })
  } catch (error) {
    console.log(error)
    return
  }

  try {
    const {name: name1, symbol: symbol1, decimals: decimals1} = await getTokenDetails(event.params.token0, event.chainId);
    context.Token.set({
      id: event.params.token1,
      name: name1,
      symbol: symbol1,
      decimals: decimals1,
    })
  } catch (error) {
    console.log(error)
    return
  }
});
