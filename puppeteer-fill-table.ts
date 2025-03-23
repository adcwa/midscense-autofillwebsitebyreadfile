import puppeteer from "puppeteer";
import { PuppeteerAgent } from "@midscene/web/puppeteer";
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Define user type
interface User {
  id: string;
  name: string;
  age: string;
  email: string;
  phone: string;
}

// Create sample CSV data
const createSampleCsv = () => {
  const csvData = 
`id,name,age,email,phone
1,John Doe,32,john@example.com,123-456-7890
2,Jane Smith,28,jane@example.com,234-567-8901
3,Michael Johnson,45,michael@example.com,345-678-9012
4,Emily Brown,24,emily@example.com,456-789-0123
5,David Wilson,38,david@example.com,567-890-1234`;

  fs.writeFileSync('users.csv', csvData);
  console.log('Sample CSV created successfully');
};

// Table Demo Web Service
const startTableDemoService = () => {
  const app = express();
  const PORT = 3000;

  app.use(express.static('public'));
  app.use(express.json());

  // Create public directory and HTML files if they don't exist
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  // Create HTML file with table demo
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Information Table</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    button { padding: 8px 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
    .form-row { margin-bottom: 10px; }
    label { display: inline-block; width: 80px; }
    input { padding: 8px; width: 300px; }
  </style>
</head>
<body>
  <h1>User Information Management</h1>
  
  <div id="userForm" style="margin-bottom: 30px;">
    <h2>Add/Edit User</h2>
    <div class="form-row">
      <label for="id">ID:</label>
      <input type="text" id="id" name="id">
    </div>
    <div class="form-row">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name">
    </div>
    <div class="form-row">
      <label for="age">Age:</label>
      <input type="number" id="age" name="age">
    </div>
    <div class="form-row">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email">
    </div>
    <div class="form-row">
      <label for="phone">Phone:</label>
      <input type="text" id="phone" name="phone">
    </div>
    <button id="saveUser">Save User</button>
  </div>

  <h2>User Table</h2>
  <table id="userTable">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Age</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="userTableBody">
      <!-- User data will be inserted here -->
    </tbody>
  </table>

  <script>
    // Store users in localStorage
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Display users in table
    function renderUsers() {
      const tableBody = document.getElementById('userTableBody');
      tableBody.innerHTML = '';
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = \`
          <td>\${user.id}</td>
          <td>\${user.name}</td>
          <td>\${user.age}</td>
          <td>\${user.email}</td>
          <td>\${user.phone}</td>
          <td>
            <button onclick="editUser('\${user.id}')">Edit</button>
            <button onclick="deleteUser('\${user.id}')">Delete</button>
          </td>
        \`;
        tableBody.appendChild(row);
      });
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Add or update a user
    document.getElementById('saveUser').addEventListener('click', function() {
      const id = document.getElementById('id').value;
      const name = document.getElementById('name').value;
      const age = document.getElementById('age').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      
      if (!id || !name) {
        alert('ID and Name are required fields');
        return;
      }
      
      // Check if user exists
      const existingUserIndex = users.findIndex(u => u.id === id);
      
      if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = { id, name, age, email, phone };
      } else {
        // Add new user
        users.push({ id, name, age, email, phone });
      }
      
      // Clear form
      document.getElementById('id').value = '';
      document.getElementById('name').value = '';
      document.getElementById('age').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      
      renderUsers();
    });
    
    // Edit user (populate form)
    function editUser(id) {
      const user = users.find(u => u.id === id);
      if (user) {
        document.getElementById('id').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('age').value = user.age;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
      }
    }
    
    // Delete user
    function deleteUser(id) {
      users = users.filter(u => u.id !== id);
      renderUsers();
    }
    
    // Initial render
    renderUsers();
  </script>
</body>
</html>
  `;

  fs.writeFileSync('public/index.html', htmlContent);

  app.listen(PORT, () => {
    console.log(`Table Demo Service running at http://localhost:${PORT}`);
  });
};

// Puppeteer + Midscene agent to fill table from CSV
const startPuppeteerAgent = async () => {
  const results: User[] = [];
  
  // Read CSV file
  fs.createReadStream('users.csv')
    .pipe(csv())
    .on('data', (data: User) => results.push(data))
    .on('end', async () => {
      console.log('CSV data loaded successfully');
      
      console.log("Starting browser in headed mode...");
      const browser = await puppeteer.launch({
        headless: false,
      });

      console.log("Creating new page...");
      const page = await browser.newPage();
      await page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      });

      console.log("Navigating to Table Demo...");
      await page.goto("http://localhost:3000");
      await sleep(2000);

      console.log("Initializing Midscene agent...");
      const agent = new PuppeteerAgent(page);

      // Fill table with each user from CSV
      for (const user of results) {
        console.log(`Adding user: ${user.name}`);
        
        // Use Midscene to fill the form
        await agent.aiAction(`
          在ID输入框中输入 "${user.id}",
          在Name输入框中输入 "${user.name}",
          在Age输入框中输入 "${user.age}",
          在Email输入框中输入 "${user.email}",
          在Phone输入框中输入 "${user.phone}"
        `);
        await sleep(1000);
        
        // Click save button
        await agent.aiAction('点击 "Save User" 按钮');
        await sleep(1000);
        
        console.log(`User ${user.name} added successfully`);
      }

      console.log("All users added. Keeping browser open for review.");
      // Wait for manual closure
      // await browser.close();
    });
};

// Main function to run everything
async function main() {
  // Create sample CSV data
  createSampleCsv();
  
  // Start the table demo web service
  startTableDemoService();
  
  // Wait for the web service to start
  await sleep(2000);
  
  // Start the puppeteer agent
  await startPuppeteerAgent();
}

// Run the main function
main().catch(console.error);
