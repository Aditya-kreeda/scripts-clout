const axios = require("axios");
const fs = require("fs");

// Load user tokens from the JSON file
const userTokens = JSON.parse(fs.readFileSync("../accessTokenCreator.json"));

// Function to generate a random number between min and max
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to make subscription API call
async function assignSubscription(token) {
  const data = {
    amountInYC: getRandomValue(100, 15000),
    audioCall: true,
    videoCall: true,
    directMessage: true,
    audioCallMinutes: getRandomValue(0, 60),
    videoCallMinutes: getRandomValue(0, 60),
    directMessageMinutes: getRandomValue(0, 60),
  };

  if (Math.random() > 0.3) {
    delete data.audioCallMinutes;
    data.audioCall = false;
  }

  if (Math.random() > 0.3) {
    delete data.directMessageMinutes;
    data.directMessage = false;
  }

  if (Math.random() > 0.3) {
    delete data.videoCallMinutes;
    data.videoCall = false;
  }

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/subscription",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("Subscription assigned:", JSON.stringify(response.data));
  } catch (error) {
    console.error("Error assigning subscription:", error);
  }
}

// Function to make on-demand rate API call
async function assignOnDemandRate(token) {
  const data = {
    videoCallYc: getRandomValue(100, 15000),
    audioCallYc: getRandomValue(100, 15000),
    directMessageYc: getRandomValue(100, 15000),
  };

  if (Math.random() > 0.3) {
    delete data.audioCallYc;
  }

  if (Math.random() > 0.3) {
    delete data.videoCallYc;
  }

  if (Math.random() > 0.3) {
    delete data.directMessageYc;
  }

  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/subscription/on-demand-rate",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("On-demand rate assigned:", JSON.stringify(response.data));
  } catch (error) {
    console.error("Error assigning on-demand rate:", error);
  }
}

// Function to process all tokens
async function processTokens() {
  for (let token of userTokens) {
    const assignSubscriptionFlag = Math.random() > 0.5;
    const assignOnDemandRateFlag = Math.random() > 0.5;

    if (assignSubscriptionFlag) {
      await assignSubscription(token);
    }

    if (assignOnDemandRateFlag) {
      await assignOnDemandRate(token);
    }
  }
}

// Start the process
processTokens();
