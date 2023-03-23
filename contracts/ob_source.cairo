# Declare this file as a StarkNet contract and set the required
# builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256
from starkware.starknet.common.syscalls import get_caller_address
from interfaces.IERC20 import IERC20

@external
func transferERC20{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*,
        range_check_ptr}(_token : felt, _to : felt, _amount : Uint256, _ext : felt):
    let (sender) = get_caller_address()

    let (success) = IERC20.transferFrom(
        contract_address = _token,
        sender = sender,
        recipient = _to,
        amount = _amount
    )

    assert success = 1

    return ()
end