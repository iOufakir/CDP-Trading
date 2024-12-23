import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import WalletService from "./WalletService.js";
import { DESTINATION_WALLET_ADDRESS, SOURCE_WALLET_ADDRESS, SOURCE_WALLET_SEED_FILE_NAME } from "./Constants.js";

Coinbase.configureFromJson({ filePath: "./config/local-coinbase.json" });

const main = async (): Promise<void> => {
  const walletService = new WalletService();
  const sourceWallet: Wallet = await walletService.findWalletByAddress(SOURCE_WALLET_ADDRESS);
  await walletService.loadWallet(sourceWallet, SOURCE_WALLET_SEED_FILE_NAME);
  const destinationWallet = await walletService.findWalletByAddress(DESTINATION_WALLET_ADDRESS);

  await walletService.transferEthFunds(sourceWallet, destinationWallet);
};

main();