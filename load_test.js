import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Configuration from environment variables
const config = {
    apiUrl: 'https://deep-index.moralis.io/api/v2.2',
    walletAddress: '0xff3879b8a363aed92a6eaba8f61f1a96a9ec3c1e',
    apiKey: 'YOU API KEY',
    site1Endpoint: 'SetSite1EndPoint',
    site2Endpoint: 'SetSite2EndPoint',
};

// Function to execute RPC method
const executeRpcMethod = (endpoint, method, params = []) => {
    const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1
    });

    const response = http.post(endpoint, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.json();
};

// Test for Fetching NFTs
export function testFetchNFTs() {
    const nftUrl = `${config.apiUrl}/${config.walletAddress}/nft?chain=eth&format=decimal&media_items=false`;
    const nftResponse = http.get(nftUrl, {
        headers: {
            'X-API-Key': config.apiKey,
        },
    });

    check(nftResponse, {
        'nft fetch status is 200': (r) => r.status === 200,
        'nft fetch response contains data': (r) => r.body.length > 0,
    });

    console.log('NFT fetch response:', nftResponse.status, nftResponse.body);
    sleep(1);  // Shorter sleep for load testing
}

// Test for Getting Block Number from Site 1
export function testGetBlockNumberSite1() {
    const blockNumberData = executeRpcMethod(config.site1Endpoint, 'eth_blockNumber');

    check(blockNumberData, {
        'block number response has result': (r) => r.result !== undefined,
        'block number response status is 200': (r) => r.error === undefined,
    });

    const blockNumber = blockNumberData?.result;
    if (blockNumber) {
        console.log('Site 1 Block Number:', blockNumber);
    } else {
        console.log('Failed to get block number from Site 1.');
    }
    sleep(1);  // Shorter sleep for load testing
}

// Test for Fetching Block Details and Transaction from Site 1
export function testFetchBlockDetailsSite1() {
    const blockNumberData = executeRpcMethod(config.site1Endpoint, 'eth_blockNumber');

    check(blockNumberData, {
        'block number response has result': (r) => r.result !== undefined,
        'block number response status is 200': (r) => r.error === undefined,
    });

    const blockNumber = blockNumberData?.result;
    if (blockNumber) {
        const blockData = executeRpcMethod(config.site1Endpoint, 'eth_getBlockByNumber', [blockNumber, true]);

        check(blockData, {
            'block details response has result': (r) => r.result !== undefined,
            'block details response status is 200': (r) => r.error === undefined,
            'block details response contains transactions': (r) => r.result.transactions.length > 0,
        });

        if (blockData && blockData.result && blockData.result.transactions.length > 0) {
            const transactionHash = blockData.result.transactions[0].hash;
            console.log('Site 1 Transaction Hash:', transactionHash);

            const transactionData = executeRpcMethod(config.site1Endpoint, 'eth_getTransactionByHash', [transactionHash]);

            check(transactionData, {
                'transaction data response has result': (r) => r.result !== undefined,
                'transaction data response status is 200': (r) => r.error === undefined,
            });

            console.log('Site 1 Transaction Data:', transactionData);
        } else {
            console.log('No transactions found in the block for Site 1.');
        }
    } else {
        console.log('Failed to get block number from Site 1.');
    }
    sleep(1);  // Shorter sleep for load testing
}

// Test for Getting Block Number from Site 2
export function testGetBlockNumberSite2() {
    const blockNumberData = executeRpcMethod(config.site2Endpoint, 'eth_blockNumber');

    check(blockNumberData, {
        'block number response has result': (r) => r.result !== undefined,
        'block number response status is 200': (r) => r.error === undefined,
    });

    const blockNumber = blockNumberData?.result;
    if (blockNumber) {
        console.log('Site 2 Block Number:', blockNumber);
    } else {
        console.log('Failed to get block number from Site 2.');
    }
    sleep(1);  // Shorter sleep for load testing
}

// Test for Fetching Block Details and Transaction from Site 2
export function testFetchBlockDetailsSite2() {
    const blockNumberData = executeRpcMethod(config.site2Endpoint, 'eth_blockNumber');

    check(blockNumberData, {
        'block number response has result': (r) => r.result !== undefined,
        'block number response status is 200': (r) => r.error === undefined,
    });

    const blockNumber = blockNumberData?.result;
    if (blockNumber) {
        const blockData = executeRpcMethod(config.site2Endpoint, 'eth_getBlockByNumber', [blockNumber, true]);

        check(blockData, {
            'block details response has result': (r) => r.result !== undefined,
            'block details response status is 200': (r) => r.error === undefined,
            'block details response contains transactions': (r) => r.result.transactions.length > 0,
        });

        if (blockData && blockData.result && blockData.result.transactions.length > 0) {
            const transactionHash = blockData.result.transactions[0].hash;
            console.log('Site 2 Transaction Hash:', transactionHash);

            const transactionData = executeRpcMethod(config.site2Endpoint, 'eth_getTransactionByHash', [transactionHash]);

            check(transactionData, {
                'transaction data response has result': (r) => r.result !== undefined,
                'transaction data response status is 200': (r) => r.error === undefined,
            });

            console.log('Site 2 Transaction Data:', transactionData);
        } else {
            console.log('No transactions found in the block for Site 2.');
        }
    } else {
        console.log('Failed to get block number from Site 2.');
    }
    sleep(1);  // Shorter sleep for load testing
}

// Load Testing Configuration
export let options = {
    stages: [
        { duration: '1m', target: 10 }, // Ramp up to 10 VUs over 1 minutes
        { duration: '3m', target: 10 }, // Stay at 10 VUs for 3 minutes
        { duration: '1m', target: 0 },  // Ramp down to 0 VUs over 1 minutes
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

// Default function to run all tests
export default function () {
    group('Fetch NFTs', testFetchNFTs);
    group('Get Block Number Site 1', testGetBlockNumberSite1);
    group('Fetch Block Details Site 1', testFetchBlockDetailsSite1);
    group('Get Block Number Site 2', testGetBlockNumberSite2);
    group('Fetch Block Details Site 2', testFetchBlockDetailsSite2);
}
