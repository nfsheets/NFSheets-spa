import { Button } from "@chakra-ui/react";
import { useContext } from "react";

import Web3Context from "../context/Web3Context";
import { getNfsheetsContract, getWeb3Provider } from "../utils";

const ConnectButton = () => {
  const { provider, setProvider, setNfsheetsContract, address, chainId } =
    useContext(Web3Context);

  return (
    <Button
      onClick={async () => {
        const provider = await getWeb3Provider();
        setProvider(provider);
        const contract = getNfsheetsContract(provider);
        setNfsheetsContract(contract);
      }}
      disabled={!!provider}
      colorScheme="green"
    >
      {!provider
        ? "Connect Wallet"
        : parseInt(process.env.REACT_APP_CHAIN_ID ?? "", 10) !== chainId
        ? "Wrong Network"
        : address
        ? address.slice(0, 6) + "..." + address.slice(-4)
        : "Connected"}
    </Button>
  );
};

export default ConnectButton;
