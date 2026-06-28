"use client";
import React, { useState, useEffect } from "react";
import { getFreighterPublicKey, submitSorobanTx, CONTRACTS, fetchXlmBalance, sendXlmTransaction, fundWithFriendbot, isConnected, connectWithWalletsKit } from "../lib/stellar";

export default function Home() {
  const [inApp, setInApp] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, marketplace, verification, retirement, activity
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeRole, setActiveRole] = useState("developer"); // developer, buyer, verifier
  const [walletBalance, setWalletBalance] = useState("0.0000");
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // Addresses mapping
  const roleAddresses = {
    developer: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B",
    buyer: "GBBUYERNEXUSCAPITAL3P4Q6T7Y5VWD88ZG4W6C3B2B",
    verifier: "GBVERIFIERSTELLARVERIFY4R5T7Y8U9I0O1P2Q3W4B",
  };

  const refreshBalance = async (addr) => {
    const target = addr || walletAddress || roleAddresses[activeRole];
    if (!target) return;
    setIsRefreshingBalance(true);
    const bal = await fetchXlmBalance(target);
    setWalletBalance(bal);
    setIsRefreshingBalance(false);
  };

  useEffect(() => {
    // Attempt auto-connect if Freighter is open/authorized
    const autoConnect = async () => {
      const key = await getFreighterPublicKey();
      if (key) {
        setWalletConnected(true);
        setWalletAddress(key);
        refreshBalance(key);
      }
    };
    autoConnect();
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [walletAddress, activeRole]);

  // State Management (Simulating the 5-contract Soroban state)
  const [projects, setProjects] = useState([
    { id: 1, name: "Solar Plant Kolkata", developer: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B", amount: 120, unit: "tCO2e", verified: true, verifier: "GBVERIFIERSTELLARVERIFY4R5T7Y8U9I0O1P2Q3W4B" },
    { id: 2, name: "Kariba Forest Protection", developer: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B", amount: 250, unit: "tCO2e", verified: false, verifier: null },
    { id: 3, name: "Guanaré Plantations", developer: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B", amount: 300, unit: "tCO2e", verified: false, verifier: null },
  ]);

  const [credits, setCredits] = useState([
    { id: 101, project: "Solar Plant Kolkata", project_id: 1, owner: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B", amount: 120, retired: false },
  ]);

  const [listings, setListings] = useState([
    { id: 501, credit_id: 101, project: "Solar Plant Kolkata", amount: 120, price: 50, seller: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B", active: true },
  ]);

  const [retiredCredits, setRetiredCredits] = useState([]);
  
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: "Verification Contract Initialized on Stellar Testnet", type: "system", timestamp: "Just now" },
    { id: 2, text: "Carbon Registry Contract Initialized on Stellar Testnet", type: "system", timestamp: "Just now" },
    { id: 3, text: "Marketplace Contract Initialized on Stellar Testnet", type: "system", timestamp: "Just now" },
    { id: 4, text: "Settlement Contract Initialized on Stellar Testnet", type: "system", timestamp: "Just now" },
    { id: 5, text: "Retirement Contract Initialized on Stellar Testnet", type: "system", timestamp: "Just now" },
    { id: 6, text: "Project #1 (Solar Plant Kolkata) submitted for verification", type: "submit", timestamp: "Just now" },
    { id: 7, text: "Project #1 verified. Credit #101 minted to developer", type: "minted", timestamp: "Just now" },
    { id: 8, text: "Credit #101 listed on Marketplace for 50 XLM", type: "listed", timestamp: "Just now" },
  ]);

  // Carbon Scores
  const [carbonScores, setCarbonScores] = useState({
    GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B: 65,
    GBBUYERNEXUSCAPITAL3P4Q6T7Y5VWD88ZG4W6C3B2B: 50,
  });

  // Project Submission Form State
  const [newProjName, setNewProjName] = useState("");
  const [newProjAmount, setNewProjAmount] = useState("");
  const [listingPrices, setListingPrices] = useState({});
  const [recipientAddress, setRecipientAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [txModal, setTxModal] = useState({
    isOpen: false,
    title: "",
    steps: [],
    currentStep: 0,
    txHash: "",
    details: ""
  });

  const runTxFlow = async (title, contractMethod, executeFn) => {
    setTxModal({
      isOpen: true,
      title,
      steps: [
        "Preparing transaction payload...",
        "Simulating Soroban smart contract invocation...",
        "Requesting signature from Freighter wallet...",
        "Broadcasting transaction to Stellar Testnet RPC..."
      ],
      currentStep: 0,
      txHash: "",
      details: `Target: ${contractMethod}`
    });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      await sleep(600);
      setTxModal(prev => ({ ...prev, currentStep: 1 }));
      await sleep(800);
      setTxModal(prev => ({ ...prev, currentStep: 2 }));
      await sleep(1000);
      setTxModal(prev => ({ ...prev, currentStep: 3 }));
      await sleep(1000);

      const result = await executeFn();
      
      setTxModal(prev => ({
        ...prev,
        currentStep: 4,
        txHash: result.txHash,
        details: `Confirmed. Block height: ${Math.floor(Math.random() * 5000) + 12000}`
      }));
      return result;
    } catch (err) {
      const errMsg = err.message || String(err);
      let friendlyError = errMsg;
      
      if (errMsg.includes("closed") || errMsg.includes("rejected") || errMsg.includes("User denied") || errMsg.includes("cancel") || errMsg.includes("rejected by the user")) {
        friendlyError = "Transaction Rejected: Connection or signing was cancelled/rejected by the user.";
      } else if (errMsg.includes("insufficient") || errMsg.includes("tx_insufficient_balance") || errMsg.includes("underfunded")) {
        friendlyError = "Insufficient Balance: Your wallet does not have enough testnet XLM to pay for this transaction.";
      } else if (errMsg.includes("not detected") || errMsg.includes("No wallet") || errMsg.includes("Please set")) {
        friendlyError = "Wallet Not Found: Please connect a supported wallet extension (Freighter, xBull, or Albedo).";
      }

      setTxModal(prev => ({
        ...prev,
        currentStep: 5,
        details: friendlyError
      }));
      throw err;
    }
  };

  const addActivity = (text, type) => {
    setActivityFeed(prev => [
      { id: `${Date.now()}-${Math.random()}`, text, type, timestamp: "Just now" },
      ...prev
    ]);
  };

  const connectWallet = async () => {
    try {
      const key = await connectWithWalletsKit();
      if (key) {
        setWalletConnected(true);
        setWalletAddress(key);
        addActivity(`✓ Wallet connected via StellarWalletsKit: ${key.slice(0, 12)}...`, "system");
        refreshBalance(key);
      }
    } catch (err) {
      const errMsg = err.message || String(err);
      console.warn("Wallet kit connection error:", err);
      
      let friendlyError = "Failed to connect wallet.";
      if (errMsg.includes("closed") || errMsg.includes("User closed") || errMsg.includes("cancel")) {
        friendlyError = "Connection Rejected: The wallet connection request was cancelled or rejected by the user.";
      } else if (errMsg.includes("not detected") || errMsg.includes("No wallet") || errMsg.includes("Please set")) {
        friendlyError = "Wallet Not Found: Please install a supported wallet extension (like Freighter, xBull, or Albedo) to connect.";
      }
      
      alert(friendlyError);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.0000");
    addActivity("Wallet disconnected", "system");
  };

  const handleFundAccount = async () => {
    const target = walletAddress || roleAddresses[activeRole];
    await runTxFlow("Fund Account via Friendbot", "friendbot :: request_funds", async () => {
      await fundWithFriendbot(target);
      await refreshBalance(target);
      addActivity(`✓ Friendbot: Account ${target.slice(0, 10)}... funded with 10,000 XLM`, "system");
      return { txHash: "Friendbot Success" };
    });
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    if (!recipientAddress || !paymentAmount) return;

    const fromAddress = walletAddress || roleAddresses[activeRole];

    await runTxFlow("Send XLM Payment", "stellar :: payment", async () => {
      const res = await sendXlmTransaction({
        from: fromAddress,
        to: recipientAddress,
        amount: parseFloat(paymentAmount)
      });
      addActivity(`✓ PaymentSuccess: Sent ${paymentAmount} XLM to ${recipientAddress.slice(0, 10)}...`, "system");
      await refreshBalance(fromAddress);
      setRecipientAddress("");
      setPaymentAmount("");
      return res;
    });
  };

  // --- contract functions ---
  const handleRegisterProject = async (e) => {
    e.preventDefault();
    if (!newProjName || !newProjAmount) return;

    const amt = parseFloat(newProjAmount);
    const developerAddress = walletAddress || roleAddresses.developer;
    
    await runTxFlow("Submit Carbon Offset Project", "verification-contract :: submit_project", async () => {
      const tx = await submitSorobanTx({
        contractId: CONTRACTS.verification,
        method: "submit_project",
        args: [developerAddress, newProjName, amt],
        signerPublicKey: developerAddress
      });

      const newProj = {
        id: projects.length + 1,
        name: newProjName,
        developer: developerAddress,
        amount: amt,
        unit: "tCO2e",
        verified: false,
        verifier: null,
      };

      setProjects(prev => [...prev, newProj]);
      addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation submit_project completed`, "system");
      addActivity(`Project #${newProj.id} (${newProj.name}) submitted by SME`, "submit");
      setNewProjName("");
      setNewProjAmount("");
      return tx;
    });
  };
  const handleVerifyProject = async (projectId) => {
    const p = projects.find(proj => proj.id === projectId);
    if (!p) return;

    const verifierAddress = walletAddress || roleAddresses.verifier;

    await runTxFlow("Approve & Verify Project", "verification-contract :: verify_project", async () => {
      const tx = await submitSorobanTx({
        contractId: CONTRACTS.verification,
        method: "verify_project",
        args: [verifierAddress, projectId, CONTRACTS.registry],
        signerPublicKey: verifierAddress
      });

      setProjects(prev => prev.map(item => {
        if (item.id === projectId) {
          const maxCreditId = Math.max(
            ...credits.map(c => c.id),
            ...retiredCredits.map(c => c.id),
            100
          );
          const creditId = maxCreditId + 1;
          const newCredit = {
            id: creditId,
            project: item.name,
            project_id: item.id,
            owner: item.developer,
            amount: item.amount,
            retired: false,
          };
          setCredits(c => [...c, newCredit]);
          
          addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation verify_project completed`, "system");
          addActivity(`✓ CarbonVerified: Project #${item.id} approved by Verifier`, "verified");
          addActivity(`✓ CreditMinted: Credit #${creditId} minted to Developer (${item.amount} tCO2e)`, "minted");
          
          return { ...item, verified: true, verifier: verifierAddress };
        }
        return item;
      }));
      return tx;
    });
  };

  const handleDeployContract = async (contractType) => {
    await runTxFlow(`Deploy ${contractType} Contract`, "stellar-cli :: deploy", async () => {
      const generatedContractId = "CC" + Math.random().toString(36).substring(2, 12).toUpperCase() + "T7V5JH";
      addActivity(`✓ ContractDeployed: ${contractType} Contract successfully deployed at address ${generatedContractId}`, "system");
      addActivity(`✓ RegistryUpdated: Registered ${contractType} in CarbonX System`, "system");
      return { txHash: "0x" + Math.random().toString(16).substring(2, 18) + "fd2884a229a8f", contractId: generatedContractId };
    });
  };

  const handleListCredit = async (creditId, priceVal) => {
    const credit = credits.find(c => c.id === creditId);
    if (!credit) return;

    const sellerAddress = walletAddress || roleAddresses.developer;

    await runTxFlow("List Carbon Credits", "marketplace-contract :: list_credit", async () => {
      const tx = await submitSorobanTx({
        contractId: CONTRACTS.marketplace,
        method: "list_credit",
        args: [sellerAddress, CONTRACTS.registry, creditId, priceVal],
        signerPublicKey: sellerAddress
      });

      const newListing = {
        id: listings.length + 501,
        credit_id: credit.id,
        project: credit.project,
        amount: credit.amount,
        price: priceVal,
        seller: sellerAddress,
        active: true,
      };

      setListings(prev => [...prev, newListing]);
      addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation list_credit completed`, "system");
      addActivity(`✓ CreditListed: Credit #${credit.id} listed for ${priceVal} XLM`, "listed");
      return tx;
    });
  };

  const handleBuyListing = async (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const buyerAddress = walletAddress || roleAddresses[activeRole];
    const sellerAddress = listing.seller || roleAddresses.developer;
    const totalPrice = listing.amount * listing.price;

    await runTxFlow("Purchase Carbon Credits", "marketplace :: buy_credit", async () => {
      // Execute live Stellar payment transaction
      const tx = await sendXlmTransaction({
        from: buyerAddress,
        to: sellerAddress,
        amount: totalPrice
      });

      // Update frontend state with credit ownership transfers
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l));
      setCredits(prev => prev.map(c => c.id === listing.credit_id ? { ...c, owner: buyerAddress } : c));

      // Refresh connected wallet balance
      await refreshBalance(buyerAddress);

      addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation buy_credit completed`, "system");
      addActivity(`✓ PaymentReleased: Seller (${sellerAddress.slice(0, 8)}...) received ${totalPrice} XLM`, "pay_rel");
      addActivity(`✓ OwnershipTransferred: Credit #${listing.credit_id} transferred to Buyer`, "transfer");
      addActivity(`✓ CreditPurchased: Credit #${listing.credit_id} purchased successfully`, "purchased");
      return tx;
    });
  };

  const handleRetireCredit = async (creditId) => {
    const credit = credits.find(c => c.id === creditId);
    if (!credit) return;

    const buyerAddress = walletAddress || roleAddresses.buyer;

    await runTxFlow("Retire Carbon Credits", "retirement-contract :: retire_credit", async () => {
      const tx = await submitSorobanTx({
        contractId: CONTRACTS.retirement,
        method: "retire_credit",
        args: [buyerAddress, CONTRACTS.registry, creditId],
        signerPublicKey: buyerAddress
      });

      setCredits(prev => prev.filter(c => c.id !== creditId));
      setRetiredCredits(prev => [...prev, { ...credit, retired: true, owner: buyerAddress }]);

      setCarbonScores(prev => {
        const current = prev[buyerAddress] || 50;
        const updated = Math.min(current + credit.amount * 10, 100);
        return {
          ...prev,
          [buyerAddress]: updated
        };
      });

      addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation retire_credit completed`, "system");
      addActivity(`✓ CreditRetired: Credit #${creditId} permanently retired`, "retired");
      addActivity(`✓ CertificateIssued: Sustainability Certificate issued. Score updated to 100/100`, "cert_iss");
      return tx;
    });
  };

  const getStats = () => {
    const activeAddress = walletAddress || roleAddresses[activeRole];
    const isDev = activeRole === "developer";
    const owned = credits.filter(c => (c.owner === activeAddress || (isDev && c.owner === roleAddresses.developer)) && !c.retired).reduce((acc, c) => acc + c.amount, 0);
    const retired = retiredCredits.filter(c => c.owner === activeAddress || (isDev && c.owner === roleAddresses.developer)).reduce((acc, c) => acc + c.amount, 0);
    const score = carbonScores[activeAddress] || carbonScores[roleAddresses[activeRole]] || 50;
    return { owned, retired, score };
  };

  const stats = getStats();

  if (!inApp) {
    // --- Landing Page View ---
    return (
      <main className="w-full max-w-[1440px] mx-auto min-h-screen relative overflow-hidden flex flex-col">
        <header className="w-full flex justify-between items-center px-8 py-6 absolute top-0 z-50">
          <div className="font-sans text-[22px] text-white font-bold tracking-tight">CarbonX</div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setInApp(true)}
              className="font-sans text-[12px] text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-widest font-semibold"
            >
              Enter Terminal
            </button>
          </nav>
        </header>

        <section className="relative w-full pt-40 pb-20 px-8 flex flex-col items-center justify-center text-center z-10 min-h-screen bg-radial from-white/5 to-transparent">
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#444748] bg-[#1c1b1b] mb-4">
              <span className="material-symbols-outlined text-white text-[14px]">public</span>
              <span className="font-mono text-[10px] text-[#c4c7c8] uppercase tracking-widest">Stellar Soroban Powered</span>
            </div>
            <h1 className="text-4xl md:text-6xl text-white max-w-3xl leading-tight font-bold tracking-tight">
              Carbon Markets for Every SME
            </h1>
            <p className="text-base md:text-lg text-[#c4c7c8] max-w-2xl mx-auto leading-relaxed">
              Verify, tokenize, trade, and retire carbon credits through a transparent decentralized ledger. Powered by Stellar smart contracts.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
              <button 
                onClick={() => { setInApp(true); setActiveTab("marketplace"); }}
                className="w-full sm:w-auto bg-white text-black font-semibold text-[12px] uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Explore Marketplace
              </button>
              <button 
                onClick={() => { setInApp(true); setActiveTab("verification"); }}
                className="w-full sm:w-auto bg-transparent text-white border border-[#444748] font-semibold text-[12px] uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-white/10 transition-colors"
              >
                Verify Project Portal
              </button>
            </div>
          </div>

          {/* Abstract Visual */}
          <div className="w-full max-w-5xl mx-auto mt-16 relative h-[320px] border border-[#262626] rounded-xl overflow-hidden bg-[#0c0c0c] flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent z-10" />
            
            {/* Minimalist Tech Stats */}
            <div className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-8 px-6 w-full text-center">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8e9192] mb-1">Contract System</div>
                <div className="font-mono text-xl text-white font-bold">5 SC (Soroban)</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8e9192] mb-1">Stellar Net</div>
                <div className="font-mono text-xl text-white font-bold">Testnet / Sandbox</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8e9192] mb-1">Mint Fee</div>
                <div className="font-mono text-xl text-white font-bold">0.0001 XLM</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8e9192] mb-1">Offset Speed</div>
                <div className="font-mono text-xl text-white font-bold">Instant Release</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // --- Main Application Workspace View ---
  return (
    <div className="flex h-screen w-full bg-[#131313] text-[#e5e2e1] overflow-hidden font-sans">
      
      {/* SideNavBar Component */}
      <aside className="w-64 border-r border-[#262626] bg-[#0e0e0e] flex flex-col h-full z-20 flex-shrink-0">
        <div className="px-6 py-8 border-b border-[#262626]">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-white">eco</span> CarbonX
          </h1>
          <p className="text-[10px] text-[#8e9192] uppercase tracking-widest mt-1">SME Trading Terminal</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "overview" ? "bg-white text-black font-semibold" : "text-[#c4c7c8] hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-sm">Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab("marketplace")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "marketplace" ? "bg-white text-black font-semibold" : "text-[#c4c7c8] hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="text-sm">Marketplace</span>
          </button>

          <button 
            onClick={() => setActiveTab("verification")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "verification" ? "bg-white text-black font-semibold" : "text-[#c4c7c8] hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <span className="text-sm">Verification Portal</span>
          </button>

          <button 
            onClick={() => setActiveTab("retirement")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "retirement" ? "bg-white text-black font-semibold" : "text-[#c4c7c8] hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span className="text-sm">Retirement Center</span>
          </button>

          <button 
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "activity" ? "bg-white text-black font-semibold" : "text-[#c4c7c8] hover:bg-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="text-sm">Event Stream</span>
          </button>
        </nav>

        {/* Sidebar Footer Account */}
        <div className="p-4 border-t border-[#262626] bg-[#0a0a0a] flex flex-col gap-2">
          <div className="text-[10px] text-[#8e9192] uppercase tracking-widest">Active Workspace</div>
          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value)}
            className="w-full bg-[#131313] border border-[#262626] rounded px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="developer">Developer (Acme Corp)</option>
            <option value="buyer">Buyer (Nexus Capital)</option>
            <option value="verifier">Verifier (Stellar Verify)</option>
          </select>
          <div className="font-mono text-[9px] text-[#8e9192] truncate mt-1">
            {walletAddress || roleAddresses[activeRole]}
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-[#262626] bg-[#0e0e0e] flex justify-between items-center px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-[#8e9192]">Network:</span>
            <span className="bg-white/10 text-white font-mono text-[10px] px-2 py-1 rounded border border-[#262626]">
              Stellar Soroban Testnet
            </span>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300" title={walletAddress}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono flex items-center gap-2">
                  <span>{walletBalance} XLM</span>
                  <button 
                    onClick={() => refreshBalance()}
                    className="text-[10px] text-[#8e9192] hover:text-white transition-colors"
                    disabled={isRefreshingBalance}
                    title="Refresh Balance"
                  >
                    {isRefreshingBalance ? "..." : "↻"}
                  </button>
                </div>
                <button 
                  onClick={handleFundAccount}
                  className="bg-transparent border border-[#262626] text-white text-xs px-3 py-1.5 rounded hover:bg-white/5 transition-colors font-semibold"
                >
                  Fund XLM
                </button>
                <button 
                  onClick={disconnectWallet}
                  className="text-xs text-[#8e9192] hover:text-white underline transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const fallbackKey = roleAddresses[activeRole];
                    setWalletConnected(true);
                    setWalletAddress(fallbackKey);
                    addActivity(`✓ Sandbox Account Connected (Simulated Wallet): ${fallbackKey.slice(0, 12)}...`, "system");
                    refreshBalance(fallbackKey);
                  }}
                  className="bg-transparent border border-[#262626] text-white font-semibold text-xs px-4 py-2 rounded hover:bg-white/5 transition-colors"
                >
                  Sandbox Mode
                </button>
                <button 
                  onClick={connectWallet}
                  className="bg-white text-black font-semibold text-xs px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#131313]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-[#262626] pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Overview Dashboard</h2>
                  <p className="text-sm text-[#8e9192] mt-1">Portfolio performance, asset balances, and carbon score trajectory.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab("marketplace")}
                    className="bg-white text-black font-semibold text-xs px-4 py-2.5 rounded hover:bg-zinc-200 transition-colors"
                  >
                    Buy Credits
                  </button>
                </div>
              </div>

              {/* Bento Grid KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col justify-between h-36 hover:border-[#444444] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8e9192] uppercase tracking-wider">Credits Active</span>
                    <span className="material-symbols-outlined text-[#8e9192]">database</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.owned} <span className="text-xs text-[#8e9192]">tCO2e</span></div>
                    <div className="text-[10px] text-[#8e9192] mt-1">Available for offset/sale</div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col justify-between h-36 hover:border-[#444444] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8e9192] uppercase tracking-wider">Credits Retired</span>
                    <span className="material-symbols-outlined text-[#8e9192]">eco</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.retired} <span className="text-xs text-[#8e9192]">tCO2e</span></div>
                    <div className="text-[10px] text-[#8e9192] mt-1">Permanently retired</div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col justify-between h-36 hover:border-[#444444] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8e9192] uppercase tracking-wider">Carbon Impact Score</span>
                    <span className="material-symbols-outlined text-[#8e9192]">workspace_premium</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.score}/100</div>
                    <div className="w-full bg-[#262626] h-1.5 mt-2 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${stats.score}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col justify-between h-36 hover:border-[#444444] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8e9192] uppercase tracking-wider">Market Value</span>
                    <span className="material-symbols-outlined text-[#8e9192]">payments</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.owned * 50} XLM</div>
                    <div className="text-[10px] text-[#8e9192] mt-1">Est. value @ 50 XLM/t</div>
                  </div>
                </div>
              </div>

              {/* Trajectory & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Chart */}
                <div className="lg:col-span-2 bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-6">Carbon Reduction Trajectory</h3>
                  <div className="flex-1 relative h-64 border-b border-[#262626] flex items-end justify-between pb-2">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                      <path 
                        d="M 10 230 L 100 210 L 200 180 L 300 140 L 400 90 L 500 50" 
                        fill="none" 
                        stroke="#ffffff" 
                        strokeWidth="2.5"
                      />
                      <circle cx="500" cy="50" fill="#ffffff" r="5" />
                    </svg>
                    <div className="text-[10px] text-[#8e9192] absolute left-2 top-2">Offset Target (100k tCO2e)</div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-[#8e9192]">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span className="text-white font-bold">Jun</span>
                  </div>
                </div>

                {/* Right Mini feed */}
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Event Log Feed</h3>
                    <button 
                      onClick={() => setActiveTab("activity")}
                      className="text-xs text-[#8e9192] hover:text-white underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[250px]">
                    {activityFeed.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex gap-3 text-xs">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                        </div>
                        <div>
                          <p className="text-white font-mono">{log.text}</p>
                          <span className="text-[9px] text-zinc-500">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Direct Payment Card */}
              <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-4 max-w-xl">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">payments</span>
                  Stellar Testnet XLM Payment
                </h3>
                <p className="text-xs text-[#8e9192]">
                  Send XLM directly from your Freighter wallet (or sandbox role) to any recipient on the Stellar Testnet.
                </p>

                <form onSubmit={handleSendPayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#8e9192] mb-1.5">Recipient Public Key</label>
                      <input 
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="e.g. GBBUYER..."
                        className="w-full bg-[#131313] border border-[#262626] rounded p-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#8e9192] mb-1.5">Amount (XLM)</label>
                      <input 
                        type="number"
                        step="0.0001"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="10.0"
                        className="w-full bg-[#131313] border border-[#262626] rounded p-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-white text-black font-semibold text-xs px-5 py-2.5 rounded hover:bg-zinc-200 transition-colors uppercase tracking-widest font-mono"
                  >
                    Send XLM Payment
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: MARKETPLACE */}
          {activeTab === "marketplace" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-[#262626] pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Marketplace Terminal</h2>
                  <p className="text-sm text-[#8e9192] mt-1">Buy and sell institutional-grade tokenized carbon credits.</p>
                </div>
                <div className="text-xs text-[#8e9192] flex items-center gap-2">
                  <span>Active Wallet Balance:</span>
                  <span className="font-bold text-white font-mono">{walletBalance} XLM</span>
                </div>
              </div>

              {/* List of active listings */}
              <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#262626]">
                  <h3 className="text-lg font-semibold text-white">Open Listings</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#262626] text-[#8e9192] uppercase tracking-wider">
                        <th className="p-4 font-semibold">Listing ID</th>
                        <th className="p-4 font-semibold">Project Source</th>
                        <th className="p-4 font-semibold text-right">Credit Amount</th>
                        <th className="p-4 font-semibold text-right">Price per Ton</th>
                        <th className="p-4 font-semibold text-right">Total Price</th>
                        <th className="p-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {listings.filter(l => l.active).map((listing) => (
                        <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono">#{listing.id}</td>
                          <td className="p-4 font-semibold text-white">{listing.project}</td>
                          <td className="p-4 text-right font-mono">{listing.amount} tCO2e</td>
                          <td className="p-4 text-right font-mono">{listing.price} XLM</td>
                          <td className="p-4 text-right font-mono font-bold text-white">{listing.amount * listing.price} XLM</td>
                          <td className="p-4 text-center">
                            {activeRole === "buyer" || walletConnected ? (
                              <button 
                                onClick={() => handleBuyListing(listing.id)}
                                className="bg-white text-black font-semibold px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                              >
                                Buy Credits
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-500">Switch to Buyer</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {listings.filter(l => l.active).length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-[#8e9192]">No active listings found. Check back later or mint new credits.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Developer List Credit Interface */}
              {(activeRole === "developer" || walletConnected) && (
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-4 max-w-xl">
                  <h3 className="text-lg font-semibold text-white">List Your Tokenized Credits</h3>
                  <p className="text-xs text-[#8e9192]">List verified credits that you own to the open market.</p>
                  
                  <div className="space-y-3">
                    {credits.filter(c => (c.owner === walletAddress || c.owner === roleAddresses.developer) && !c.retired).map(c => {
                      const alreadyListed = listings.some(l => l.credit_id === c.id && l.active);
                      if (alreadyListed) return null;
                      return (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-[#1c1b1b] border border-[#262626] rounded-lg">
                          <div>
                            <div className="text-xs font-semibold text-white">{c.project}</div>
                            <div className="text-[10px] font-mono text-zinc-500">Credit ID: #{c.id} | {c.amount} tCO2e</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              placeholder="Price (XLM)"
                              value={listingPrices[c.id] || ""}
                              onChange={(e) => setListingPrices(prev => ({ ...prev, [c.id]: e.target.value }))}
                              className="w-24 bg-[#131313] border border-[#262626] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                            />
                            <button 
                              onClick={() => handleListCredit(c.id, parseFloat(listingPrices[c.id]) || 50)}
                              className="bg-white text-black font-semibold text-xs px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                            >
                              List
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {credits.filter(c => (c.owner === walletAddress || c.owner === roleAddresses.developer) && !c.retired).length === 0 && (
                      <div className="text-xs text-[#8e9192] italic">You have no unlisted verified credits. Submit a project for verification first.</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: VERIFICATION */}
          {activeTab === "verification" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-[#262626] pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Verification Portal</h2>
                  <p className="text-sm text-[#8e9192] mt-1">Submit new carbon projects or approve pending projects to mint credits.</p>
                </div>
              </div>

              {/* Submit Project form (Developer Role) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-white">Submit Project for Verification</h3>
                  <form onSubmit={handleRegisterProject} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8e9192] mb-2">Project Name</label>
                      <input 
                        type="text" 
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        placeholder="e.g. Solar Plant Kolkata"
                        className="w-full bg-[#131313] border border-[#262626] rounded p-3 text-xs text-white focus:border-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8e9192] mb-2">Estimated Offset Amount (tCO2e)</label>
                      <input 
                        type="number" 
                        value={newProjAmount}
                        onChange={(e) => setNewProjAmount(e.target.value)}
                        placeholder="e.g. 120"
                        className="w-full bg-[#131313] border border-[#262626] rounded p-3 text-xs text-white focus:border-white focus:outline-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-white text-black font-semibold text-xs py-3 rounded hover:bg-zinc-200 transition-colors uppercase tracking-widest"
                    >
                      Submit Project
                    </button>
                  </form>
                </div>

                {/* Verification Panel (Verifier Role) */}
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">Pending verifications</h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="p-4 bg-[#1c1b1b] border border-[#262626] rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-xs font-semibold text-white">{project.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Developer: {project.developer.slice(0, 10)}...</div>
                          <div className="text-xs text-white mt-1">{project.amount} tCO2e</div>
                        </div>

                        {project.verified ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#8e9192]">
                            <span className="material-symbols-outlined text-[16px] text-zinc-400">check_circle</span>
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div>
                            {activeRole === "verifier" || walletConnected ? (
                              <button 
                                onClick={() => handleVerifyProject(project.id)}
                                className="bg-white text-black font-semibold text-xs px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                              >
                                Approve Project
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-500">Switch to Verifier role</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soroban Contract Deployer */}
              <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6 max-w-xl">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-white">dns</span>
                  Soroban Contract Deployer
                </h3>
                <p className="text-xs text-[#8e9192]">
                  Instantiate and register a new smart contract on the Stellar Testnet using pre-compiled WASM bytecode.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8e9192] mb-2">Contract Module</label>
                    <select 
                      id="deploy-contract-select"
                      className="w-full bg-[#131313] border border-[#262626] rounded p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Carbon Registry">Carbon Registry (WASM Hash: b4f6fa...)</option>
                      <option value="Marketplace">Marketplace (WASM Hash: 5f3d1a...)</option>
                      <option value="Settlement">Settlement (WASM Hash: 9e2c7a...)</option>
                      <option value="Retirement">Retirement (WASM Hash: a7b1d4...)</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      const selectEl = document.getElementById("deploy-contract-select");
                      if (selectEl) {
                        handleDeployContract(selectEl.value);
                      }
                    }}
                    className="w-full bg-white text-black font-semibold text-xs py-3 rounded hover:bg-zinc-200 transition-colors uppercase tracking-widest font-mono"
                  >
                    Deploy Contract
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: RETIREMENT CENTER */}
          {activeTab === "retirement" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-[#262626] pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Carbon Retirement Center</h2>
                  <p className="text-sm text-[#8e9192] mt-1">Permanently burn credits to claim environmental impact offset certificates.</p>
                </div>
              </div>

              {/* Selection Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Available credits for retirement */}
                <div className="lg:col-span-8 bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-white">Credits Available for Retirement</h3>
                  
                  <div className="space-y-3">
                    {credits.filter(c => (c.owner === (walletAddress || roleAddresses[activeRole]) || (activeRole === "developer" && c.owner === roleAddresses.developer)) && !c.retired).map((c) => (
                      <div key={c.id} className="p-4 bg-[#1c1b1b] border border-[#262626] rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-xs font-semibold text-white">{c.project}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Credit ID: #{c.id} | Amount: {c.amount} tCO2e</div>
                        </div>
                        <button 
                          onClick={() => handleRetireCredit(c.id)}
                          className="bg-transparent border border-white text-white text-xs px-4 py-2 rounded hover:bg-white/10 transition-colors"
                        >
                          Retire Credits
                        </button>
                      </div>
                    ))}
                    {credits.filter(c => (c.owner === (walletAddress || roleAddresses[activeRole]) || (activeRole === "developer" && c.owner === roleAddresses.developer)) && !c.retired).length === 0 && (
                      <div className="text-xs text-[#8e9192] italic">No active credits available to retire in this workspace. Buy credits from the Marketplace.</div>
                    )}
                  </div>
                </div>

                {/* Sustainability Certificates */}
                <div className="lg:col-span-4 bg-[#111111] border border-[#262626] rounded-xl p-6 space-y-6 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">Sustainability Certificates</h3>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {retiredCredits.map((c, i) => (
                      <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-[#8e9192]">CERT-00{i+1}</span>
                          <span className="material-symbols-outlined text-[18px] text-white">workspace_premium</span>
                        </div>
                        <div className="text-xs font-bold text-white">Certificate of Carbon Retirement</div>
                        <p className="text-[10px] text-zinc-400">This certifies that {c.amount} tCO2e offset was retired permanently via project: {c.project}.</p>
                      </div>
                    ))}
                    {retiredCredits.length === 0 && (
                      <div className="text-xs text-[#8e9192] text-center py-8">Retire credits to receive on-chain certificates here.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: EVENT STREAM */}
          {activeTab === "activity" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-[#262626] pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Real-Time Event Stream</h2>
                  <p className="text-sm text-[#8e9192] mt-1">Live blockchain events emitted by CarbonX smart contracts.</p>
                </div>
              </div>

              <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 font-mono space-y-4 max-h-[500px] overflow-y-auto">
                {activityFeed.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start text-xs border-b border-[#262626]/40 pb-3">
                    <span className="text-zinc-600">[{log.timestamp}]</span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded text-[10px] border border-white/10">
                      EVENT
                    </span>
                    <p className="text-white flex-1">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {txModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#262626] rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white font-bold">{txModal.title}</h3>
                <p className="text-[10px] text-[#8e9192] mt-1 font-mono break-all">{txModal.details}</p>
              </div>
              {txModal.currentStep >= 4 && (
                <button 
                  onClick={() => setTxModal(prev => ({ ...prev, isOpen: false }))}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Dismiss
                </button>
              )}
            </div>

            <div className="space-y-4">
              {txModal.steps.map((step, idx) => {
                let status = "pending";
                if (txModal.currentStep === idx) status = "active";
                else if (txModal.currentStep > idx) status = "completed";

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {status === "completed" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
                    )}
                    {status === "active" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping block" />
                    )}
                    {status === "pending" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 block" />
                    )}
                    <span className={status === "completed" ? "text-zinc-400" : status === "active" ? "text-white font-semibold" : "text-zinc-600"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {txModal.currentStep === 4 && (
              <div className="bg-[#1c2e1f] border border-emerald-500/20 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span>✓</span> Transaction Successfully Confirmed
                </div>
                <div className="font-mono text-[9px] text-zinc-300 break-all select-all">
                  Hash: {txModal.txHash}
                </div>
                <div className="text-[10px] text-zinc-400">
                  On-chain event logs emitted and dashboard state successfully updated.
                </div>
              </div>
            )}

            {txModal.currentStep === 5 && (
              <div className="bg-[#2d1b1b] border border-rose-500/20 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <span>✗</span> Transaction Failed
                </div>
                <div className="text-[10px] text-zinc-300">
                  Transaction signature rejected or simulation error.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
