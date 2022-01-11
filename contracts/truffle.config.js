require("dotenv").config();

module.exports = {
  networks: {
    harmony: {
      url: process.env.HARMONY_RPC_ENDPOINT,
      network_id: 1666600000,
    },
    harmony_testnet: {
      url: process.env.HARMONY_TESTNET_RPC_ENDPOINT,
      network_id: 1666700000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.7",
      settings: {
        optimizer: {
          enabled: false,
        },
      },
    },
  },
  contracts_directory: "./src",
  contracts_build_directory: "../generated",
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    polygonscan: process.env.POLYGONSCAN_API_KEY,
  },
};
