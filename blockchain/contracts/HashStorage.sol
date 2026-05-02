// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HashStorage {
    string[] private hashes;

    function storeHash(string memory hash) public {
        hashes.push(hash);
    }

    function getHash(uint256 index) public view returns (string memory) {
        return hashes[index];
    }
}
