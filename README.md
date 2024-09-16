## Getting Started

1. **Clone the Repository**

To get started, first clone the repository to your local machine: ```git clone https://github.com/RottenKiwi/my_solution_qa.git```

2. **Navigate to the Project Directory**   

    ```cd my_solution_qa```

3. **Install Dependencies**

    ```npm install```

4. **Set Up Environment Variables**

Create a ```.env``` file in the project root directory and add the required configuration values. Refer to the ```.env.example``` file for the necessary environment variables and their format.



# Task 1: Automated Admin Login and Node Management

## Overview
This test script automates the process of logging into an admin dashboard, managing nodes, and handling incorrect node management scenarios. It includes several tests for different functionalities and error handling:

- **Successful Admin Login and Node Management**: Logs into the admin dashboard, manages existing nodes, creates a new node, and performs RPC method calls to validate endpoints.
- **Unsuccessful Node Management with Incorrect Site URL**: Simulates an error scenario by using an incorrect site URL for node management and checks the response from an RPC method call.
- **Incorrect Login Test**: Attempts to log in with incorrect credentials, verifies the presence of unauthorized error message.

## Key Features
- **Login Automation**: Handles the login process including dealing with cookies and retries if login fails.
- **Node Management**: Supports operations like deleting existing nodes and creating new ones.
- **Error Handling**: Includes handling for incorrect node endpoints and unauthorized login attempts.
- **Environment Configuration**: Uses environment variables for sensitive data and configurations.

## Usage
1. Before starting, manually login with the "remember me" option.
2. Set up your `.env` file with the required configuration values.
3. Modify the `testDir` in your Playwright configuration file `playwright.config.ts` to `task1_tests` for Task 1.
4. Run the tests using Playwright's test runner: ```npx playwright test```

# Task 2: Automated Admin Login and NFT Retrieval

## Overview
This test script automates the process of logging into an admin dashboard, revealing the API key, and fetching NFTs using the Moralis API. It includes tests for successful login, revealing the API key, and handling bad API requests:

- **Successful Admin Login, Fetch API Key, and Retrieve NFTs**: Logs into the admin dashboard, reveals the API key, and fetches NFTs using the API key with detailed logging.
- **Handle Bad Request for NFTs**: Simulates an error scenario by using an incorrect API URL and checks the response for proper error handling.

## Key Features
- **Login Automation**: Handles the login process, including dealing with cookies, retries, and simulating real user interactions.
- **API Key Retrieval**: Automates the process of revealing the API key from the dashboard.
- **NFT Retrieval**: Fetches NFTs using the Moralis API and logs request details and responses.
- **Error Handling**: Includes handling for incorrect API URLs and logging error responses.

## Usage
1. Before starting, manually login with the "remember me" option.
2. Set up your `.env` file with the required configuration values for login and API access.
3. Modify the `testDir` in your Playwright configuration file `playwright.config.ts` to `task2_tests` for Task 2.
4. Run the tests using Playwright's test runner: ```npx playwright test```

# k6 Performance Testing

## Overview
This set of performance tests uses k6 to evaluate the performance of various endpoints and methods related to the Moralis API. The tests cover the following:

- **Fetching NFTs**: Retrieves NFTs for a specified wallet address and checks the response.
- **Getting Block Number from Site 1 and Site 2**: Retrieves the current block number from two different endpoints.
- **Fetching Block Details and Transactions from Site 1 and Site 2**: Retrieves detailed block information and transaction data from two different endpoints.

## Key Features
- **Performance Testing**: Measures the performance of API endpoints under load.
- **Dynamic and Static Configuration**: Uses environment variables for configuration.
- **Detailed Logging**: Logs request details and responses for debugging.

## Usage
1. Set up your environment with the required configuration values inside ```load_test.js```.
3. Run the tests using k6: ```k6 run load_test.js```