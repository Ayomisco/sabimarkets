const hre = require("hardhat");

async function main() {
  const factoryAddress = "0xE7579839f736Be431750DCC8715de34305C71c4E";
  const usdcAddress = "0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3";
  const [deployer] = await hre.ethers.getSigners();

  const factory = await hre.ethers.getContractAt("SabiMarketFactory", factoryAddress);
  const usdc = await hre.ethers.getContractAt("MockUSDC", usdcAddress);

  // Mint more USDC for seeding
  console.log("Minting more test USDC...");
  await (await usdc.mint(deployer.address, 50000n * 10n ** 6n)).wait();

  const markets = [
    // Nigeria
    { question: "Will Nigeria's inflation rate drop below 20% by Q3 2026?", category: "economics", days: 180 },
    { question: "Will Lagos complete the Blue Line rail extension by 2026?", category: "infrastructure", days: 270 },
    { question: "Will the Super Eagles qualify for the 2026 World Cup?", category: "sports", days: 120 },
    { question: "Will Nigeria launch a digital identity system by end of 2026?", category: "technology", days: 270 },
    
    // South Africa
    { question: "Will South Africa's load shedding end completely in 2026?", category: "infrastructure", days: 270 },
    { question: "Will the Springboks retain the Rugby World Cup in 2027?", category: "sports", days: 365 },
    { question: "Will South Africa's unemployment rate drop below 30% in 2026?", category: "economics", days: 270 },
    
    // East Africa
    { question: "Will Tanzania's SGR reach completion by end of 2026?", category: "infrastructure", days: 270 },
    { question: "Will Ethiopia's GDP growth exceed 7% in 2026?", category: "economics", days: 270 },
    { question: "Will Uganda discover commercially viable oil reserves in 2026?", category: "economics", days: 270 },
    
    // West Africa
    { question: "Will the Eco currency launch in West Africa by 2027?", category: "economics", days: 365 },
    { question: "Will Senegal become Africa's largest gas exporter by 2027?", category: "economics", days: 365 },
    
    // Crypto markets
    { question: "Will Bitcoin exceed $150,000 by end of 2026?", category: "crypto", days: 270 },
    { question: "Will Solana flip Ethereum in daily transactions in 2026?", category: "crypto", days: 270 },
    { question: "Will a stablecoin be used for government payments in Africa by 2027?", category: "crypto", days: 365 },
    { question: "Will Flow blockchain reach 1 million daily active users in 2026?", category: "crypto", days: 270 },
    { question: "Will DeFi TVL on African chains exceed $1 billion in 2026?", category: "crypto", days: 270 },
    { question: "Will any African country ban crypto mining in 2026?", category: "crypto", days: 270 },
    
    // Pan-African
    { question: "Will the African Continental Free Trade Area reach 50 member states by 2027?", category: "politics", days: 365 },
    { question: "Will an African startup achieve $1B+ valuation in 2026?", category: "technology", days: 270 },
    { question: "Will Africa host the 2036 Olympic Games?", category: "sports", days: 365 },
    { question: "Will mobile money transactions in Africa exceed $1 trillion in 2026?", category: "technology", days: 270 },
    { question: "Will renewable energy surpass 50% of new power generation in Africa by 2027?", category: "infrastructure", days: 365 },
  ];

  const SabiMarket = await hre.ethers.getContractFactory("SabiMarket");
  const deployedMarkets = [];

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const endTime = Math.floor(Date.now() / 1000) + m.days * 24 * 60 * 60;
    
    const tx = await factory.createMarket(
      m.question,
      m.category,
      "",
      endTime,
      deployer.address
    );
    const receipt = await tx.wait();

    const event = receipt.logs.find((log) => {
      try { return factory.interface.parseLog(log)?.name === "MarketCreated"; } catch { return false; }
    });
    const parsed = factory.interface.parseLog(event);
    const marketAddress = parsed.args.market;
    deployedMarkets.push({ ...m, address: marketAddress });
    console.log(`Market ${i + 1}/${markets.length}: ${m.question}`);
    console.log(`  -> ${marketAddress} [${m.category}]`);
  }

  // Seed first 10 of these new markets with liquidity
  console.log("\n--- Seeding liquidity ---");
  for (let i = 0; i < 10 && i < deployedMarkets.length; i++) {
    const market = SabiMarket.attach(deployedMarkets[i].address);
    const amount = 50n * 10n ** 6n; // 50 USDC each side

    await (await usdc.approve(deployedMarkets[i].address, amount * 2n)).wait();
    await (await market.buyShares(true, amount)).wait();
    await (await market.buyShares(false, amount)).wait();
    console.log(`Seeded market ${i + 1}: ${deployedMarkets[i].question.substring(0, 50)}...`);
  }

  const totalCount = await factory.getMarketCount();
  console.log(`\nTotal markets on factory: ${totalCount}`);
  console.log("Done!");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
