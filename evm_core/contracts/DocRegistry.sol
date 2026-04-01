// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Decentralized Document Registry
 * @dev Enforces O(1) cryptographic verification via state mapping
 */
contract DocRegistry {
    // Mapping a 32-byte SHA-256 hash to the block timestamp of its creation
    mapping(bytes32 => uint256) public anchors; 

    // Event emitted for off-chain indexing and audit logs
    event DocumentAnchored(bytes32 indexed docHash, uint256 timestamp);

    /**
     * @dev Anchors a new document hash to the EVM state.
     * @param _hash The SHA-256 hash of the plaintext document buffer.
     */
    function anchorHash(bytes32 _hash) external {
        require(anchors[_hash] == 0, "SECURITY_FAULT: Hash collision or duplicate anchor");
        
        anchors[_hash] = block.timestamp;
        emit DocumentAnchored(_hash, block.timestamp);
    }

    /**
     * @dev Verifies the existence of a document payload.
     * @param _hash The SHA-256 hash to verify.
     * @return bool True if the mathematical proof exists in state.
     */
    function verify(bytes32 _hash) external view returns (bool) {
        return anchors[_hash] != 0;
    }
}