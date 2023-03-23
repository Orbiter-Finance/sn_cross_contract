import { expect } from "chai";
import { Account, Contract, ec, number, Provider, uint256 } from "starknet";
import { Uint256 } from "starknet/dist/utils/uint256";
import { BigNumberish } from "starknet/utils/number";
import ob_source_abi from "../starknet-artifacts/contracts/ob_source.cairo/ob_source_abi.json";
import argent_accounts from "./argent_accounts.json";
import { TIMEOUT } from "./constants";
import l2_abi_erc20 from "./l2_abi_erc20.json";

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
  it("Test ob_source", async function () {
    const provider = new Provider({ network: "goerli-alpha" });
    const userSender = new Account(
      provider,
      argent_accounts["alpha-goerli"].address,
      ec.getKeyPair(argent_accounts["alpha-goerli"].private_key)
    );
    const userRecipientAddress =
      "0x04a6a84c3235fedbb0c782de55a5146e04cceeb6261b19791e325767fdf8ddbd";
    const ethContract = new Contract(
      <any>l2_abi_erc20,
      ETH_ADDRESSES.goerli,
      userSender
    );
    const obSourceContract = new Contract(
      <any>ob_source_abi,
      OB_SOURCE_ADDRESSES.goerli,
      userSender
    );

    const balanceSender: Uint256 = (
      await ethContract.balanceOf(userSender.address)
    ).balance;
    console.warn("balanceSender.balance: ", balanceSender.low + "");
    const balanceRecipient: Uint256 = (
      await ethContract.balanceOf(userRecipientAddress)
    ).balance;
    console.warn("balanceRecipient.balance: ", balanceRecipient.low + "");
    const amount = number.toBN(10 ** 14);

    // Approve
    const approveResp = await ethContract.approve(
      OB_SOURCE_ADDRESSES.goerli,
      getUint256CalldataFromBN(amount)
    );
    console.warn("Waitting approve transaction:", approveResp.transaction_hash);
    await provider.waitForTransaction(approveResp.transaction_hash);
    console.warn("Aapprove end:", approveResp.transaction_hash);

    const ext = "0x016ce4D9694c1626862234216bA78874dE70903A71012345678910";
    // const transferResp: any = await userSender.callContract({
    //   contractAddress: OB_SOURCE_ADDRESSES.goerli,
    //   entrypoint: "transferERC20",
    //   calldata: compileCalldata({
    //     _token: ETH_ADDRESSES.goerli,
    //     _to: userRecipientAddress,
    //     _amount: getUint256CalldataFromBN(amount),
    //     _ext: ext,
    //   }),
    // });
    const transferResp = await obSourceContract.transferERC20(
      ETH_ADDRESSES.goerli,
      userRecipientAddress,
      getUint256CalldataFromBN(amount),
      ext
    );
    console.warn(
      "Waitting transfer transaction:",
      transferResp.transaction_hash
    );
    await provider.waitForTransaction(transferResp.transaction_hash);
    console.warn("Transfer end:", transferResp.transaction_hash);

    const balanceRecipientAfter: Uint256 = (
      await ethContract.balanceOf(userRecipientAddress)
    ).balance;
    expect(balanceRecipientAfter.low + "").to.equal(
      number.toBN(balanceRecipient.low).add(amount).toString()
    );
  });
});
