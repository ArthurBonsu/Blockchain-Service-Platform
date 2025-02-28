pragma solidity ^0.8.0;

contract PortfolioContract {
    // Mapping of portfolios to their details
    mapping(address => Portfolio) public portfolios;

    // Event emitted when a new portfolio is created
    event PortfolioCreated(address indexed owner, string indexed portfolioName);

    // Event emitted when a token is added to a portfolio
    event TokenAdded(address indexed owner, string indexed token, uint256 amount);

    // Event emitted when a token is removed from a portfolio
    event TokenRemoved(address indexed owner, string indexed token, uint256 amount);

    // Struct to represent a portfolio
    struct Portfolio {
        string name;
        mapping(string => uint256) tokens;
    }

    // Function to create a new portfolio
    function createPortfolio(string memory _name) public {
        // Check if the portfolio already exists
        require(portfolios[msg.sender].name == "", "Portfolio already exists");

        // Create a new portfolio
        Portfolio memory portfolio = Portfolio(_name);

        // Store the portfolio
        portfolios[msg.sender] = portfolio;

        // Emit an event to notify that the portfolio has been created
        emit PortfolioCreated(msg.sender, _name);
    }

    // Function to add a token to a portfolio
    function addToken(string memory _token, uint256 _amount) public {
        // Check if the portfolio exists
        require(portfolios[msg.sender].name != "", "Portfolio does not exist");

        // Add the token to the portfolio
        portfolios[msg.sender].tokens[_token] += _amount;

        // Emit an event to notify that the token has been added
        emit TokenAdded(msg.sender, _token, _amount);
    }

    // Function to remove a token from a portfolio
    function removeToken(string memory _token, uint256 _amount) public {
        // Check if the portfolio exists
        require(portfolios[msg.sender].name != "", "Portfolio does not exist");

        // Check if the token exists in the portfolio
        require(portfolios[msg.sender].tokens[_token] >= _amount, "Token does not exist in portfolio");

        // Remove the token from the portfolio
        portfolios[msg.sender].tokens[_token] -= _amount;

        // Emit an event to notify that the token has been removed
        emit TokenRemoved(msg.sender, _token, _amount);
    }

    // Function to get the details of a portfolio
    function getPortfolioDetails() public view returns (string memory, mapping(string => uint256)) {
        // Check if the portfolio exists
        require(portfolios[msg.sender].name != "", "Portfolio does not exist");

        // Return the portfolio details
        return (portfolios[msg.sender].name, portfolios[msg.sender].tokens);
    }
}