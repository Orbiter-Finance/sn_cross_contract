import {
  Account,
  CallData,
  Contract,
  RpcProvider,
  num,
  shortString,
  uint256,
} from "starknet";
import obSourceAbi from "../starknet-artifacts/contracts/ob_source.cairo/ob_source_abi.json";

async function main() {
  const obSourceContractAddress = process.env["OB_SOURCE_CONTRACT_ADDRESS"];
  if (!obSourceContractAddress) {
    console.error("Miss process.env.OB_SOURCE_CONTRACT_ADDRESS");
    return;
  }

  const rpcProvider = new RpcProvider({
    nodeUrl: process.env["RPC_PROVIDER_NODEURL"],
  });

  const chainId = await rpcProvider.getChainId();
  console.log("chainId:", chainId);

  const deployerAccount = process.env["DEPLOYER_ACCOUNT"] || "";
  console.log("process.env.DEPLOYER_ACCOUNT:", deployerAccount);
  const account = new Account(
    rpcProvider,
    deployerAccount,
    process.env["DEPLOYER_PRIVATEKEY"] || ""
  );

  const orSourceContract = new Contract(
    obSourceAbi,
    obSourceContractAddress,
    account
  );

  const token =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  const amount = uint256.bnToUint256("0x100000");

  const { result: allowanceU } = await rpcProvider.callContract({
    contractAddress: token,
    entrypoint: "allowance",
    calldata: CallData.compile({
      owner: deployerAccount,
      spender: obSourceContractAddress,
    }),
  });
  const allowance = uint256.uint256ToBN({
    low: allowanceU[0],
    high: allowanceU[1],
  });
  console.log("allowance:", allowance);

  if (num.toBigInt(allowance) < num.toBigInt(uint256.uint256ToBN(amount))) {
    const { transaction_hash: approveHash } = await account.execute([
      {
        contractAddress: token,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: obSourceContractAddress,
          amount,
        }),
      },
    ]);
    console.log("Waiting approveHash:", approveHash);
    await rpcProvider.waitForTransaction(approveHash);
  }

  const { transaction_hash: transferERC20Hash } =
    await orSourceContract.transferERC20(
      token,
      "0x029a5b3ed839b9d190c4e5a2108572b7389c49376231c068244f2d9fda1ac4a2",
      amount,
      ["0x1234", "0x5678"]
    );
  console.log("transferERC20Hash:", transferERC20Hash);

  const receipt = await rpcProvider.waitForTransaction(transferERC20Hash);

  console.log("receipt.events:", receipt.events);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
