const { faker } = require("@faker-js/faker");
const axios = require("axios");
const fs = require("fs");

// Load user tokens from JSON file
const userTokens = JSON.parse(fs.readFileSync("../accessTokens.json", "utf-8"));

// Function to get user feed and extract post IDs
const getUserFeed = async (token) => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/content/post/feed?status=PROCESSED&page=1&pageSize=100",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.request(config);
    const posts = response.data.data.data;
    return posts.map((post) => ({
      postId: post.id,
      creatorId: post.creatorId,
    }));
  } catch (error) {
    console.error(
      `Error fetching feed for token: ${token}`,
      error.response.data
    );
    return [];
  }
};

// Function to like a post
const likePost = async (token, postId, creatorId) => {
  const data = JSON.stringify({
    postId: postId,
    creatorId: creatorId,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/content/likes",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log(`Liked post: ${postId} by user token: ${token}`);
  } catch (error) {
    console.error(`Error liking post: ${postId}`, error.response.data);
  }
};

// Function to comment on a post with a random text
const commentPost = async (token, postId, creatorId) => {
  const randomComment = faker.string.alpha();

  const data = JSON.stringify({
    postId: postId,
    text: randomComment,
    creatorId: creatorId,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/content/comments",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log(
      `Commented on post: ${postId} with text: ${randomComment} by user token: ${token}`
    );
  } catch (error) {
    console.error(`Error commenting on post: ${postId}`, error.response.data);
  }
};

// Main function to perform actions
const performActions = async () => {
  for (const token of userTokens) {
    const posts = await getUserFeed(token.accessToken);

    for (const post of posts) {
      const randNum = Math.random();

      if (randNum < 0.2) {
        await likePost(token.accessToken, post.postId, post.creatorId);
        await commentPost(token.accessToken, post.postId, post.creatorId);
      } else if (randNum >= 0.2 && randNum <= 0.35) {
        await likePost(token.accessToken, post.postId, post.creatorId);
      } else if (randNum >= 0.5 && randNum <= 0.65) {
        await commentPost(token.accessToken, post.postId, post.creatorId);
      }
    }
  }
};

// Run the script
performActions();
