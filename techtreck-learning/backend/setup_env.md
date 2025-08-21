# Django Setup with Environment Variables and Local `env.py`

```bash
# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# OR
venv\Scripts\activate      # Windows

# 2. Install Django
pip install django

# 3. Create env.py 

import os

os.environ["AZURE_DOMAIN"] = "https://your-azure-app.azurewebsites.net,https://your-frontend.netlify.app"
os.environ["DJANGO_ALLOWED_HOSTS"] = "your-frontend.netlify.app,localhost,your-azure-app.azurewebsites.net"
os.environ["DJANGO_CORS_ALLOWED_ORIGINS"] = "https://your-frontend.netlify.app"
os.environ["DJANGO_DEBUG"] = "True"
os.environ["DJANGO_SECRET_KEY"] = "your-local-dev-secret-key"
os.environ["SUPABASE_DB_PASSWORD"] = "your-password"

# 5. Run your Django project

python manage.py runserver

# *6. Run Django tests

python manage.py test
```
