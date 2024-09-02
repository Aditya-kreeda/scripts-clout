const axios = require("axios");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const { v4 } = require("uuid");

const accessTokenArray = [];

// Generate 5 different sets of users
const users = Array.from({ length: 30 }, () => ({
  email: faker.internet.email(),
  password: faker.internet.password(8, false, /[A-Za-z0-9]/, "User@123"),
}));

const contentCategories = ["fashion", "cars", "technology", "astrology"];

// Function to get random elements from an array
const getRandomElements = (arr, count) => {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
};

function generateHandleName() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
  const handleNameLength = faker.number.int({ min: 5, max: 12 });
  let handleName = "";

  for (let i = 0; i < handleNameLength; i++) {
    handleName += faker.string.fromCharacters(characters);
  }

  return handleName;
}

(async () => {
  for (const user of users) {
    try {
      // Signup User
      const signupResponse = await axios.post(
        "https://api.dev.yarra.social/api/v1/user/auth/signup",
        user,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log(`Signup successful for ${user.email}`);

      // Extract verification token from the signup response
      const verificationLink = signupResponse.data.data.verificationLink;
      const token = verificationLink.split("token=")[1];
      const userId = signupResponse.data.data.user.id;
      // Verify User
      await axios.patch(
        "https://api.dev.yarra.social/api/v1/user/auth/verify",
        "",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`Verification successful for ${user.email}`);

      // Sign In User
      const signInResponse = await axios.post(
        "https://api.dev.yarra.social/api/v1/user/auth/signin",
        {
          email: user.email,
          password: user.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log(`Sign-in successful for ${user.email}`);

      // Extract and store the access token
      const accessToken = signInResponse.data.data.accessToken;
      accessTokenArray.push({
        email: user.email,
        accessToken: accessToken,
      });

      //onboard the user

      axios
        .request({
          method: "put",
          maxBodyLength: Infinity,
          url: `https://api.dev.yarra.social/api/v1/user/onboard/${userId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `${accessToken}`,
          },
          data: {
            displayName: faker.internet.userName() + "_" + v4(),
            handleName: generateHandleName(),
            preferredContentCategory: getRandomElements(
              contentCategories,
              Math.floor(Math.random() * 2) + 3
            ),
            gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
            phoneNumber: faker.string.numeric({ length: 10 }),
          },
        })
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error.response.data);
        });

      console.log(`Access token stored for ${user.email}`);
    } catch (error) {
      console.error(
        `Error processing ${user.email}:`,
        error.response ? error.response.data : error.message
      );
    }
  }

  // Save access tokens to a JSON file
  fs.writeFileSync(
    "../accessTokens.json",
    JSON.stringify(accessTokenArray, null, 2),
    "utf-8"
  );
  console.log("Access tokens saved to accessTokens.json");
})();
