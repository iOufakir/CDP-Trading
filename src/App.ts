import { Coinbase, Wallet, WalletData } from "@coinbase/coinbase-sdk";
import WalletService from "./WalletService.js";
import { DESTINATION_WALLET_ADDRESS, MY_WALLET_FILE_NAME, TARGET_WALLET_ADDRESS } from "./Constants.js";
import MyAgentService from "./MyAgentService.js";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config();
Coinbase.configureFromJson({ filePath: "./config/local-coinbase.json" });

const myWalletData: WalletData = JSON.parse(readFileSync(MY_WALLET_FILE_NAME, "utf8"));
const walletService = new WalletService();
const myAgentService = new MyAgentService();
myAgentService.startAgent(myWalletData);
//walletService.getLatestTransactions(TARGET_WALLET_ADDRESS)


// ************************************** Example of how to use the WalletService **************************************
const launchSimpleTransfer = async (): Promise<void> => {
  const sourceWallet = await walletService.loadWallet(myWalletData);
  const destinationWallet = await walletService.findWalletByAddress(DESTINATION_WALLET_ADDRESS);

  await walletService.transferEthFunds(sourceWallet, destinationWallet);
};
