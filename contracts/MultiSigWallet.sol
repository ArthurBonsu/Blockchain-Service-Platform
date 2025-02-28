// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MultiSigWallet is ReentrancyGuard {
    using SafeMath for uint256;

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 createdAt;
        uint256 approvalCount;
    }

    // Owner management
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    // Transaction tracking
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvals;

    // Additional security configurations
    uint256 public constant MAX_OWNER_COUNT = 10;
    uint256 public constant MAX_TRANSACTION_VALIDITY = 30 days;
    uint256 public constant MIN_THRESHOLD = 2;

    // Events with more detailed logging
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event TransactionSubmitted(
        uint256 indexed txId, 
        address indexed submitter, 
        address indexed destination, 
        uint256 value
    );
    event TransactionApproved(
        uint256 indexed txId, 
        address indexed owner, 
        uint256 approvalCount
    );
    event TransactionExecuted(
        uint256 indexed txId, 
        address indexed executor
    );
    event TransactionCancelled(
        uint256 indexed txId, 
        string reason
    );
    event OwnerAdded(address indexed owner, uint256 newThreshold);
    event OwnerRemoved(address indexed owner, uint256 newThreshold);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    // Modifiers with enhanced checks
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Only owners can call this function");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier txNotExpired(uint256 txId) {
        Transaction storage txn = transactions[txId];
        require(
            block.timestamp <= txn.createdAt + MAX_TRANSACTION_VALIDITY, 
            "Transaction has expired"
        );
        _;
    }

    modifier notApproved(uint256 txId) {
        require(!approvals[txId][msg.sender], "Transaction already approved");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Transaction already executed");
        _;
    }

    // Constructor with more robust initialization
    constructor(address[] memory _initialOwners, uint256 _initialThreshold) {
        require(_initialOwners.length > 0, "At least one owner required");
        require(
            _initialOwners.length <= MAX_OWNER_COUNT, 
            "Too many owners"
        );
        require(
            _initialThreshold >= MIN_THRESHOLD && 
            _initialThreshold <= _initialOwners.length, 
            "Invalid threshold"
        );

        // Initialize owners
        for (uint256 i = 0; i < _initialOwners.length; i++) {
            address owner = _initialOwners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        threshold = _initialThreshold;
    }

    // Receive function with balance tracking
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // Enhanced transaction submission
    function submitTransaction(
        address destination, 
        uint256 value, 
        bytes memory data
    ) public onlyOwner returns (uint256 txId) {
        require(destination != address(0), "Invalid destination");

        txId = transactions.length;
        transactions.push(Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            createdAt: block.timestamp,
            approvalCount: 0
        }));

        emit TransactionSubmitted(txId, msg.sender, destination, value);
        
        // Automatically approve by submitter
        _approveTransaction(txId);
    }

    // Internal approval mechanism
    function _approveTransaction(uint256 txId) internal {
        approvals[txId][msg.sender] = true;
        transactions[txId].approvalCount++;

        emit TransactionApproved(
            txId, 
            msg.sender, 
            transactions[txId].approvalCount
        );
    }

    // Enhanced transaction approval
    function approveTransaction(
        uint256 txId
    ) public 
      onlyOwner 
      txExists(txId) 
      notApproved(txId) 
      notExecuted(txId)
      txNotExpired(txId) 
    {
        _approveTransaction(txId);
        
        // Attempt to execute if threshold met
        if (isApproved(txId)) {
            _executeTransaction(txId);
        }
    }

    // Internal execution with more robust error handling
    function _executeTransaction(uint256 txId) internal nonReentrant {
        Transaction storage txn = transactions[txId];
        
        // Final threshold check
        if (txn.approvalCount < threshold) {
            return;
        }

        txn.executed = true;
        (bool success, bytes memory returnData) = txn.destination.call{value: txn.value}(txn.data);
        
        if (success) {
            emit TransactionExecuted(txId, msg.sender);
        } else {
            txn.executed = false;
            emit TransactionCancelled(
                txId, 
                string(abi.encodePacked("Execution failed: ", returnData))
            );
        }
    }

    // Comprehensive approval check
    function isApproved(uint256 txId) public view returns (bool) {
        return transactions[txId].approvalCount >= threshold;
    }

    // Enhanced owner management
    function addOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        require(!isOwner[newOwner], "Owner already exists");
        require(owners.length < MAX_OWNER_COUNT, "Maximum owner count reached");

        isOwner[newOwner] = true;
        owners.push(newOwner);

        // Dynamically adjust threshold if needed
        if (threshold < MIN_THRESHOLD) {
            threshold = owners.length;
        }

        emit OwnerAdded(newOwner, threshold);
    }

    // Comprehensive owner removal
    function removeOwner(address owner) public onlyOwner {
        require(isOwner[owner], "Not an owner");
        require(owners.length > MIN_THRESHOLD, "Cannot remove owner - minimum threshold");

        // Remove owner
        isOwner[owner] = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        // Adjust threshold if necessary
        if (threshold > owners.length) {
            threshold = owners.length;
        }

        emit OwnerRemoved(owner, threshold);
    }

    // Flexible threshold update
    function updateThreshold(uint256 newThreshold) public onlyOwner {
        require(
            newThreshold >= MIN_THRESHOLD && 
            newThreshold <= owners.length, 
            "Invalid threshold"
        );

        uint256 oldThreshold = threshold;
        threshold = newThreshold;

        emit ThresholdUpdated(oldThreshold, newThreshold);
    }

    // View functions for transparency
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransactionDetails(
        uint256 txId
    ) public view returns (
        address destination, 
        uint256 value, 
        bytes memory data, 
        bool executed,
        uint256 createdAt,
        uint256 approvalCount
    ) {
        Transaction storage txn = transactions[txId];
        return (
            txn.destination, 
            txn.value, 
            txn.data, 
            txn.executed,
            txn.createdAt,
            txn.approvalCount
        );
    }
}