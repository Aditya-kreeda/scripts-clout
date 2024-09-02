const fs = require("fs");
const { Client } = require("pg");
const axios = require("axios");

// Load user tokens from the JSON file
const userTokens = JSON.parse(fs.readFileSync("../accessTokens.json"));

// PostgreSQL connection configuration
const client = new Client({
  user: "postgres",
  host: "yaara-dev.cpus4scgkuu7.ap-south-1.rds.amazonaws.com",
  database: "payment",
  password: "Yaara123",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Function to generate random YC values
function getRandomYCValue(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

// Function to update YcWallet
async function updateYcWallet(userId) {
  const addedYc = getRandomYCValue(100, 15000);
  const totalYc = addedYc;

  const query = `
    UPDATE yc_wallet
    SET 
      "addedYc" = $1,
      "totalYc" = $2,
      "updatedAt" = NOW()
    WHERE "userId" = $3;
  `;

  const values = [addedYc, totalYc, userId];

  try {
    await client.query(query, values);
    console.log(`Updated YcWallet for userId: ${userId}`);
  } catch (err) {
    console.error(`Error updating YcWallet for userId: ${userId}`, err.stack);
  }
}

async function getUserId(token) {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.dev.yarra.social/api/v1/user/profile",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    };

    const data = await axios.request(config);
    return data.data.data.user.id;
  } catch (e) {
    console.log(e.response.data);
    throw new error(e);
  }
}

async function processWalletUpdates() {
  try {
    await client.connect();

    for (let token of userTokens) {
      // Assuming each token has a `userId` property
      const userId = await getUserId(token);

      // Update YC Wallet for the user
      await updateYcWallet(userId);
    }

    await client.end();
  } catch (e) {
    await client.end();
    console.log(e);
  }
}

processWalletUpdates();
