pragma solidity ^0.8.0;

import "./TransactionContract.sol";

contract CrowdsourcingContract {
    // Mapping of crowdsourcing campaigns to their details
    mapping(bytes32 => Campaign) public campaigns;

    // Mapping of contributors to their contributions
    mapping(address => Contribution[]) public contributions;

    // Event emitted when a new campaign is created
    event CampaignCreated(bytes32 indexed campaignId, string indexed campaignName, address indexed recipient, uint256 indexed goal);

    // Event emitted when a contribution is made
    event ContributionMade(bytes32 indexed campaignId, address indexed contributor, uint256 indexed amount);

    // Struct to represent a campaign
    struct Campaign {
        string name;
        address recipient;
        uint256 goal;
        uint256 raised;
        bool completed;
    }

    // Struct to represent a contribution
    struct Contribution {
        bytes32 campaignId;
        uint256 amount;
    }

    // Function to create a new campaign
    function createCampaign(string memory _name, address _recipient, uint256 _goal) public {
        // Create a new campaign ID
        bytes32 campaignId = keccak256(abi.encodePacked(_name, _recipient, _goal));

        // Create a new campaign
        Campaign memory campaign = Campaign(_name, _recipient, _goal, 0, false);

        // Store the campaign
        campaigns[campaignId] = campaign;

        // Emit an event to notify that the campaign has been created
        emit CampaignCreated(campaignId, _name, _recipient, _goal);
    }

    // Function to contribute to a campaign
    function contribute(bytes32 _campaignId, uint256 _amount) public {
        // Check if the campaign exists
        require(campaigns[_campaignId].recipient != address(0), "Campaign does not exist");

        // Check if the contribution amount is valid
        require(_amount > 0, "Contribution amount must be greater than zero");

        // Create a new contribution
        Contribution memory contribution = Contribution(_campaignId, _amount);

        // Add the contribution to the contributor's list of contributions
        contributions[msg.sender].push(contribution);

        // Update the campaign's raised amount
        campaigns[_campaignId].raised += _amount;

        // Check if the campaign has reached its goal
        if (campaigns[_campaignId].raised >= campaigns[_campaignId].goal) {
            // Mark the campaign as completed
            campaigns[_campaignId].completed = true;
        }

        // Emit an event to notify that a contribution has been made
        emit ContributionMade(_campaignId, msg.sender, _amount);

        // Use the TransactionContract to handle the transaction
        TransactionContract transactionContract = TransactionContract(address(this));
        transactionContract.proposeTransaction(_campaignId, campaigns[_campaignId].recipient, _amount, "", 1);
    }

    // Function to get the details of a campaign
    function getCampaignDetails(bytes32 _campaignId) public view returns (string memory, address, uint256, uint256, bool) {
        // Check if the campaign exists
        require(campaigns[_campaignId].recipient != address(0), "Campaign does not exist");

        // Return the campaign details
        return (
            campaigns[_campaignId].name,
            campaigns[_campaignId].recipient,
            campaigns[_campaignId].goal,
            campaigns[_campaignId].raised,
            campaigns[_campaignId].completed
        );
    }

    // Function to get the contributions made by a contributor
    function getContributions(address _contributor) public view returns (Contribution[] memory) {
        // Return the contributor's contributions
        return contributions[_contributor];
    }
}