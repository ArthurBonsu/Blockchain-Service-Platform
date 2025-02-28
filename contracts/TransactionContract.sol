pragma solidity ^0.8.0;

contract TransactionContract {
    // Mapping of transactions to their status
    mapping(bytes32 => Transaction) public transactions;

    // Mapping of transactions to their signatures
    mapping(bytes32 => mapping(address => bool)) public signatures;

    // Mapping of users to their signed transactions
    mapping(address => bytes32[]) public userSignedTransactions;

    // Event emitted when a new transaction is proposed
    event TransactionProposed(bytes32 indexed transactionHash, address indexed proposer);

    // Event emitted when a transaction is approved
    event TransactionApproved(bytes32 indexed transactionHash, address indexed approver);

    // Event emitted when a transaction is rejected
    event TransactionRejected(bytes32 indexed transactionHash, address indexed rejecter);

    // Event emitted when a transaction is executed
    event TransactionExecuted(bytes32 indexed transactionHash, address indexed executor);

    // Struct to represent a transaction
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 threshold;
        uint256 approvals;
        bool executed;
    }

    // Function to propose a new transaction
    function proposeTransaction(address to, uint256 value, bytes memory data, uint256 threshold) public {
        // Create a new transaction hash
        bytes32 transactionHash = keccak256(abi.encodePacked(to, value, data, threshold));

        // Create a new transaction
        Transaction memory transaction = Transaction(to, value, data, threshold, 0, false);

        // Store the transaction
        transactions[transactionHash] = transaction;

        // Emit an event to notify that the transaction has been proposed
        emit TransactionProposed(transactionHash, msg.sender);
    }

    // Function to approve a transaction
    function approveTransaction(bytes32 transactionHash) public {
        // Check if the transaction exists
        require(transactions[transactionHash].to != address(0), "Transaction does not exist");

        // Check if the transaction has already been approved by the user
        require(!signatures[transactionHash][msg.sender], "User has already approved the transaction");

        // Increment the approvals count
        transactions[transactionHash].approvals++;

        // Set the signature for the user
        signatures[transactionHash][msg.sender] = true;

        // Add the transaction to the user's signed transactions
        userSignedTransactions[msg.sender].push(transactionHash);

        // Emit an event to notify that the transaction has been approved
        emit TransactionApproved(transactionHash, msg.sender);
    }

    // Function to reject a transaction
    function rejectTransaction(bytes32 transactionHash) public {
        // Check if the transaction exists
        require(transactions[transactionHash].to != address(0), "Transaction does not exist");

        // Emit an event to notify that the transaction has been rejected
        emit TransactionRejected(transactionHash, msg.sender);
    }

    // Function to execute a transaction
    function executeTransaction(bytes32 transactionHash) public {
        // Check if the transaction exists
        require(transactions[transactionHash].to != address(0), "Transaction does not exist");

        // Check if the transaction has reached the threshold
        require(transactions[transactionHash].approvals >= transactions[transactionHash].threshold, "Transaction has not reached the threshold");

        // Check if the transaction has already been executed
        require(!transactions[transactionHash].executed, "Transaction has already been executed");

        // Execute the transaction
        (bool success, ) = transactions[transactionHash].to.call{value: transactions[transactionHash].value}(transactions[transactionHash].data);

        // Require that the transaction was successful
        require(success, "Transaction failed");

        // Set the transaction as executed
        transactions[transactionHash].executed = true;

        // Emit an event to notify that the transaction has been executed
        emit TransactionExecuted(transactionHash, msg.sender);
    }

    // Function to update the transaction status
    function updateTransactionStatus(bytes32 transactionHash, string memory status) public {
        // Emit an event to notify that the transaction status has been updated
        emit TransactionStatusUpdated(transactionHash, status);
    }

    // Function to store a transaction
    function storeTransaction(bytes32 transactionHash, address to, uint256 value, bytes memory data, uint256 threshold) public {
        // Create a new transaction
        Transaction memory transaction = Transaction(to, value, data, threshold, 0, false);

        // Store the transaction
        transactions[transactionHash] = transaction;
    }

   // Function to get all transactions
function getAllTransactions() public view returns (bytes32[] memory) {
    // Create an array to store the transaction hashes
    bytes32[] memory transactionHashes = new bytes32[](transactions.length);

    // Iterate over the transactions and add their hashes to the array
    uint256 index = 0;
    for (bytes32 transactionHash : transactions) {
        transactionHashes[index] = transactionHash;
        index++;
    }

    // Return the array of transaction hashes
    return transactionHashes;
}

// Function to check if a transaction is executable
function isTxnExecutable(bytes32 transactionHash) public view returns (bool) {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the transaction has reached the threshold
    return transactions[transactionHash].approvals >= transactions[transactionHash].threshold;
}

// Function to propose a transaction
function proposeTransaction(bytes32 transactionHash, address to, uint256 value, bytes memory data, uint256 threshold) public {
    // Create a new transaction
    Transaction memory transaction = Transaction(to, value, data, threshold, 0, false);

    // Store the transaction
    transactions[transactionHash] = transaction;

    // Emit an event to notify that the transaction has been proposed
    emit TransactionProposed(transactionHash, msg.sender);
}

// Function to approve a transfer
function approveTransfer(bytes32 transactionHash) public {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the transaction has already been approved by the user
    require(!signatures[transactionHash][msg.sender], "User has already approved the transaction");

    // Increment the approvals count
    transactions[transactionHash].approvals++;

    // Set the signature for the user
    signatures[transactionHash][msg.sender] = true;

    // Add the transaction to the user's signed transactions
    userSignedTransactions[msg.sender].push(transactionHash);

    // Emit an event to notify that the transaction has been approved
    emit TransactionApproved(transactionHash, msg.sender);
}

// Function to reject a transfer
function rejectTransfer(bytes32 transactionHash) public {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Emit an event to notify that the transaction has been rejected
    emit TransactionRejected(transactionHash, msg.sender);
}

// Function to check if the current user has already signed a transaction
function isCurrentUserAlreadySigned(bytes32 transactionHash) public view returns (bool) {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the current user has already signed the transaction
    return signatures[transactionHash][msg.sender];
}

// Function to check if a transaction has reached the threshold
function hasReachedThreshold(bytes32 transactionHash) public view returns (bool) {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the transaction has reached the threshold
    return transactions[transactionHash].approvals >= transactions[transactionHash].threshold;
}

// Function to refetch the transaction data
function refetch(bytes32 transactionHash) public {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Refetch the transaction data
    // TO DO: implement refetch logic
}

// Function to check if a transaction is signed
function checkIsSigned(bytes32 transactionHash) public view returns (bool) {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the transaction is signed
    return transactions[transactionHash].approvals > 0;
}

// Function to check if a transaction is executable
function checkIfTxnExecutable(bytes32 transactionHash) public view returns (bool) {
    // Check if the transaction exists
    require(transactions[transactionHash].to != address(0), "Transaction does not exist");

    // Check if the transaction is executable
    return transactions[transactionHash].approvals >= transactions[transactionHash].threshold;
}