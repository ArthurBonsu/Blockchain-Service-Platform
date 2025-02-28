pragma solidity ^0.8.0;

interface ILandOwnership {
    // Events
    event LandRegistered(uint256 indexed landId, string location, uint256 size, uint256 price);
    event LandPurchased(uint256 indexed landId, address indexed buyer, uint256 price);
    event LandTransferred(uint256 indexed landId, address indexed from, address indexed to);
    event LandPriceUpdated(uint256 indexed landId, uint256 oldPrice, uint256 newPrice);

    // Functions
    function registerLand(string memory _location, uint256 _size, uint256 _price) external;
    function buyLand(uint256 _landId) external payable;
    function transferLand(uint256 _landId, address _newOwner) external;
    function updateLandPrice(uint256 _landId, uint256 _newPrice) external;
    function getLandOwner(uint256 _landId) external view returns (address);
    function getLandDetails(uint256 _landId) external view returns (string memory, uint256, uint256, bool, uint256);
    function getLandsOwnedByAddress(address _owner) external view returns (Land[] memory);
    function getLandCount() external view returns (uint256);
    function withdrawFunds() external;
}

struct Land {
    uint256 id;
    address owner;
    string location;
    uint256 size;
    uint256 price;
    bool isSold;
    uint256 registrationTimestamp;
}