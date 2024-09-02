const axios = require("axios");

// Possible values for amount and discount percentages
const amounts = [500, 1000, 2000, 2500, 4000, 5000];
const discountPercentages = [0, 5, 7, 10, 12, 15];

// Function to calculate GST
const calculateGst = (amount) => amount * 0.18; // Assuming 18% GST

// Function to calculate the discounted amount
const calculateDiscountedAmount = (amount, discountPercentage) =>
  amount - amount * (discountPercentage / 100);

// Function to send the request
const sendPaymentConfigRequest = (amountInRs, discountPercentage) => {
  const discountedAmount = calculateDiscountedAmount(
    amountInRs,
    discountPercentage
  );
  const gstAmount = calculateGst(discountedAmount);
  const totalAmount = discountedAmount + gstAmount;

  // Prepare the data for the request
  let data = JSON.stringify({
    discountPercentage: discountPercentage,
    amountInRs: amountInRs,
    amountInYc: amountInRs * 10,
    totalAmount: Math.round(totalAmount),
    gstAmount: Math.round(gstAmount),
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.dev.yarra.social/api/v1/payment/add-money-config",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  // Make the request
  axios
    .request(config)
    .then((response) => {
      console.log(
        `Response for amount: ${amountInRs}, discount: ${discountPercentage}% - ${JSON.stringify(
          response.data
        )}`
      );
    })
    .catch((error) => {
      console.log(
        `Error for amount: ${amountInRs}, discount: ${discountPercentage}% - ${error}`
      );
    });
};

// Loop through all values
for (let i = 0; i < amounts.length; i++) {
  sendPaymentConfigRequest(amounts[i], discountPercentages[i]);
}
