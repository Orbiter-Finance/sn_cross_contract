import { readFileSync } from "fs";
import hardhat from "hardhat";
import { Account, RpcProvider, json } from "starknet";

async function main() {
  const obSourceContractAddress = process.env["OB_SOURCE_CONTRACT_ADDRESS"];
  if (obSourceContractAddress) {
    console.error("Exist process.env.OB_SOURCE_CONTRACT_ADDRESS");
    return;
  }

  await hardhat.run("starknet-compile", {
    paths: ["contracts/ob_source.cairo"],
  });

  const rpcProvider = new RpcProvider({
    nodeUrl: process.env["RPC_PROVIDER_NODEURL"],
  });

  const chainId = await rpcProvider.getChainId();
  console.log("chainId:", chainId);

  const account = new Account(
    rpcProvider,
    process.env["DEPLOYER_ACCOUNT"] || "",
    process.env["DEPLOYER_PRIVATEKEY"] || ""
  );

  const compiled = json.parse(
    readFileSync(
      __dirname +
        "/../starknet-artifacts/contracts/ob_source.cairo/ob_source.json"
    ).toString("ascii")
  );

  const resultInfo = await account.declareAndDeploy({
    contract: compiled,
  });
  console.log("resultInfo:", resultInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
