const axios = require("axios");
const fs = require("fs");
const { faker, da } = require("@faker-js/faker");

// Load tokens from a JSON file
const tokens = JSON.parse(fs.readFileSync("../accessTokens.json", "utf8"));

// Arrays with random photo URLs and content categories
const profilePhotos = [
  "https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-confident-1714666150",
  "https://www.shutterstock.com/image-photo/portrait-serious-confident-businessman-entrepreneur-company-2022462281",
  "https://www.shutterstock.com/image-photo/portrait-smiling-millennial-businesswoman-holding-documents-1183089442",
  "https://www.shutterstock.com/image-photo/happy-beautiful-young-indian-woman-looking-2184667097",
  "https://www.shutterstock.com/image-photo/smiling-african-american-millennial-businessman-glasses-1437938108",
];

const coverPhotos = [
  "https://www.shutterstock.com/image-illustration/watercolor-tropical-jungle-animals-safari-wildlife-2468227303",
  "https://images.ctfassets.net/hrltx12pl8hq/3Wouskp3nuwpVIkhDGK0uK/f7f7b9a1a222e6f04dff50edbd5df267/12_classroom.webp",
  "https://images.ctfassets.net/hrltx12pl8hq/4JTQSfO9cSSO9pn5wtMwk1/77df966556f869a732dc35230b2943aa/9_books.webp",
  "https://image.shutterstock.com/image-photo/digital-nomad-bali-man-on-260nw-2294125351.jpg",
  "https://image.shutterstock.com/image-photo/open-laptop-black-screen-on-260nw-1770576503.jpg",
];

// Function to update each user profile
tokens.forEach((token, index) => {
  const data = {
    description: faker.lorem.sentence(),
    profilePhotoUrl:
      profilePhotos[Math.floor(Math.random() * profilePhotos.length)],
    coverPhotoUrl: coverPhotos[Math.floor(Math.random() * coverPhotos.length)],
  };

  // Randomly assign empty profilePhotoUrl or coverPhotoUrl
  if (Math.random() > 0.5) {
    delete data.profilePhotoUrl;
  }
  if (Math.random() > 0.5) {
    delete data.coverPhotoUrl;
  }

  if (Math.random() > 0.5) {
    delete data.description;
  }

  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/user/profile",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    data: JSON.stringify(data),
  };

  axios
    .request(config)
    .then((response) => {
      console.log(`User ${index + 1} profile updated:`, response.data);
    })
    .catch((error) => {
      console.log(
        `Error updating user ${index + 1} profile:`,
        error.response.data
      );
    });
});
