import BigNumber from "bignumber.js";
import { Address } from '../configure'

export const pancakeRouterAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
    ],
    name: "getAmountsOut",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const fetchPancakeOutputAmount = async ({ web3, amountIn, path }) => {
  const contract = new web3.eth.Contract(
    pancakeRouterAbi,
    Address.PANCAKE_ROUTER_ADDRESS
  ); 
  const amounts = await contract.methods.getAmountsOut(amountIn, path).call();

  return BigNumber(amounts[amounts.length - 1]);
};
