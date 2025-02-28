pragma solidity ^0.8.0;

interface ICrowdsource {
    // Events
    event CampaignCreated(bytes32 indexed campaignId, string indexed campaignName, address indexed recipient, uint256 indexed goal);
    event ContributionMade(bytes32 indexed campaignId, address indexed contributor, uint256 indexed amount);

    // Functions
    function createCampaign(string memory _name, address _recipient, uint256 _goal) external;
    function contribute(bytes32 _campaignId, uint256 _amount) external;
    function getCampaignDetails(bytes32 _campaignId) external view returns (string memory, address, uint256, uint256, bool);
    function getContributions(address _contributor) external view returns (Contribution[] memory);
}
