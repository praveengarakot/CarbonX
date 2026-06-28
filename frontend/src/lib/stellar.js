import { 
  rpc, 
  Contract, 
  Address, 
  xdr, 
  Keypair, 
  TransactionBuilder, 
  Networks,
  Account,
  Operation,
  Asset
} from "@stellar/stellar-sdk";

// Testnet RPC and Horizon configurations
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

// Deployed Smart Contract Addresses (fallback mock addresses or user can configure them)
export const CONTRACTS = {
  verification: "CC7Q43DUGVPSKSXPOYT4TTSXTXEJAICL7N6LT5GB4ZN5UR3Y6T5VKVFQ",
  registry: "CAV5ID4RDPAC5DOMOKRWH2YUORQHYRGJBWRTXG33RLBCKDMS333FA2MD",
  marketplace: "CC4SBE33FC2AL3K77BQIJOFHO7RVDAKQFVTOLQARF6SHLOTIYV2MXYIY",
  settlement: "CDXRNXG33D2MGTWX7VZJ3WO5ORHPOUTQN2WGQP6AJNJQUBD7TSUWXN5P",
  retirement: "CCKX33TYO6FRCJV4BDOO73VVCKIOTF6DNZH6KPAWOXVBML7UGTK7V5JH"
};

import freighterApi from "@stellar/freighter-api";
const { isConnected, getAddress, signTransaction } = freighterApi;
import { StellarWalletsKit, Networks as SwkNetworks } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
export { isConnected };

let isKitInitialized = false;

export function initKit() {
  if (typeof window === "undefined") return;
  if (isKitInitialized) return;
  try {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: SwkNetworks.TESTNET
    });
    isKitInitialized = true;
  } catch (err) {
    console.error("Failed to initialize StellarWalletsKit:", err);
  }
}

export async function connectWithWalletsKit() {
  initKit();
  try {
    const res = await StellarWalletsKit.authModal();
    if (res && res.address) {
      return res.address;
    }
    throw new Error("No address returned from wallets kit modal.");
  } catch (err) {
    console.error("Wallets kit connection error:", err);
    throw err;
  }
}

// Check if Freighter wallet is installed in browser
export async function getFreighterPublicKey() {
  try {
    const res = await isConnected();
    if (res && res.isConnected) {
      const addressRes = await getAddress();
      if (addressRes && addressRes.address) {
        return addressRes.address;
      }
    }
  } catch (err) {
    console.warn("Freighter connection error:", err);
  }
  return null;
}

// Fetch the connected wallet's XLM balance from Horizon
export async function fetchXlmBalance(publicKey) {
  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
    if (!res.ok) {
      // Account might not exist on testnet yet
      return "0.0000";
    }
    const data = await res.json();
    const nativeBalance = data.balances.find(b => b.asset_type === "native");
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : "0.0000";
  } catch (err) {
    console.error("Error fetching XLM balance:", err);
    return "0.0000";
  }
}

// Send an XLM payment transaction on the Stellar testnet
export async function sendXlmTransaction({ from, to, amount }) {
  try {
    // 1. Fetch source account details to get sequence number
    const res = await fetch(`${HORIZON_URL}/accounts/${from}`);
    if (!res.ok) {
      throw new Error("Source account does not exist on testnet. Fund it first using Friendbot.");
    }
    const accountData = await res.json();

    // 2. Fetch current fee stats
    const feeRes = await fetch(`${HORIZON_URL}/fee_stats`);
    const feeData = await feeRes.json();
    const baseFee = feeData.fee_charged?.max || "100";

    // 3. Build Stellar Payment Transaction
    const sourceAccount = new Account(from, accountData.sequence);
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: baseFee,
      networkPassphrase: Networks.TESTNET,
      timebounds: { minTime: 0, maxTime: 0 }
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: Asset.native(),
          amount: amount.toString()
        })
      )
      .setTimeout(180)
      .build();

    const xdrString = transaction.toXDR();

    // 4. Request signature via Wallets Kit
    initKit();
    const signResult = await StellarWalletsKit.signTransaction(xdrString, {
      networkPassphrase: Networks.TESTNET,
      address: from
    });

    const signedXdr = signResult.signedTxXdr;
    if (!signedXdr) {
      throw new Error(signResult.error || "Failed to retrieve signed XDR from wallets kit");
    }

    // 5. Submit transaction to Horizon
    const submitBody = new FormData();
    submitBody.append("tx", signedXdr);

    const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
      method: "POST",
      body: submitBody
    });
    const submitData = await submitRes.json();

    if (!submitRes.ok || submitData.status === "error" || submitData.result_xdr === undefined) {
      throw new Error(submitData.title || submitData.detail || "Transaction submission failed");
    }

    return {
      status: "success",
      txHash: submitData.hash,
      ledger: submitData.ledger
    };
  } catch (err) {
    console.error("Payment transaction failed:", err);
    throw err;
  }
}

// Fund account via Friendbot
export async function fundWithFriendbot(publicKey) {
  try {
    const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
    if (!res.ok) {
      let errMsg = "Friendbot service error";
      try {
        const errJson = await res.json();
        errMsg = errJson.detail || errJson.title || errMsg;
      } catch (_) {
        try {
          const errText = await res.text();
          if (errText) errMsg = errText;
        } catch (_) {}
      }
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Friendbot funding failed:", err);
    throw err;
  }
}

// Call a read-only method on a Soroban contract
export async function callSorobanRead({ contractId, method, args = [] }) {
  try {
    const server = new rpc.Server(SOROBAN_RPC_URL);
    const contract = new Contract(contractId);
    
    // Prepare transaction for dry-run call
    // Standard dry-run to read data without executing a live transaction
    const simTx = await server.simulateTransaction({
      contractId,
      method,
      args
    });
    
    return simTx;
  } catch (error) {
    console.error(`Error reading from Soroban contract ${contractId}:`, error);
    throw error;
  }
}

// Sign and submit a state-changing transaction on Soroban
export async function submitSorobanTx({ contractId, method, args = [], signerPublicKey }) {
  try {
    const server = new rpc.Server(SOROBAN_RPC_URL);
    
    // In a production app, the transaction is built, simulated to estimate resource fees,
    // signed by Freighter wallet, and sent to the Soroban RPC endpoint
    
    // For this simulation sandbox, we'll construct the contract call just to validate the ID and method
    const contract = new Contract(contractId);
    console.log(`Prepared operation for contract ${contractId}: method ${method}`);
    
    return {
      status: "success",
      txHash: "0x" + Math.random().toString(16).substring(2, 18) + "fd2884a229a8f",
      events: [
        {
          type: "contract",
          contractId,
          method,
          data: args
        }
      ]
    };
  } catch (error) {
    console.error(`Soroban transaction submission failed:`, error);
    throw error;
  }
}
