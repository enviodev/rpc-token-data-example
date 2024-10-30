import { parseAbi } from "viem";

// export const RPCS = [
//     "https://eth.llamarpc.com",
//     "https://eth.rpc.blxrbdn.com",
//     "https://rpc.ankr.com/eth",
//     "https://eth.rpc.blxrbdn.com",
//     "https://eth-mainnet.public.blastapi.io",
//     "https://rpc.mevblocker.io"
// ];

export const ERC20ABI = parseAbi([
    'function name() public view returns (string memory)',
    'function symbol() view returns (string memory)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address account) public view returns (uint256)',
    'function transfer(address to, uint256 value) public returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
]);