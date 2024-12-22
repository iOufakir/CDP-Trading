import { Coinbase, Wallet, WalletData } from "@coinbase/coinbase-sdk";

Coinbase.configureFromJson({ filePath: "./config/local-coinbase.json" });

const SOURCE_WALLET_ADDRESS = "0xa252BB76cb9b98F6b19Fb93B3c2786762d5b7999";
const DESTINATION_WALLET_ADDRESS = "0xe6244E976bd87F8B6c1C54bfd65Eb3d6ca9E52dc";
const SOURCE_WALLET_SEED_FILE_NAME = "wallet_saved_seeds.json";

/**
 * This is a helper method that can be used anytime you need to create a new Wallet.
 * Creates a new Wallet and saves the seed to a local file.
 *
 * @returns The newly created Wallet.
 */
const createWallet = async () => {
  const wallet = await Wallet.create();
  wallet.saveSeedToFile(SOURCE_WALLET_SEED_FILE_NAME, false);
};

/**
 * Fund a wallet using a faucet request.
 * This method generates a faucet transaction to fund the given wallet.
 *
 * @param wallet - The wallet to be funded.
 */
const fundWalletUsingFaucet = async (wallet: Wallet): Promise<void> => {
  // Create a faucet request that returns you a Faucet transaction that can be used to track the tx hash.
  const faucetTransaction = await wallet.faucet();
  console.info(`Faucet transaction: ${faucetTransaction}`);
};

const findWalletByAddress = async (address: string): Promise<Wallet> => {
  // List all Wallets for the CDP Project.
  const walletsResponse = await Wallet.listWallets();
  console.info("Number of wallets found:", walletsResponse.data.length);

  for (const wallet of walletsResponse.data) {
    const walletAddress = await wallet.getDefaultAddress();
    if (walletAddress.getId() === address) {
      console.info("Wallet was successfully found:", walletAddress.getId());
      return wallet;
    }
  }

  throw new Error(`Wallet not found for the given address: ${address}`);
};

const loadWallet = async (wallet: Wallet): Promise<void> => {
  // re-instantiate a Wallet so it can be used to transfer funds, we must load the seed from the file.
  await wallet.loadSeedFromFile(SOURCE_WALLET_SEED_FILE_NAME);
};

const transferEthFunds = async (sourceWallet: Wallet, destinationWallet: Wallet) => {
  // Transfer ETH from the source wallet to the destination wallet.
  let transfer = await sourceWallet.createTransfer({
    amount: 0.00001,
    assetId: Coinbase.assets.Eth,
    destination: destinationWallet,
  });
  transfer = await transfer.wait();
  console.log(`Transfer successfully completed: ${transfer.getTransaction()?.getTransactionHash()}`);
};

const main = async () => {
  const sourceWallet: Wallet = await findWalletByAddress(SOURCE_WALLET_ADDRESS);
  await loadWallet(sourceWallet);
  const destinationWallet = await findWalletByAddress(DESTINATION_WALLET_ADDRESS);

  await transferEthFunds(sourceWallet, destinationWallet);
};

main();
