// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD
/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address public immutable owner;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        // require(owner == msg.sender, "Not Owner!");
        // use customer owner instead of storing a string in require saves gas
        if (owner != msg.sender) {
            revert NotOwner();
        }
        _;
    }

    function fund() public payable {
        // if requirement fails, revert error
        require(
            msg.value.getConversionRate() >= MINIMUM_USD,
            "Didn't send enough"
        ); // 1e18 == 1 * 10 ** 18 in wei, is 1 eth
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function widthdraw() public onlyOwner {
        // reset array and mapping
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmountFunded[funder] = 0;
        }
        // reset array
        funders = new address[](0);
        // withdraw fund

        // transfer (capped 2300 gas, throw an error)
        /* payable(msg.sender).transfer(address(this).balance); */

        // send (capped 2300 gas, return bool)
        /* bool sendSuccess = payable(msg.sender).send(address(this).balance);

        require(sendSuccess, "Send failed"); // revert previous action if fails */
        // call, forward all gas or set gas, returns bool and return data, recommended way
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed"); // revert previous action if fails
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}
