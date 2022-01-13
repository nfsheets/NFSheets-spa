require("dotenv").config();

module.exports = {
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
};
