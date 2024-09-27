// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract APIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    bytes32 private getSingleBytesjobId;
    bytes32 private getSingleStringjobId;
    bytes32 private getSingleUint256jobId;
    bytes32 private getMultiplUint256jobId;
    uint256 private fee;

    event RequestSingleBytes(bytes32 indexed requestId, bytes data);
    event RequestSingleString(bytes32 indexed requestId, string data);
    event RequestSingleUint256(bytes32 indexed requestId, uint256 data);
    event RequestMultipleUint256(bytes32 indexed requestId, uint256 a, uint256 b, uint256 c);

    /**
     * @notice Initialize the link token and target oracle
     * 设置link代币地址,预言机地址,Job ID,LINK费用
     */
    constructor(address _linkToken, address _oracle, bytes32 _jobId) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_linkToken);
        _setChainlinkOracle(_oracle);
        getSingleBytesjobId = _jobId;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    // uint类型单数据请求-示例
    function requestSingleUint256(string memory _url, string memory path, int times) public returns (bytes32 requestId) {
        Chainlink.Request memory req = _buildChainlinkRequest(
            getSingleUint256jobId,
            address(this),
            this.fulfillSingleUint256.selector
        );

        // 根据job请求参数要求add
        // Set the URL to perform the GET request on
        // 这里的get只是为了标记请求类型, 不是真正的http协议
        req._add(
            "get",
            _url
        );

        // job所需的参数示例
        // api:string: "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD"
        // path:string: "RAW,ETH,USD,VOLUME24HOUR"
        // times:int: 10 ** 18
        // Set the path to find the desired data in the API response, where the response format is:
        // {"RAW":
        //   {"ETH":
        //    {"USD":
        //     {
        //      "VOLUME24HOUR": xxx.xxx,
        //     }
        //    }
        //   }
        //  }
        // Chainlink nodes 1.0.0 and later support this format
        req._add("path", path);

        // Multiply the result by times to remove decimals
        req._addInt("times", times);

        // Sends the request
        return _sendChainlinkRequest(req, fee);
    }

    // 单uint256数据响应
    function fulfillSingleUint256(
        bytes32 _requestId,
        uint256 _data
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestSingleUint256(_requestId, _data);
        // 具体处理逻辑...
    }

    // bytes类型单数据请求
    function requestSingleBytes(string memory _url, string memory path) public returns (bytes32 requestId) {
        Chainlink.Request memory req = _buildChainlinkRequest(
            getSingleBytesjobId,
            address(this),
            this.fulfillSingleBytes.selector
        );

        // 根据job请求参数要求add

        // Sends the request
        return _sendChainlinkRequest(req, fee);
    }

    // 单bytes数据响应
    function fulfillSingleBytes(
        bytes32 _requestId,
        bytes memory _data
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestSingleBytes(_requestId, _data);
        // 具体处理逻辑...
    }

    // string类型单数据请求
    function requestSingleString(string memory _url, string memory path, int times) public returns (bytes32 requestId) {
        Chainlink.Request memory req = _buildChainlinkRequest(
            getSingleStringjobId,
            address(this),
            this.fulfillSingleString.selector
        );

        // 根据job请求参数要求add

        // Sends the request
        return _sendChainlinkRequest(req, fee);
    }

    // 单uint256数据响应
    function fulfillSingleString(
        bytes32 _requestId,
        string memory _data
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestSingleString(_requestId, _data);
        // 具体处理逻辑...
    }

    // 多数据请求
    function requestMultipleUint256() public {
        Chainlink.Request memory req = _buildChainlinkRequest(
            getMultiplUint256jobId,
            address(this),
            this.fulfillMultipleUint256.selector
        );

        // 根据job参数要求填充request
        /*req._add(
            "urlBTC",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC"
        );
        req._add("pathBTC", "BTC");
        req._add(
            "urlUSD",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
        );
        req._add("pathUSD", "USD");
        req._add(
            "urlEUR",
            "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR"
        );
        req._add("pathEUR", "EUR");*/
        _sendChainlinkRequest(req, fee);
    }

    // 多uint256数据响应
    function fulfillMultipleUint256(
        bytes32 requestId,
        uint256 aResponse,
        uint256 bResponse,
        uint256 cResponse
    ) public recordChainlinkFulfillment(requestId) {
        emit RequestMultipleUint256(
            requestId,
            aResponse,
            bResponse,
            cResponse
        );
        // 具体处理逻辑...
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
