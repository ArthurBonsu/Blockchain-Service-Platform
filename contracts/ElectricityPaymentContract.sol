// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ElectricityPaymentContract
 * @dev Contract for handling electricity payments for houses
 */
contract ElectricityPaymentContract is Ownable, ReentrancyGuard {
    // Payment structure
    struct Payment {
        string houseId;
        address payer;
        uint256 amount;
        uint256 timestamp;
        string meterReading;
        bool isPaid;
        string paymentHash;
    }
    
    // Billing structure
    struct Bill {
        string billId;
        string houseId;
        uint256 amount;
        uint256 dueDate;
        uint256 creationDate;
        bool isPaid;
        string meterReadingStart;
        string meterReadingEnd;
    }
    
    // Mapping from houseId to payments
    mapping(string => Payment[]) public housePayments;
    
    // Mapping from billId to bill details
    mapping(string => Bill) public bills;
    
    // Mapping from house ID to owner address
    mapping(string => address) public houseOwners;
    
    // Array of all house IDs
    string[] public allHouseIds;
    
    // Token used for payments
    IERC20 public paymentToken;
    
    // Utility company address that receives payments
    address public utilityCompanyAddress;
    
    // Events
    event PaymentCreated(string houseId, address payer, uint256 amount, string paymentHash);
    event BillCreated(string billId, string houseId, uint256 amount, uint256 dueDate);
    event BillPaid(string billId, string houseId, address payer, uint256 amount);
    event HouseRegistered(string houseId, address owner);
    
    /**
     * @dev Constructor sets the token address and utility company address
     * @param _tokenAddress The address of the ERC20 token used for payments
     * @param _utilityCompanyAddress The address of the utility company
     */
    constructor(address _tokenAddress, address _utilityCompanyAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_utilityCompanyAddress != address(0), "Invalid utility company address");
        
        paymentToken = IERC20(_tokenAddress);
        utilityCompanyAddress = _utilityCompanyAddress;
    }
    
    /**
     * @dev Register a new house
     * @param _houseId Unique identifier for the house
     * @param _owner Address of the house owner
     */
    function registerHouse(string memory _houseId, address _owner) public onlyOwner {
        require(_owner != address(0), "Invalid owner address");
        require(bytes(_houseId).length > 0, "Invalid house ID");
        require(houseOwners[_houseId] == address(0), "House already registered");
        
        houseOwners[_houseId] = _owner;
        allHouseIds.push(_houseId);
        
        emit HouseRegistered(_houseId, _owner);
    }
    
    /**
     * @dev Create a new bill for a house
     * @param _billId Unique identifier for the bill
     * @param _houseId Identifier for the house
     * @param _amount Amount to be paid
     * @param _dueDate Due date for the payment
     * @param _meterReadingStart Starting meter reading
     * @param _meterReadingEnd Ending meter reading
     */
    function createBill(
        string memory _billId,
        string memory _houseId,
        uint256 _amount,
        uint256 _dueDate,
        string memory _meterReadingStart,
        string memory _meterReadingEnd
    ) public onlyOwner {
        require(bytes(_billId).length > 0, "Invalid bill ID");
        require(bytes(_houseId).length > 0, "Invalid house ID");
        require(_amount > 0, "Amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(houseOwners[_houseId] != address(0), "House not registered");
        require(bills[_billId].creationDate == 0, "Bill ID already exists");
        
        Bill memory newBill = Bill({
            billId: _billId,
            houseId: _houseId,
            amount: _amount,
            dueDate: _dueDate,
            creationDate: block.timestamp,
            isPaid: false,
            meterReadingStart: _meterReadingStart,
            meterReadingEnd: _meterReadingEnd
        });
        
        bills[_billId] = newBill;
        
        emit BillCreated(_billId, _houseId, _amount, _dueDate);
    }
    
    /**
     * @dev Make a payment for a bill
     * @param _billId The bill to pay
     * @param _meterReading Current meter reading
     */
    function payBill(string memory _billId, string memory _meterReading) public nonReentrant {
        Bill storage bill = bills[_billId];
        require(bytes(bill.billId).length > 0, "Bill does not exist");
        require(!bill.isPaid, "Bill already paid");
        require(block.timestamp <= bill.dueDate, "Bill payment is overdue");
        
        // Verify the caller is the house owner or authorized to pay
        require(
            houseOwners[bill.houseId] == msg.sender,
            "Only house owner can pay"
        );
        
        // Transfer tokens from payer to utility company
        require(
            paymentToken.transferFrom(msg.sender, utilityCompanyAddress, bill.amount),
            "Token transfer failed"
        );
        
        // Create a payment record
        string memory paymentHash = generatePaymentHash(bill.houseId, msg.sender, bill.amount);
        
        Payment memory newPayment = Payment({
            houseId: bill.houseId,
            payer: msg.sender,
            amount: bill.amount,
            timestamp: block.timestamp,
            meterReading: _meterReading,
            isPaid: true,
            paymentHash: paymentHash
        });
        
        // Update payment records and bill status
        housePayments[bill.houseId].push(newPayment);
        bill.isPaid = true;
        
        emit PaymentCreated(bill.houseId, msg.sender, bill.amount, paymentHash);
        emit BillPaid(bill.billId, bill.houseId, msg.sender, bill.amount);
    }
    
    /**
     * @dev Generate a unique payment hash
     * @param _houseId House identifier
     * @param _payer Address of the payer
     * @param _amount Amount of the payment
     * @return A unique hash for the payment
     */
    function generatePaymentHash(
        string memory _houseId,
        address _payer,
        uint256 _amount
    ) internal view returns (string memory) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _houseId,
                _payer,
                _amount,
                block.timestamp,
                block.difficulty
            )
        );
        
        return bytes32ToString(hash);
    }
    
    /**
     * @dev Convert bytes32 to string
     * @param _bytes32 The bytes32 to convert
     * @return String representation
     */
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i*2] = toHexChar(uint8(_bytes32[i] >> 4));
            bytesArray[i*2+1] = toHexChar(uint8(_bytes32[i] & 0x0f));
        }
        return string(bytesArray);
    }
    
    /**
     * @dev Convert byte to hex character
     */
    function toHexChar(uint8 _i) internal pure returns (bytes1) {
        if (_i < 10) {
            return bytes1(uint8(_i) + 0x30);
        } else {
            return bytes1(uint8(_i) + 0x57);
        }
    }
    
    /**
     * @dev Get all payments for a house
     * @param _houseId House identifier
     * @return Array of payments
     */
    function getHousePayments(string memory _houseId) public view returns (Payment[] memory) {
        return housePayments[_houseId];
    }
    
    /**
     * @dev Get number of houses registered
     * @return Number of houses
     */
    function getHouseCount() public view returns (uint256) {
        return allHouseIds.length;
    }
    
    /**
     * @dev Update the utility company address
     * @param _newAddress New utility company address
     */
    function updateUtilityCompanyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        utilityCompanyAddress = _newAddress;
    }
    
    /**
     * @dev Update the payment token
     * @param _newTokenAddress New token address
     */
    function updatePaymentToken(address _newTokenAddress) public onlyOwner {
        require(_newTokenAddress != address(0), "Invalid token address");
        paymentToken = IERC20(_newTokenAddress);
    }
}