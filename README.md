# Time Tracker – Workforce Management Web Application

**Time Tracker** is a full-stack web application. It helps employees and managers efficiently manage work hours, attendance, and leave requests.

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![DjangoREST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Jasmine](https://img.shields.io/badge/jasmine-%238A4182.svg?style=for-the-badge&logo=jasmine&logoColor=white)
![cypress](https://img.shields.io/badge/-cypress-%23E5E5E5?style=for-the-badge&logo=cypress&logoColor=058a5e)

## Features

- **Employee Dashboard:** Log daily working hours, track attendance, submit vacation and leave requests.  
- **Manager/Admin Dashboard:** Approve/reject leave requests, monitor team attendance, generate reports.  
- **Real-Time Updates:** Track work hours and leave requests instantly.  
- **Full-Stack Functionality:** Seamless integration between front-end and back-end.  
- **Testing:** Unit tests with Django, front-end end-to-end tests using Jasmine and Cypress.  
- **Deployment:** Back-end deployed on Azure and Supabase; front-end deployed on Netlify.

## Technologies Used

- **Front-End:** Angular, JavaScript, TypeScript, HTML, CSS  
- **Back-End:** Python, Django  
- **Database:** PostgreSQL, SQLite  
- **Deployment:** Azure, Supabase, Netlify  
- **Testing:** Jasmine, Cypress  
- **Version Control:** Git  
- **Development Tools:** VS Code, Linux, Windows

## Installation / Setup

1. Clone the repository:  
```bash
git clone <repository-url>
```
2. Navigate to the project directory:  
```bash
cd time-tracker
```
3. Install dependencies:  
- **Back-end:**  
```bash
pip install -r requirements.txt
```
- **Front-end:**  
```bash
npm install
```
4. Set up the database (PostgreSQL/SQLite) and configure environment variables.  
5. Run the back-end server:  
```bash
python manage.py runserver
```
6. Run the front-end:  
```bash
ng serve
```
7. Access the application at `http://localhost:4200`.

## Usage

- Employees can log in, view work hours, and submit leave requests.  
- Managers can approve/reject requests, monitor attendance, and generate reports.  
- Notifications alert employees when leave requests are approved or rejected.

## Testing

- **Back-End Unit Tests:**  
```bash
python manage.py test
```
- **Front-End End-to-End Tests:**  
```bash
npx cypress open
```

## Notes

This project was developed during an internship at NTT DATA to demonstrate practical application of coursework and programming skills in a real-world environment.
