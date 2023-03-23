#!/bin/bash
# output=$(starknet deploy --contract starknet-artifacts/contracts/contract.cairo/contract.json --network alpha)
# echo $output
# deploy_tx_id=$(echo $output | sed -r "s/.*Transaction ID: (\w*).*/\1/")
# address=$(echo $output | sed -r "s/.*Contract address: (\w*).*/\1/")
# echo "Address: $address"
# echo "tx_id: $deploy_tx_id"
# starknet invoke --function increase_balance --inputs 10 20 --network alpha --address $address --abi starknet-artifacts/contracts/contract.cairo/contract_abi.json
# #starknet tx_status --id $deploy_tx_id --network alpha
# starknet call --function get_balance --network alpha --address $address --abi starknet-artifacts/contracts/contract.cairo/contract_abi.json


# Deploy ob_source (Deploy to mainnet, need add contract to starknet whitelisted and add --token [token])
starknet deploy --contract starknet-artifacts/contracts/ob_source.cairo/ob_source.json --network [alpha-goerli | alpha-mainnet] 

# Ob_Source on mainnet
# {
#     "status": "PENDING",
#     "transaction": {
#         "class_hash": "0x68bb00f783b88aeb61551f5383e6b7f1621463cb570e8f63df89e3681045134",
#         "constructor_calldata": [],
#         "contract_address": "0x173f81c529191726c6e7287e24626fe24760ac44dae2a1f7e02080230f8458b",
#         "contract_address_salt": "0x6cf40960eecbd81f9d91f9569dc9149180a19eae7e9f582653206e85925679c",
#         "transaction_hash": "0x5c3c54f56333fcd78921d387edf346fd475710a56237bae3575bae942c99ec2",
#         "type": "DEPLOY"
#     },
#     "transaction_index": 42
# }