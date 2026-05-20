// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HashStorage {

    // Emitted on every storeHash call — BE subscribes to index events
    event HashStored(
        string  indexed batchId,
        string          dataHash,
        address indexed actor,
        uint256         timestamp
    );

    // batchId (e.g. "BATCH-88902") => SHA-256 hash of event data
    mapping(string => string) private batchHash;

    // Track which batchIds have been registered
    string[] private batchIds;

    // Store or update the hash for a given batchId
    function storeHash(string calldata batchId, string calldata dataHash) external {
        if (bytes(batchHash[batchId]).length == 0) {
            batchIds.push(batchId);
        }
        batchHash[batchId] = dataHash;
        emit HashStored(batchId, dataHash, msg.sender, block.timestamp);
    }

    // Read the stored hash for a batchId
    function getHash(string calldata batchId) external view returns (string memory) {
        return batchHash[batchId];
    }

    // Verify: returns true if the stored hash matches the provided hash
    function verifyHash(string calldata batchId, string calldata dataHash) external view returns (bool) {
        return keccak256(bytes(batchHash[batchId])) == keccak256(bytes(dataHash));
    }

    // Total number of unique batches stored
    function getBatchCount() external view returns (uint256) {
        return batchIds.length;
    }
}
