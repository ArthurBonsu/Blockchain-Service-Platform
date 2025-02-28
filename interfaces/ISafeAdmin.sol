pragma solidity ^0.8.0;

interface ISafe {
    // Events
    event OwnerAdded(address indexed owner, uint256 weight, uint256 totalWeight);
    event OwnerRemoved(address indexed owner, uint256 weight, uint256 totalWeight);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event Deposited(address indexed depositor, address indexed asset, uint256 amount);
    event TransactionProposed(uint256 indexed txId, address indexed proposer, address indexed destination, uint256 value);
    event TransactionApproved(uint256 indexed txId, address indexed approver, uint256 approvalWeight, uint256 totalApprovals);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);
    event ExecutionFailure(uint256 indexed txId, bytes reason);

    // Functions
    function proposeTransaction(address destination, uint256 value, bytes memory data) external returns (uint256 transactionId);
    function approveTransaction(uint256 transactionId) external;
    function addOwner(address newOwner, uint256 weight) external;
    function removeOwner(address owner) external;
    function updateThreshold(uint256 newThreshold) external;
    function getOwners() external view returns (address[] memory);
    function getOwnerDetails(address owner) external view returns (uint256 weight, bool exists, uint256 joinedAt);
    function getTransactionCount() external view returns (uint256);
    function getUserTransactions(address user) external view returns (uint256[] memory);
}