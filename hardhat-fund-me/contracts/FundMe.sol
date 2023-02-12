/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// import "hardhat/consol.sol"; // use consol.log in solidity file (doesnt work yet)

// Error codes: NameOfContract__ErrorName
error FundMe__NotOwner();
error FundMe__InsufficientDonation();

/**
 * @title A contract for crowd funding
 * @author My name
 * @notice This contract is a demo
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State Variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    AggregatorV3Interface private s_priceFeed;

    // Events
    // Modifier
    modifier onlyOwner() {
        // require(owner == msg.sender, "Not Owner!");
        // use customer owner instead of storing a string in require saves gas
        if (i_owner != msg.sender) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // take argument of address of price feed depends on the chain we deploy it on
    constructor(address priceFeedAddress) {
        i_owner = payable(msg.sender);
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        // consol.log("Price feed address set.");
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

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice fund the contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        // if requirement fails, revert error
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__InsufficientDonation();
        } // 1e18 == 1 * 10 ** 18 in wei, is 1 eth
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    /**
     * @notice withdraw the fund
     * @dev This implements price feeds as our library
     */
    function withdraw() public payable onlyOwner {
        // reset array and mapping
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        // reset array
        s_funders = new address[](0);
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

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            // mapping cannot be in memory
            s_addressToAmountFunded[funder] = 0;
        }
        // reset array
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // view / pure
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
