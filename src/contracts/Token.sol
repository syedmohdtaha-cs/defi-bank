// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

  address public minter;
  //add minter variable

  //add minter changed event
  event MinterChanged(address indexed from,address to);

  constructor() public payable ERC20("Decenta Bank", "Tokeni") {

    minter = msg.sender;
    //asign initial minter
  }

  function passMinterRole(address dBank) public returns(bool) {
   
     require(msg.sender == minter,"Owner is not minter");

     minter = dBank;
     
     emit MinterChanged(msg.sender,dBank);

     return true;



  }

  //Add pass minter role function

  function mint(address account, uint256 amount) public {

    require(msg.sender == minter,"Owner does not have minter role");

    //check if msg.sender have minter role
		_mint(account, amount);
	}
} 