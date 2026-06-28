"use client";

import React, { useState, useEffect } from "react";
import { getFreighterPublicKey, submitSorobanTx, CONTRACTS } from "../lib/stellar";

export default function Home() {
  const [inApp, setInApp] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, marketplace, verification, retirement, activity
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeRole, setActiveRole] = useState("developer"); // developer, buyer, verifier
  
  // Addresses mapping
  const roleAddresses = {
    developer: "GBDEVELOPERACME2R3M6R6PQA5VGD77B5XG2V6B5Y2B",
    buyer: "GBBUYERNEXUSCAPITAL3P4Q6T7Y5VWD88ZG4W6C3B2B",
    verifier: "GBVERIFIERSTELLARVERIFY4R5T7Y8U9I0O1P2Q3W4B",
  };

  useEffect(() => {
    // Attempt auto-connect if Freighter is open/authorized
    const autoConnect = async () => {
      const key = await getFreighterPublicKey();
      if (key) {
        setWalletConnected(true);
        setWalletAddress(key);
      }
    };
    autoConnect();
  }, []);

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

  const addActivity = (text, type) => {
    setActivityFeed(prev => [
      { id: `${Date.now()}-${Math.random()}`, text, type, timestamp: "Just now" },
      ...prev
    ]);
  };

  const connectWallet = async () => {
    const key = await getFreighterPublicKey();
    if (key) {
      setWalletConnected(true);
      setWalletAddress(key);
      addActivity(`✓ Wallet connected via Freighter: ${key.slice(0, 12)}...`, "system");
    } else {
      const fallbackKey = roleAddresses[activeRole];
      setWalletConnected(true);
      setWalletAddress(fallbackKey);
      addActivity(`✓ Sandbox Account Connected (Simulated Wallet): ${fallbackKey.slice(0, 12)}...`, "system");
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    addActivity("Wallet disconnected", "system");
  };

  // --- contract functions ---
  const handleRegisterProject = async (e) => {
    e.preventDefault();
    if (!newProjName || !newProjAmount) return;

    const amt = parseFloat(newProjAmount);
    const developerAddress = walletAddress || roleAddresses.developer;
    
    // Simulate transaction call via SDK
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
  };

  const handleVerifyProject = async (projectId) => {
    const p = projects.find(proj => proj.id === projectId);
    if (!p) return;

    const verifierAddress = walletAddress || roleAddresses.verifier;

    // Simulate verification transaction call via SDK
    const tx = await submitSorobanTx({
      contractId: CONTRACTS.verification,
      method: "verify_project",
      args: [verifierAddress, projectId, CONTRACTS.registry],
      signerPublicKey: verifierAddress
    });

    setProjects(prev => prev.map(item => {
      if (item.id === projectId) {
        // Mint Credit automatically (Inter-contract call Simulation)
        const creditId = credits.length + 101;
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
  };

  const handleListCredit = async (creditId, priceVal) => {
    const credit = credits.find(c => c.id === creditId);
    if (!credit) return;

    const sellerAddress = walletAddress || roleAddresses.developer;

    // Simulate listing transaction call via SDK
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
  };

  const handleBuyListing = async (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const buyerAddress = walletAddress || roleAddresses.buyer;

    // Simulate purchase transaction call via SDK
    const tx = await submitSorobanTx({
      contractId: CONTRACTS.marketplace,
      method: "buy_credit",
      args: [buyerAddress, listingId, CONTRACTS.registry, CONTRACTS.settlement],
      signerPublicKey: buyerAddress
    });

    setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l));
    setCredits(prev => prev.map(c => c.id === listing.credit_id ? { ...c, owner: buyerAddress } : c));

    addActivity(`[Stellar TX: ${tx.txHash.slice(0, 10)}...] operation buy_credit completed`, "system");
    addActivity(`✓ PaymentLocked: Buyer locked ${listing.price} XLM in Settlement Contract`, "pay_lock");
    addActivity(`✓ PaymentReleased: Seller received ${listing.price} XLM`, "pay_rel");
    addActivity(`✓ OwnershipTransferred: Credit #${listing.credit_id} transferred to Buyer`, "transfer");
    addActivity(`✓ CreditPurchased: Credit #${listing.credit_id} purchased successfully`, "purchased");
  };

  const handleRetireCredit = async (creditId) => {
    const credit = credits.find(c => c.id === creditId);
    if (!credit) return;

    const buyerAddress = walletAddress || roleAddresses.buyer;

    // Simulate retirement transaction call via SDK
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
  };

  // Helper stats
  const getStats = () => {
    const activeAddress = walletAddress || roleAddresses[activeRole];
    const owned = credits.filter(c => c.owner === activeAddress && !c.retired).reduce((acc, c) => acc + c.amount, 0);
    const retired = retiredCredits.filter(c => c.owner === activeAddress).reduce((acc, c) => acc + c.amount, 0);
    const score = carbonScores[activeAddress] || 50;
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
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] animate-pulse" />
                <span className="text-xs font-mono text-zinc-300">Freighter Wallet Linked</span>
                <button 
                  onClick={disconnectWallet}
                  className="text-xs text-zinc-500 hover:text-white underline transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-white text-black font-semibold text-xs px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
              >
                Connect Wallet
              </button>
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
                <div className="text-xs text-[#8e9192]">Active Wallet Balance: 10,000 XLM</div>
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
                    {credits.filter(c => c.owner === (walletAddress || roleAddresses.developer) && !c.retired).map(c => {
                      const alreadyListed = listings.some(l => l.credit_id === c.id && l.active);
                      if (alreadyListed) return null;
                      return (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-[#1c1b1b] border border-[#262626] rounded-lg">
                          <div>
                            <div className="text-xs font-semibold text-white">{c.project}</div>
                            <div className="text-[10px] font-mono text-zinc-500">Credit ID: #{c.id} | {c.amount} tCO2e</div>
                          </div>
                          <button 
                            onClick={() => handleListCredit(c.id, 50)}
                            className="bg-transparent border border-white text-white text-xs px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                          >
                            List @ 50 XLM
                          </button>
                        </div>
                      );
                    })}
                    {credits.filter(c => c.owner === (walletAddress || roleAddresses.developer) && !c.retired).length === 0 && (
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
                    {credits.filter(c => c.owner === (walletAddress || roleAddresses[activeRole]) && !c.retired).map((c) => (
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
                    {credits.filter(c => c.owner === (walletAddress || roleAddresses[activeRole]) && !c.retired).length === 0 && (
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

    </div>
  );
}
