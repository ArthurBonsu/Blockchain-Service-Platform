pragma solidity ^0.8.0;

interface IMultiSigWallet {
    // Events
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event TransactionSubmitted(uint256 indexed txId, address indexed submitter, address indexed destination, uint256 value);
    event TransactionApproved(uint256 indexed txId, address indexed owner, uint256 approvalCount);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);
    event TransactionCancelled(uint256 indexed txId, string reason);
    event OwnerAdded(address indexed owner, uint256 newThreshold);
    event OwnerRemoved(address indexed owner, uint256 newThreshold);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    // Functions
    function submitTransaction(address destination, uint256 value, bytes memory data) external returns (uint256 txId);
    function approveTransaction(uint256 txId) external;
    function addOwner(address newOwner) external;
    function removeOwner(address owner) external;
    function updateThreshold(uint256 newThreshold) external;
    function getOwners() external view returns (address[] memory);
    function getTransactionCount() external view returns (uint256);
    function getTransactionDetails(uint256 txId) external view returns (address destination, uint256 value, bytes memory data, bool executed, uint256 createdAt, uint256 approvalCount);
}