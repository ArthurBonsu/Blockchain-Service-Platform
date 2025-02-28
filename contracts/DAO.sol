pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TransactionContract.sol";

contract DAO is AccessControl {
    // Define roles
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    Transaction public transaction;
    uint256 public constant APPROVAL_THRESHOLD = 2; // Minimum approvals needed

    // Tracking member votes
    mapping(bytes32 => mapping(address => bool)) public memberVotes;
    mapping(bytes32 => uint256) public transactionApprovals;

    // Events for transparency
    event TransactionProposed(
        bytes32 indexed transactionHash, 
        address indexed proposer, 
        address to, 
        uint256 value
    );
    event TransactionApproved(
        bytes32 indexed transactionHash, 
        address indexed approver
    );
    event TransactionExecuted(
        bytes32 indexed transactionHash
    );
    event TransactionRejected(
        bytes32 indexed transactionHash
    );

    constructor(address _transaction) {
        // Set contract deployer as default admin
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Allow admin to have all roles initially
        _setupRole(PROPOSER_ROLE, msg.sender);
        _setupRole(APPROVER_ROLE, msg.sender);
        _setupRole(EXECUTOR_ROLE, msg.sender);

        transaction = Transaction(_transaction);
    }

    // Add a new member with a specific role
    function addMember(address member, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(role, member);
    }

    // Remove a member's role
    function removeMember(address member, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(role, member);
    }

    // Propose a transaction (only by members with PROPOSER_ROLE)
    function proposeTransaction(
        bytes32 transactionHash, 
        address to, 
        uint256 value, 
        bytes memory data, 
        uint256 threshold
    ) public onlyRole(PROPOSER_ROLE) {
        transaction.proposeTransaction(transactionHash, to, value, data, threshold);
        
        emit TransactionProposed(transactionHash, msg.sender, to, value);
    }

    // Approve a transaction (only by members with APPROVER_ROLE)
    function approveTransaction(bytes32 transactionHash) public onlyRole(APPROVER_ROLE) {
        require(!memberVotes[transactionHash][msg.sender], "Already voted");
        
        memberVotes[transactionHash][msg.sender] = true;
        transactionApprovals[transactionHash]++;

        emit TransactionApproved(transactionHash, msg.sender);

        // Auto-execute if threshold is met
        if (transactionApprovals[transactionHash] >= APPROVAL_THRESHOLD) {
            executeTransaction(transactionHash);
        }
    }

    // Execute a transaction (only by members with EXECUTOR_ROLE)
    function executeTransaction(bytes32 transactionHash) public onlyRole(EXECUTOR_ROLE) {
        transaction.executeTransaction(transactionHash);
        
        emit TransactionExecuted(transactionHash);
    }

    // Reject a transaction
    function rejectTransaction(bytes32 transactionHash) public onlyRole(APPROVER_ROLE) {
        transaction.rejectTransaction(transactionHash);
        
        emit TransactionRejected(transactionHash);
    }

    // Check if a member has a specific role
    function checkRole(address member, bytes32 role) public view returns (bool) {
        return hasRole(role, member);
    }
}