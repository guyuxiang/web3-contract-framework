// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {FeedRegistryInterface} from "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import {Denominations} from "@chainlink/contracts/src/v0.8/Denominations.sol";

contract DataConsumerV3 {
    AggregatorV3Interface internal dataFeed;
    FeedRegistryInterface internal registry;

    // 初始化配置聚合器代理合约
    constructor(address _registry, address _feed) {
        registry = FeedRegistryInterface(_registry);
        dataFeed = AggregatorV3Interface(_feed);
    }

    /**
     * Returns the ETH / USD price
     */
    function getEthUsdPrice() public view returns (int) {
        // prettier-ignore
        (
        /*uint80 roundID*/,
            int price,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = registry.latestRoundData(Denominations.ETH, Denominations.USD);
        return price;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
        /* uint80 roundID */,
            int answer,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    // 储备金证明
}
