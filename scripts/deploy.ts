import { Provider } from "starknet";
import OBSource from "../starknet-artifacts/contracts/ob_source.cairo/ob_source.json";

async function main() {
  const provider = new Provider({ network: 'goerli-alpha'});
  const deployResp = await provider.deployContract({
    contract: OBSource as any,
  });

  //   const contractFactory = await hardhat.starknet.getContractFactory("contract");
  //   const contract = await contractFactory.deploy({ initial_balance: 0 });
  console.log("Deployed to:", deployResp);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
