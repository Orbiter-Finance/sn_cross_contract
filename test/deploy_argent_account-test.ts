import { Contract, ec, Provider, uint256 } from "starknet";
import { BigNumberish } from "starknet/utils/number";
import compiledArgentAccount from "../account-contract-artifacts/0.2.0/ArgentAccount/ArgentAccount.cairo/ArgentAccount.json";
import { TIMEOUT } from "./constants";

const OK_TX_STATUSES = ["PENDING", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"];
const ETH_ADDRESSES = {
  mainnet: "",
  goerli: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
};
const OB_SOURCE_ADDRESSES = {
  mainnet: "",
  goerli: "0x0457bf9a97e854007039c43a6cc1a81464bd2a4b907594dabc9132c162563eb3",
};

function getUint256CalldataFromBN(bn: BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(String(bn)) };
}

describe("Starknet", function () {
  this.timeout(TIMEOUT);
  it("Test deploy argent account", async function () {
    const provider = new Provider({ network: "goerli-alpha" });

    const starkKeyPair = ec.genKeyPair();
    const starkKeyPub = ec.getStarkKey(starkKeyPair);

    console.warn(
      "Private key: ",
      "0x" + starkKeyPair.getPrivate().toString("hex")
    );
    console.warn("Public key: ", starkKeyPub);

    const accountResponse = await provider.deployContract({
      contract: compiledArgentAccount as any,
      addressSalt: starkKeyPub,
    });

    console.warn("accountResponse: ", accountResponse);

    await provider.waitForTransaction(accountResponse.transaction_hash);
    const accountContract = new Contract(
      (compiledArgentAccount as any)["abi"],
      String(accountResponse?.address)
    );
    const { transaction_hash: initializeTxHash } =
      await accountContract.initialize(starkKeyPub, "0");
    const resp = await provider.waitForTransaction(initializeTxHash);

    console.warn(resp);
  });
});
