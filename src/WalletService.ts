import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

export default class WalletService {
  /**
   * Creates a new Wallet and saves the seed to a local file.
   *
   * @returns The newly created Wallet.
   */
  public async createWallet(seedFileName: string): Promise<void> {
    const wallet = await Wallet.create();
    wallet.saveSeedToFile(seedFileName, false);
  }

  /**
   * Fund a wallet using a faucet request.
   * This method generates a faucet transaction to fund the given wallet.
   *
   * @param wallet - The wallet to be funded.
   */
  public async fundWalletUsingFaucet(wallet: Wallet): Promise<void> {
    const faucetTransaction = await wallet.faucet();
    console.info(`Faucet transaction: ${faucetTransaction}`);
  }

  public async findWalletByAddress(address: string): Promise<Wallet> {
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
  }

  public async loadWallet(wallet: Wallet, seedFileName: string): Promise<void> {
    await wallet.loadSeedFromFile(seedFileName);
  }

  public async transferEthFunds(sourceWallet: Wallet, destinationWallet: Wallet): Promise<void> {
    let transfer = await sourceWallet.createTransfer({
      amount: 0.00001,
      assetId: Coinbase.assets.Eth,
      destination: destinationWallet,
    });
    transfer = await transfer.wait();
    console.log(`Transfer successfully completed: ${transfer.getTransaction()?.getTransactionHash()}`);
  }
}
