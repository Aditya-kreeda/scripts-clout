const axios = require("axios");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { Client } = require("pg");
const { v4 } = require("uuid");

// Load the user tokens from the JSON file
const userTokens = JSON.parse(fs.readFileSync("../accessTokens.json"));

// Select 10 random user tokens
const selectedTokens = userTokens.sort(() => 0.5 - Math.random()).slice(0, 9);

// Save access tokens of creators to a JSON file
fs.writeFileSync(
  "../accessTokenCreator.json",
  JSON.stringify(selectedTokens, null, 2),
  "utf-8"
);
console.log("Access tokens saved to accessTokenCreator.json");

// Function to get user profile and extract userId
async function getUserIds() {
  let userIds = [];
  let emails = [];
  for (let token of selectedTokens) {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.dev.yarra.social/api/v1/user/profile",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    };

    try {
      const response = await axios.request(config);
      userIds.push(response.data.data.user.id);
      emails.push(token.email);
    } catch (error) {
      console.error(`Error fetching user profile: ${error}`);
    }
  }

  return { userIds: userIds, emails: emails };
}

// Database connection configuration
const client = new Client({
  user: "postgres",
  host: "yaara-dev.cpus4scgkuu7.ap-south-1.rds.amazonaws.com",
  database: "creator",
  password: "Yaara123",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Helper function to generate random data
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateHandleName() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
  const handleNameLength = faker.number.int({ min: 5, max: 12 });
  let handleName = "";

  for (let i = 0; i < handleNameLength; i++) {
    handleName += faker.string.fromCharacters(characters);
  }

  return handleName;
}

const profilePhotoUrls = [
  "https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-confident-1714666150",
  "https://www.shutterstock.com/image-photo/portrait-serious-confident-businessman-entrepreneur-company-2022462281",
  "https://www.shutterstock.com/image-photo/portrait-smiling-millennial-businesswoman-holding-documents-1183089442",
  "https://www.shutterstock.com/image-photo/happy-beautiful-young-indian-woman-looking-2184667097",
  "https://www.shutterstock.com/image-photo/smiling-african-american-millennial-businessman-glasses-1437938108",
];

const coverPhotoUrls = [
  "https://www.shutterstock.com/image-illustration/watercolor-tropical-jungle-animals-safari-wildlife-2468227303",
  "https://images.ctfassets.net/hrltx12pl8hq/3Wouskp3nuwpVIkhDGK0uK/f7f7b9a1a222e6f04dff50edbd5df267/12_classroom.webp",
  "https://images.ctfassets.net/hrltx12pl8hq/4JTQSfO9cSSO9pn5wtMwk1/77df966556f869a732dc35230b2943aa/9_books.webp",
  "https://image.shutterstock.com/image-photo/digital-nomad-bali-man-on-260nw-2294125351.jpg",
  "https://image.shutterstock.com/image-photo/open-laptop-black-screen-on-260nw-1770576503.jpg",
];

const preferredContentCategories = [
  "fashion",
  "cars",
  "technology",
  "astrology",
  "business",
  "social",
  "politics",
  "educational",
  "science",
];

function getRandomProfileData(userId, email) {
  const genderOptions = ["MALE", "FEMALE", "OTHER"];

  return {
    userId: userId,
    email: email,
    displayName: faker.internet.userName() + "_" + v4(),
    handleName: generateHandleName(),
    creatorType: Math.random() > 0.5 ? "INDIVIDUAL" : "BUSINESS",
    profilePhotoUrl:
      Math.random() > 0.5 ? getRandomElement(profilePhotoUrls) : null,
    coverPhotoUrl:
      Math.random() > 0.5 ? getRandomElement(coverPhotoUrls) : null,
    gender: getRandomElement(genderOptions),
    description: Math.random() > 0.5 ? faker.lorem.sentence() : null,
    phoneNumber: faker.string.numeric({ length: 10 }),
    contentTarget: `{"${getRandomElement(
      preferredContentCategories
    ).toUpperCase()}", "${getRandomElement(
      preferredContentCategories
    ).toUpperCase()}", "${getRandomElement(
      preferredContentCategories
    ).toUpperCase()}"}`,
  };
}

// Insert the data into the database
async function insertDataToDb(userIds, emails) {
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];

    const profileData = getRandomProfileData(userId, emails[i]);

    const query = `
  INSERT INTO creators
    ("id","userId", "email", "phoneNumber", "displayName", "handleName", "description","contentTarget",
     "creatorType", 
     "followersCount", "followingCount", "subscriptionCount", "subscriberCount", 
    "isInstagramVerified", "isEmailVerified",  "isActive", "isReported", "isBlocked", 
    "profilePhotoUrl", "coverPhotoUrl", gender, "createdAt", "updatedAt")
  VALUES
    ('${v4()}','${profileData.userId}', '${profileData.email}', '${
      profileData.phoneNumber
    }', '${profileData.displayName}', '${profileData.handleName}', 
    '${profileData.description}','${profileData.contentTarget}',
    '${profileData.creatorType}', ${profileData.followersCount || 0}, ${
      profileData.followingCount || 0
    }, 
    ${profileData.subscriptionCount || 0}, ${
      profileData.subscriberCount || 0
    }, ${true}, 
    ${true},${true}, 
    ${profileData.isReported || false}, ${profileData.isBlocked || false}, '${
      profileData.profilePhotoUrl
    }', 
    '${profileData.coverPhotoUrl}', 
     '${profileData.gender}', 
    NOW(), NOW());`;

    await client.query(query);
  }
}

// syncs creator with other services
function syncCreators() {
  selectedTokens.forEach((token) => {
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: "https://api.dev.yarra.social/api/v1/creator/profile",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      data: {
        preferredContentCategory: [
          getRandomElement(preferredContentCategories),
          getRandomElement(preferredContentCategories),
          getRandomElement(preferredContentCategories),
        ],
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

async function main() {
  const { userIds, emails } = await getUserIds();
  await client.connect();
  await insertDataToDb(userIds, emails);
  await client.end();
  syncCreators();
}

main();
