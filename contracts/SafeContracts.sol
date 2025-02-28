pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SafeContract is ReentrancyGuard {
using SafeMath for uint256;

// Enhanced owner structure
struct Owner {
    uint256 weight;
    bool exists;s
    uint256 joinedAt;
}

// Enhanced transaction structure
struct Transaction {
    address destination;
    uint256 value;
    bytes data;
    uint256 approvals;
    bool executed;
    uint256 createdAt;
    address proposer;
    mapping(address => bool) confirmations;
}

// Configurations and limits
uint256 public constant MAX_OWNERS = 10;
uint256 public constant MAX_TRANSACTION_VALIDITY = 30 days;
uint256 public constant MIN_WEIGHT = 1;
uint256 public constant MAX_WEIGHT = 100;

// Mappings and state variables
mapping(address => Owner) public owners;
address[] public ownerAddresses;
uint256 public threshold;
uint256 public totalWeight;

// Transaction management
Transaction[] public transactions;
mapping(address => uint256[]) public userTransactions;

// Asset tracking
mapping(address => uint256) public assets;

// Events with enhanced logging
event OwnerAdded(address indexed owner, uint256 weight, uint256 totalWeight);
event OwnerRemoved(address indexed owner, uint256 weight, uint256 totalWeight);
event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
event Deposited(address indexed depositor, address indexed asset, uint256 amount);
event TransactionProposed(uint256 indexed txId, address indexed proposer, address indexed destination, uint256 value);
event TransactionApproved(uint256 indexed txId, address indexed approver, uint256 approvalWeight, uint256 totalApprovals);
event TransactionExecuted(uint256 indexed txId, address indexed executor);
event ExecutionFailure(uint256 indexed txId, bytes reason);

// Modifiers with enhanced checks
modifier onlyOwner() {
    require(owners[msg.sender].exists, "Not an owner");
    _;
}

modifier validOwner(address _owner) {
    require(_owner != address(0), "Invalid owner address");
    _;
}

modifier validTransaction(uint256 transactionId) {
    require(transactionId < transactions.length, "Transaction does not exist");
    require(block.timestamp <= transactions[transactionId].createdAt + MAX_TRANSACTION_VALIDITY, "Transaction expired");
    _;
}

// Constructor with robust initialization
constructor(address[] memory _initialOwners, uint256[] memory _weights, uint256 _threshold) public {
    require(_initialOwners.length > 0, "At least one owner required");
    require(_initialOwners.length == _weights.length, "Owners and weights must match");
    require(_initialOwners.length <= MAX_OWNERS, "Too many owners");
    uint256 initialTotalWeight = 0;
    for (uint256 i = 0; i < _initialOwners.length; i++) {
        address owner = _initialOwners[i];
        uint256 weight = _weights[i];
        require(weight >= MIN_WEIGHT && weight <= MAX_WEIGHT, "Invalid owner weight");
        require(!owners[owner].exists, "Duplicate owner");
        owners[owner] = Owner({weight: weight, exists: true, joinedAt: block.timestamp});
        ownerAddresses.push(owner);
        initialTotalWeight += weight;
        emit OwnerAdded(owner, weight, initialTotalWeight);
    }
    totalWeight = initialTotalWeight;
    require(_threshold > 0 && _threshold <= initialTotalWeight, "Invalid threshold");
    threshold = _threshold;
}

// Function to propose a new transaction
function proposeTransaction(address destination, uint256 value, bytes memory data) public onlyOwner returns (uint256 transactionId) {
    require(destination != address(0), "Invalid destination");
    transactionId = transactions.length;
    Transaction storage newTransaction = transactions.push();
    newTransaction.destination = destination;
    newTransaction.value = value;
    newTransaction.data = data;
    newTransaction.createdAt = block.timestamp;
    newTransaction.proposer = msg.sender;
    newTransaction.approvals = 0;
    userTransactions[msg.sender].push(transactionId);
    emit TransactionProposed(transactionId, msg.sender, destination, value);
    // Automatically approve by proposer
    _approveTransaction(transactionId);
}

// Internal transaction approval function
function _approveTransaction(uint256 transactionId) internal {
    Transaction storage txn = transactions[transactionId];
    require(!txn.confirmations[msg.sender], "Already confirmed");
    uint256 ownerWeight = owners[msg.sender].weight;
    txn.confirmations[msg.sender] = true;
    txn.approvals += ownerWeight;
    emit TransactionApproved(transactionId, msg.sender, ownerWeight, txn.approvals);
    // Attempt execution if threshold met
if (txn.approvals >= threshold) {
    _executeTransaction(transactionId);
}

}

// Approve a transaction
function approveTransaction(uint256 transactionId) public onlyOwner validTransaction(transactionId) {
_approveTransaction(transactionId);
}

// Internal transaction execution function
function _executeTransaction(uint256 transactionId) internal nonReentrant {
Transaction storage txn = transactions[transactionId];
require(!txn.executed, "Already executed");
require(txn.approvals >= threshold, "Insufficient approvals");
txn.executed = true;
(bool success, bytes memory returnData) = txn.destination.call{value: txn.value}(txn.data);
if (success) {
emit TransactionExecuted(transactionId, msg.sender);
} else {
txn.executed = false;
emit ExecutionFailure(transactionId, returnData);
}
}

// Add a new owner with weight
function addOwner(address newOwner, uint256 weight) public onlyOwner validOwner(newOwner) {
require(!owners[newOwner].exists, "Owner already exists");
require(weight >= MIN_WEIGHT && weight <= MAX_WEIGHT, "Invalid weight");
require(ownerAddresses.length < MAX_OWNERS, "Max owners reached");
owners[newOwner] = Owner({weight: weight, exists: true, joinedAt: block.timestamp});
ownerAddresses.push(newOwner);
totalWeight += weight;
// Adjust threshold if necessary
if (threshold > totalWeight) {
threshold = totalWeight;
}
emit OwnerAdded(newOwner, weight, totalWeight);
}

// Remove an owner
function removeOwner(address owner) public onlyOwner {
require(owners[owner].exists, "Not an owner");
require(ownerAddresses.length > 1, "Cannot remove last owner");
uint256 ownerWeight = owners[owner].weight;
totalWeight -= ownerWeight;
delete owners[owner];
// Remove from owner addresses
for (uint256 i = 0; i < ownerAddresses.length; i++) {
if (ownerAddresses[i] == owner) {
ownerAddresses[i] = ownerAddresses[ownerAddresses.length - 1];
ownerAddresses.pop();
break;
}
}
// Adjust threshold if necessary
if (threshold > totalWeight) {
threshold = totalWeight;
}
emit OwnerRemoved(owner, ownerWeight, totalWeight);
}

// Update threshold
function updateThreshold(uint256 newThreshold) public onlyOwner {
require(newThreshold > 0 && newThreshold <= totalWeight, "Invalid threshold");
uint256 oldThreshold = threshold;
threshold = newThreshold;
emit ThresholdUpdated(oldThreshold, newThreshold);
}

// View functions for transparency
function getOwners() public view returns (address[] memory) {
return ownerAddresses;
}

function getOwnerDetails(address owner) public view returns (uint256 weight, bool exists, uint256 joinedAt) {
Owner memory ownerDetails = owners[owner];
return (ownerDetails.weight, ownerDetails.exists, ownerDetails.joinedAt);
}

function getTransactionCount() public view returns (uint256) {
return transactions.length;
}

function getUserTransactions(address user) public view returns (uint256[] memory) {
return userTransactions[user];
}

// Function to set up a new multi-sig safe address
function setUpMultiSigSafeAddress(address[] memory _owners, uint256 _threshold) public {
// Set the owners and threshold
owners = _owners;
threshold = _threshold;
// Emit an event to notify that the safe has been created
emit SafeCreated(address(this), owners, threshold);
}

// Function to add a new owner to the safe
function addAddressToSafe(address newOwner) public {
// Check if the new owner is already an owner
require(!isOwner[newOwner], "Owner already exists");
// Add the new owner to the owners array
owners.push(newOwner);
// Set the owner index
ownerIndices[newOwner] = owners.length - 1;
// Set the owner status to true
isOwner[newOwner] = true;
// Emit an event to notify that the owner has been added
emit OwnerAdded(newOwner);
}

// Function to get the safe info
function getSafeInfo() public view returns (address, address[] memory, uint256) {
return (address(this), owners, threshold);
}

// Function to set the pending add owner data
function setPendingAddOwnerData(address owner, uint256 timestamp) public {
pendingAddOwnerData[owner] = PendingAddOwnerData(owner, timestamp);
}

// Function to set the pending add owner status
function setIsPendingAddOwner(address owner, bool status) public {
isPendingAddOwner[owner] = status;
}

function userAddToSafe(address user) public {
// Check if the user is already an owner
require(!isOwner[user], "User is already an owner");
// Add the user to the owners array
owners.push(user);
// Set the owner index
ownerIndices[user] = owners.length - 1;
// Set the owner status to true
isOwner[user] = true;
// Emit an event to notify that the user has been added
emit OwnerAdded(user);
}

// Function to update the transaction status
function updateTransactionStatus(address transactionHash, string memory status) public {
// Emit an event to notify that the transaction status has been updated
emit TransactionStatusUpdated(transactionHash, status);
}

// Function to get the safe info used
function getSafeInfoUsed() public view returns (address, address[] memory, uint256) {
return (address(this), owners, threshold);
}

// Function to get the safe owners
function getSafeOwners() public view returns (address[] memory) {
return owners;
}
}
// Function to get the transaction details
function getTransactionDetails(uint256 transactionId) public view returns (address destination, uint256 value, bytes memory data, uint256 approvals, bool executed) {
Transaction storage txn = transactions[transactionId];
return (txn.destination, txn.value, txn.data, txn.approvals, txn.executed);
}

// Function to get the owner details
function getOwnerDetails(address owner) public view returns (uint256 weight, bool exists, uint256 joinedAt) {
Owner storage ownerDetails = owners[owner];
return (ownerDetails.weight, ownerDetails.exists, ownerDetails.joinedAt);
}

// Function to check if an address is an owner
function isOwnerAddress(address owner) public view returns (bool) {
return owners[owner].exists;
}

// Function to get the total weight of all owners
function getTotalWeight() public view returns (uint256) {
return totalWeight;
}

// Function to get the threshold
function getThreshold() public view returns (uint256) {
return threshold;
}
