# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Free Cloud Database - Recommended)

MongoDB Atlas offers a free tier that's perfect for this application.

### Steps:

1. **Create an Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0 Sandbox)
   - Select a cloud provider and region (choose one closest to you)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add only your server's IP address
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `pcf-calculator` (or any name you prefer)

6. **Add to .env file**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcf-calculator
   ```

## Option 2: Local MongoDB

If you prefer to run MongoDB locally:

1. **Install MongoDB**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod

   # On Windows
   # MongoDB should start automatically as a service
   ```

3. **Add to .env file**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pcf-calculator
   ```

## Verify Connection

After setting up, start your server:
```bash
npm run dev
```

You should see: `MongoDB Connected: ...` in the console if the connection is successful.

## Troubleshooting

- **Connection timeout**: Check your IP whitelist in MongoDB Atlas
- **Authentication failed**: Verify your username and password
- **Network error**: Ensure MongoDB is running (for local setup)


