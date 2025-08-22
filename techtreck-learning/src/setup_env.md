# Angular Environment Setup — All-in-One Single Code Block

```bash
# Step 1: Install dependencies
npm install

# Step 2: Create environments folder
mkdir -p src/environments

# Step 3: Create environment.ts file
cat > src/environments/environment.ts << EOF
// src/environments/environment.ts
// Default environment settings (development)

export const environment = {
  production: false, // false for dev mode
  apiUrl: 'https:/dummy-website.azurewebsites.net', // API base URL
};

# for manager_flow.cy.ts
// Test environment settings

// NOTE: These accounts MUST exist ONLY in your local/test database.
// They should NEVER be created, synced, or accessible in production.
export const environmentTest = {
  managerEmail: 'manager.email@example.com',
  managerPassword: 'managerPassword123',
  adminEmail : 'admin.email@example.com',
  adminPassword: 'adminPassword123'
};
EOF
