const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Test data
const testUser = {
  username: "NDT001",
  password: "12345678",
};

let authToken = "";

// Test login
async function testLogin() {
  try {
    console.log("Testing login...");
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    console.log("Login response:", response.data);

    if (response.data.success) {
      authToken = response.data.token;
      console.log("Login successful, token received");
    }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
  }
}

// Test sao kê giao dịch
async function testSaoKeGiaoDich() {
  if (!authToken) {
    console.log("No auth token, skipping sao kê giao dịch test");
    return;
  }

  try {
    console.log("\nTesting sao kê giao dịch...");
    const requestData = {
      tuNgay: "2024-01-01",
      denNgay: "2024-01-31",
    };

    const response = await axios.post(
      `${BASE_URL}/transactions/sao-ke-giao-dich`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Sao kê giao dịch response:", response.data);
  } catch (error) {
    console.error(
      "Sao kê giao dịch failed:",
      error.response?.data || error.message
    );
  }
}

// Test sao kê lệnh khớp
async function testSaoKeLenhKhop() {
  if (!authToken) {
    console.log("No auth token, skipping sao kê lệnh khớp test");
    return;
  }

  try {
    console.log("\nTesting sao kê lệnh khớp...");
    const requestData = {
      tuNgay: "2024-01-01",
      denNgay: "2024-01-31",
    };

    const response = await axios.post(
      `${BASE_URL}/transactions/sao-ke-lenh-khop`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Sao kê lệnh khớp response:", response.data);
  } catch (error) {
    console.error(
      "Sao kê lệnh khớp failed:",
      error.response?.data || error.message
    );
  }
}

// Test logout
async function testLogout() {
  if (!authToken) {
    console.log("No auth token, skipping logout test");
    return;
  }

  try {
    console.log("\nTesting logout...");
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Logout response:", response.data);
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("Starting API tests...\n");

  await testLogin();
  await testSaoKeGiaoDich();
  await testSaoKeLenhKhop();
  await testLogout();

  console.log("\nAll tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testLogin,
  testSaoKeGiaoDich,
  testSaoKeLenhKhop,
  testLogout,
  runTests,
};
