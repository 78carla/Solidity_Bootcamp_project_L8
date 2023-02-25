import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

function convertStringArrayToBytes32(array: string[]): string[] {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const args = process.argv;
  const proposals = args.slice(2);

  if (proposals.length <= 0) throw new Error("Missing parameters: proposals");

  // Use the goerli testnet provider
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.ALCHEMY_API_KEY
  );

  //console.log({ provider });

  //Get the last block
  const lastBlock = provider.getBlock("latest");

  //Create my wallet
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing enviroment: mnemonic missing");
  const wallet = new ethers.Wallet(privateKey);
  console.log("Connected to the wallet address", wallet.address);

  //Connect the wallet to the provider
  const signer = wallet.connect(provider);
  const balance = await signer.connect(provider).getBalance();
  console.log("Wallet balance", balance, "Wei");

  //return;

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");

  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Contract deployed, waiting for confirmation...");
  await ballotContract.deployed();
  console.log("Ballot contract deployed at: ", ballotContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
