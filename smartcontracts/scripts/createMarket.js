const hre = require("hardhat");

/// Usage: FACTORY=0x... npx hardhat run scripts/createMarket.js --network flowTestnet
async function main() {
  const factoryAddress = process.env.FACTORY;
  if (!factoryAddress) {
    console.error("Set FACTORY=0x... environment variable");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractAt("SabiMarketFactory", factoryAddress);

  // Customize these:
  const question = process.env.QUESTION || "Will Bitcoin exceed $100K in 2026?";
  const category = process.env.CATEGORY || "crypto";
  const imageUri = process.env.IMAGE || "";
  const daysFromNow = parseInt(process.env.DAYS || "90");
  const endTime = Math.floor(Date.now() / 1000) + daysFromNow * 24 * 60 * 60;
  const resolver = process.env.RESOLVER || deployer.address;

  console.log("Creating market...");
  console.log("Question:", question);
  console.log("Category:", category);
  console.log("End time:", new Date(endTime * 1000).toISOString());

  const tx = await factory.createMarket(question, category, imageUri, endTime, resolver);
  const receipt = await tx.wait();

  const event = receipt.logs.find((log) => {
    try {
      return factory.interface.parseLog(log)?.name === "MarketCreated";
    } catch {
      return false;
    }
  });

  const parsed = factory.interface.parseLog(event);
  console.log("\nMarket created at:", parsed.args.market);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
