import { ethers } from "ethers";
import { createContext } from "react";

interface IWeb3Context {
  provider?: ethers.providers.Web3Provider;
  nfsheetsContract?: ethers.Contract;
  address?: string;
  chainId?: number;
  setProvider(newProvider: ethers.providers.Web3Provider): void;
  setNfsheetsContract(newContract: ethers.Contract): void;
  setAddress(newAddress: string): void;
  setChainId(newChainId: number): void;
}

const Web3Context = createContext<IWeb3Context>({
  setProvider: () => {},
  setNfsheetsContract: () => {},
  setAddress: () => {},
  setChainId: () => {},
});

export default Web3Context;
