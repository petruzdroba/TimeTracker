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
EOF

# Summary:
# - npm install dependencies
# - mkdir src/environments
# - create environment.ts  with the above content
