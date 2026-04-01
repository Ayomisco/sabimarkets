const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "FLOW");

  // 1. Deploy MockUSDC (testnet only)
  console.log("\n--- Deploying MockUSDC ---");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // 2. Deploy SabiMarketFactory
  console.log("\n--- Deploying SabiMarketFactory ---");
  const SabiMarketFactory = await hre.ethers.getContractFactory("SabiMarketFactory");
  const factory = await SabiMarketFactory.deploy(usdcAddress, deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("SabiMarketFactory deployed to:", factoryAddress);

  // 3. Mint test USDC to deployer
  console.log("\n--- Minting test USDC ---");
  const mintTx = await usdc.faucet();
  await mintTx.wait();
  console.log("Minted 10,000 USDC to deployer");

  // 4. Create sample African prediction markets
  console.log("\n--- Creating sample markets ---");

  const markets = [
    {
      question: "Will Nigeria's GDP growth exceed 3% in 2026?",
      category: "economics",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days
    },
    {
      question: "Will the Africa Cup of Nations 2026 final attract over 1 million viewers?",
      category: "sports",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days
    },
    {
      question: "Will Kenya adopt a CBDC by end of 2026?",
      category: "crypto",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60, // 180 days
    },
    {
      question: "Will South Africa's rand strengthen against the USD in Q2 2026?",
      category: "economics",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
    },
    {
      question: "Will Ethereum price exceed $10,000 by July 2026?",
      category: "crypto",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 120 * 24 * 60 * 60,
    },
    {
      question: "Will Ghana host a major tech conference in 2026?",
      category: "technology",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 150 * 24 * 60 * 60,
    },
    {
      question: "Will Rwanda's Kigali Innovation City launch Phase 2 in 2026?",
      category: "technology",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
    },
    {
      question: "Will the Naira/USD rate drop below 1000 by end of 2026?",
      category: "economics",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 270 * 24 * 60 * 60,
    },
    {
      question: "Will a West African team win the next AFCON tournament?",
      category: "sports",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    },
    {
      question: "Will Bitcoin be legal tender in any African country by 2027?",
      category: "crypto",
      imageUri: "",
      endTime: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    },
  ];

  const deployedMarkets = [];

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const tx = await factory.createMarket(
      m.question,
      m.category,
      m.imageUri,
      m.endTime,
      deployer.address // deployer is also the resolver
    );
    const receipt = await tx.wait();

    // Get market address from event
    const event = receipt.logs.find((log) => {
      try {
        return factory.interface.parseLog(log)?.name === "MarketCreated";
      } catch {
        return false;
      }
    });

    const parsed = factory.interface.parseLog(event);
    const marketAddress = parsed.args.market;
    deployedMarkets.push({ ...m, address: marketAddress });
    console.log(`Market ${i + 1}: ${m.question}`);
    console.log(`  Address: ${marketAddress}`);
    console.log(`  Category: ${m.category}`);
  }

  // 5. Add some initial liquidity to first 3 markets
  console.log("\n--- Adding seed liquidity ---");
  const SabiMarket = await hre.ethers.getContractFactory("SabiMarket");

  for (let i = 0; i < 3 && i < deployedMarkets.length; i++) {
    const market = SabiMarket.attach(deployedMarkets[i].address);
    const amount = 100n * 10n ** 6n; // 100 USDC

    // Approve
    await (await usdc.approve(deployedMarkets[i].address, amount * 2n)).wait();

    // Buy YES and NO shares to seed both sides
    await (await market.buyShares(true, amount)).wait();
    await (await market.buyShares(false, amount)).wait();

    console.log(`Seeded market ${i + 1} with 200 USDC (100 YES + 100 NO)`);
  }

  // 6. Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log(`Network:            Flow EVM Testnet`);
  console.log(`MockUSDC:           ${usdcAddress}`);
  console.log(`SabiMarketFactory:  ${factoryAddress}`);
  console.log(`Markets created:    ${deployedMarkets.length}`);
  console.log(`Deployer/Resolver:  ${deployer.address}`);
  console.log("========================================");
  console.log("\n--- Add to your .env ---");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=545`);
  console.log(`NEXT_PUBLIC_RPC_URL=https://testnet.evm.nodes.onflow.org`);
  console.log(`NEXT_PUBLIC_BLOCK_EXPLORER=https://evm-testnet.flowscan.io`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
