// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract LandOwnership is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    // Enhanced Events
    event LandRegistered(uint256 indexed landId, string location, uint256 size, uint256 price, string geohash);
    event LandPurchased(uint256 indexed landId, address indexed buyer, uint256 price, uint256 commission);
    event LandTransferred(uint256 indexed landId, address indexed from, address indexed to, uint256 partialSize);
    event LandPriceUpdated(uint256 indexed landId, uint256 oldPrice, uint256 newPrice);
    event LandDeregistered(uint256 indexed landId, string reason);
    event RoyaltyPaid(address indexed recipient, uint256 amount);

    // Enhanced Land Struct
    struct Land {
        uint256 id;
        address owner;
        string location;
        string geohash;
        uint256 totalSize;
        uint256[] partialSizes;
        uint256 price;
        bool isSold;
        bool isActive;
        uint256 registrationTimestamp;
    }

    // Price History Struct
    struct PriceRecord {
        uint256 price;
        uint256 timestamp;
        address recorder;
    }

    // Mappings
    mapping(address => Land[]) private landOwners;
    mapping(uint256 => Land) private lands;
    mapping(uint256 => bool) private landExists;
    mapping(uint256 => PriceRecord[]) private landPriceHistory;
    mapping(address => uint256) private royaltyBalances;
    
    // Royalty and Commission Settings
    uint256 public constant COMMISSION_PERCENTAGE = 2; // 2% commission on sales
    uint256 public constant ROYALTY_PERCENTAGE = 5; // 5% royalty for original owner

    // Land Registration Constraints
    uint256 private landCount;
    uint256 private constant MAX_LAND_REGISTRATION = 1000;
    uint256 private constant MIN_LAND_SIZE = 100; // sq meters
    uint256 private constant MAX_LAND_SIZE = 1000000; // sq meters

    constructor() {
        landCount = 0;
    }

    // Enhanced Land Registration with Geohash
    function registerLand(
        string memory _location, 
        uint256 _size, 
        uint256 _price,
        string memory _geohash
    ) public onlyOwner {
        // Validate land size and registration limits
        require(_size >= MIN_LAND_SIZE && _size <= MAX_LAND_SIZE, "Invalid land size");
        require(landCount < MAX_LAND_REGISTRATION, "Maximum land registration limit reached");
        require(bytes(_geohash).length > 0, "Geohash is required");

        // Increment and create land ID
        landCount++;

        // Create new land with geohash and partial sizes support
        Land memory newLand = Land({
            id: landCount,
            owner: address(0),
            location: _location,
            geohash: _geohash,
            totalSize: _size,
            partialSizes: new uint256[](0),
            price: _price,
            isSold: false,
            isActive: true,
            registrationTimestamp: block.timestamp
        });

        // Store land details
        lands[landCount] = newLand;
        landExists[landCount] = true;

        emit LandRegistered(landCount, _location, _size, _price, _geohash);
    }

    // Enhanced Buy Land with Commission
    function buyLand(uint256 _landId) public payable nonReentrant {
        // Validate land existence and sale status
        require(landExists[_landId], "Land does not exist");
        require(lands[_landId].isActive, "Land is not active");
        require(!lands[_landId].isSold, "Land is already sold");
        require(msg.value >= lands[_landId].price, "Insufficient payment");

        // Calculate commissions and royalties
        uint256 salePrice = lands[_landId].price;
        uint256 commission = (salePrice * COMMISSION_PERCENTAGE) / 100;
        uint256 royalty = lands[_landId].owner != address(0) 
            ? (salePrice * ROYALTY_PERCENTAGE) / 100 
            : 0;

        // Update land ownership
        address previousOwner = lands[_landId].owner;
        lands[_landId].owner = msg.sender;
        lands[_landId].isSold = true;

        // Add to buyer's land portfolio
        landOwners[msg.sender].push(lands[_landId]);

        // Record price history
        landPriceHistory[_landId].push(PriceRecord({
            price: salePrice,
            timestamp: block.timestamp,
            recorder: msg.sender
        }));

        // Handle royalties and commissions
        if (previousOwner != address(0)) {
            royaltyBalances[previousOwner] += royalty;
            payable(previousOwner).transfer(salePrice - commission - royalty);
        }

        // Refund excess payment
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }

        emit LandPurchased(_landId, msg.sender, salePrice, commission);
    }

    // Enhanced Land Transfer with Partial Land Support
    function transferLand(
        uint256 _landId, 
        address _newOwner, 
        uint256 _partialSize
    ) public {
        // Validate ownership and transfer details
        require(lands[_landId].owner == msg.sender, "Not land owner");
        require(_newOwner != address(0), "Invalid new owner");
        require(landExists[_landId], "Land does not exist");
        require(_partialSize > 0 && _partialSize <= lands[_landId].totalSize, "Invalid partial size");

        // Update land details
        address previousOwner = lands[_landId].owner;
        
        // If transferring entire land
        if (_partialSize == lands[_landId].totalSize) {
            lands[_landId].owner = _newOwner;
        } else {
            // Create a new land parcel for partial transfer
            landCount++;
            Land memory newPartialLand = Land({
                id: landCount,
                owner: _newOwner,
                location: lands[_landId].location,
                geohash: lands[_landId].geohash,
                totalSize: _partialSize,
                partialSizes: new uint256[](0),
                price: (lands[_landId].price * _partialSize) / lands[_landId].totalSize,
                isSold: true,
                isActive: true,
                registrationTimestamp: block.timestamp
            });

            // Update original land
            lands[_landId].totalSize -= _partialSize;
            lands[_landId].partialSizes.push(_partialSize);

            // Store new partial land
            lands[landCount] = newPartialLand;
            landExists[landCount] = true;
        }

        // Add to new owner's portfolio
        landOwners[_newOwner].push(lands[_landId]);

        emit LandTransferred(_landId, previousOwner, _newOwner, _partialSize);
    }

    // Deregister Land (Only by Owner)
    function deregisterLand(uint256 _landId, string memory _reason) public onlyOwner {
        require(landExists[_landId], "Land does not exist");
        
        // Mark land as inactive
        lands[_landId].isActive = false;

        emit LandDeregistered(_landId, _reason);
    }

    // Claim Royalties
    function claimRoyalties() public {
        uint256 royaltyAmount = royaltyBalances[msg.sender];
        require(royaltyAmount > 0, "No royalties available");

        royaltyBalances[msg.sender] = 0;
        payable(msg.sender).transfer(royaltyAmount);

        emit RoyaltyPaid(msg.sender, royaltyAmount);
    }

    // Get Land Price History
    function getLandPriceHistory(uint256 _landId) public view returns (PriceRecord[] memory) {
        require(landExists[_landId], "Land does not exist");
        return landPriceHistory[_landId];
    }

    // Additional Getter Functions (with existing implementations)
    function getLandDetails(uint256 _landId) public view returns (
        string memory location, 
        string memory geohash,
        uint256 size, 
        uint256 price, 
        bool isSold,
        bool isActive,
        uint256 registrationTime
    ) {
        require(landExists[_landId], "Land does not exist");
        Land memory land = lands[_landId];
        return (
            land.location, 
            land.geohash,
            land.totalSize, 
            land.price, 
            land.isSold,
            land.isActive,
            land.registrationTimestamp
        );
    }

    // Withdraw Contract Funds (only owner)
    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}