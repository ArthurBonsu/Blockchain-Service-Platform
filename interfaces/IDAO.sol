ragma solidity ^0.8.0;

interface IDAO {
    // Events
    event TransactionProposed(bytes32 indexed transactionHash, address indexed proposer, address to, uint256 value);
    event TransactionApproved(bytes32 indexed transactionHash, address indexed approver);
    event TransactionExecuted(bytes32 indexed transactionHash);
    event TransactionRejected(bytes32 indexed transactionHash);

    // Functions
    function addMember(address member, bytes32 role) external;
    function removeMember(address member, bytes32 role) external;
    function proposeTransaction(bytes32 transactionHash, address to, uint256 value, bytes memory data, uint256 threshold) external;
    function approveTransaction(bytes32 transactionHash) external;
    function executeTransaction(bytes32 transactionHash) external;
    function rejectTransaction(bytes32 transactionHash) external;
    function checkRole(address member, bytes32 role) external view returns (bool);
}