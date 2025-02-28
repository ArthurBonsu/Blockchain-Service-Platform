// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LandOwnership is Ownable, ReentrancyGuard {
    // Events for better transparency
    event LandRegistered(uint256 indexed landId, string location, uint256 size, uint256 price);
    event LandPurchased(uint256 indexed landId, address indexed buyer, uint256 price);
    event LandTransferred(uint256 indexed landId, address indexed from, address indexed to);
    event LandPriceUpdated(uint256 indexed landId, uint256 oldPrice, uint256 newPrice);

    // Struct to store land details
    struct Land {
        uint256 id;
        address owner;
        string location;
        uint256 size;
        uint256 price;
        bool isSold;
        uint256 registrationTimestamp;
    }

    // Mappings
    mapping(address => Land[]) private landOwners;
    mapping(uint256 => Land) private lands;
    mapping(uint256 => bool) private landExists;

    uint256 private landCount;
    uint256 private constant MAX_LAND_REGISTRATION = 1000; // Limit total land registrations
    uint256 private constant MIN_LAND_SIZE = 100; // Minimum land size in sq meters
    uint256 private constant MAX_LAND_SIZE = 1000000; // Maximum land size in sq meters

    constructor() {
        landCount = 0;
    }

    // Register new land parcel
    function registerLand(
        string memory _location, 
        uint256 _size, 
        uint256 _price
    ) public onlyOwner {
        // Validate land size
        require(_size >= MIN_LAND_SIZE && _size <= MAX_LAND_SIZE, "Invalid land size");
        require(landCount < MAX_LAND_REGISTRATION, "Maximum land registration limit reached");

        // Increment and create land ID
        landCount++;

        // Create new land
        Land memory newLand = Land({
            id: landCount,
            owner: address(0),
            location: _location,
            size: _size,
            price: _price,
            isSold: false,
            registrationTimestamp: block.timestamp
        });

        // Store land details
        lands[landCount] = newLand;
        landExists[landCount] = true;

        emit LandRegistered(landCount, _location, _size, _price);
    }

    // Buy land with additional safety checks
    function buyLand(uint256 _landId) public payable nonReentrant {
        // Validate land existence and sale status
        require(landExists[_landId], "Land does not exist");
        require(!lands[_landId].isSold, "Land is already sold");
        require(msg.value >= lands[_landId].price, "Insufficient payment");

        // Update land ownership
        address previousOwner = lands[_landId].owner;
        lands[_landId].owner = msg.sender;
        lands[_landId].isSold = true;

        // Add to buyer's land portfolio
        landOwners[msg.sender].push(lands[_landId]);

        // Refund excess payment
        if (msg.value > lands[_landId].price) {
            payable(msg.sender).transfer(msg.value - lands[_landId].price);
        }

        emit LandPurchased(_landId, msg.sender, lands[_landId].price);
    }

    // Transfer land with additional checks
    function transferLand(uint256 _landId, address _newOwner) public {
        // Validate ownership and transfer recipient
        require(lands[_landId].owner == msg.sender, "Not land owner");
        require(_newOwner != address(0), "Invalid new owner");
        require(landExists[_landId], "Land does not exist");

        // Update ownership
        address previousOwner = lands[_landId].owner;
        lands[_landId].owner = _newOwner;

        // Add to new owner's portfolio
        landOwners[_newOwner].push(lands[_landId]);

        emit LandTransferred(_landId, previousOwner, _newOwner);
    }

    // Update land price with restrictions
    function updateLandPrice(uint256 _landId, uint256 _newPrice) public {
        require(lands[_landId].owner == msg.sender, "Not land owner");
        require(landExists[_landId], "Land does not exist");
        require(_newPrice > 0, "Price must be positive");

        uint256 oldPrice = lands[_landId].price;
        lands[_landId].price = _newPrice;

        emit LandPriceUpdated(_landId, oldPrice, _newPrice);
    }

    // Getter functions with enhanced visibility
    function getLandOwner(uint256 _landId) public view returns (address) {
        require(landExists[_landId], "Land does not exist");
        return lands[_landId].owner;
    }

    function getLandDetails(uint256 _landId) public view returns (
        string memory location, 
        uint256 size, 
        uint256 price, 
        bool isSold,
        uint256 registrationTime
    ) {
        require(landExists[_landId], "Land does not exist");
        Land memory land = lands[_landId];
        return (
            land.location, 
            land.size, 
            land.price, 
            land.isSold,
            land.registrationTimestamp
        );
    }

    // Get lands owned by an address
    function getLandsOwnedByAddress(address _owner) public view returns (Land[] memory) {
        return landOwners[_owner];
    }

    // Get total registered land count
    function getLandCount() public view returns (uint256) {
        return landCount;
    }

    // Withdraw contract balance (only owner)
    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}