# SAMS - Smart Academic Management System

SAMS is a scalable academic management platform designed to streamline teaching, learning, assessment, and grading workflows within universities.

The system enables instructors and students to manage courses, assignments, quizzes, meetings, academic resources, and grades through a unified platform similar to Google Classroom and Microsoft Teams.

Additionally, the platform integrates AI-powered plagiarism detection services to identify similarities between assignment submissions and support academic integrity.


---

## Features

### Authentication & Authorization

* JWT Access Token Authentication
* Opaque Refresh Token Mechanism
* Passport.js Authentication Strategies
* Role-Based Access Control (RBAC)
* Secure Session Management

---

### Admin Dashboard

* User & Role Administration
* Manage Users
* Create New Users
* Activate / Deactivate User Accounts
* Change User Roles
* View All Roles

---

### Instructor Features

#### Course Management

* Create and Manage Courses
* Publish Announcements and Posts
* Upload Learning Materials
* Schedule and Manage Online Meetings

#### Assignments

* Create Assignments
* Upload Assignment Resources
* Review Student Submissions
* Automatic Grading for Non-Plagiarized Submissions
* AI-Assisted Plagiarism Detection and Review Workflow
* Manual Review for Submissions Exceeding the Similarity Threshold

#### Quizzes & Assessments

* Create Quizzes with Multiple Question Types:

    * Multiple Choice Questions (MCQ)
    * True / False
    * Written Questions
* Schedule Quizzes to Start at a Specific Time
* Automatic Grading for MCQ and True/False Questions
* Manual Grading for Written Questions

#### Grade Management

* View Grade Tables for All Students
* Export Grades to Excel
* Import Grades from CSV Files
* Support External Assessments and Exams Through Grade Imports

---

### Student Features

#### Course Participation

* Join Courses
* View Course Materials
* Participate in Announcements and Discussions

#### Assignments

* Submit Assignment Solutions as Files
* Track Assignment Status

#### Meetings

* Join Scheduled Online Sessions

#### Quizzes

* Take Scheduled Quizzes
* View Quiz Results and Grades

#### Academic Profile

* View Grades Across All Course Classworks
* Track Academic Performance Within Each Course

---

### AI-Powered Similarity Detection

The platform integrates with external FastAPI services to detect similarities between assignment submissions.

Features include:

* Assignment-Level AI Activation (On/Off)
* Instructor-Defined Similarity Threshold
* Automatic Comparison of Student Submissions
* Similarity Percentage Reporting
* Detection of Potentially Duplicated Assignment Solutions

---

## System Architecture

The system follows a `modular` architecture built with NestJS.

### Core Modules

* Authentication & Authorization
* Users & Roles
* Admin Dashboard
* Courses
* Enrollments
* Announcements
* Comments
* Materials
* Assignments
* Assignment Submissions
* Quizzes
* Questions
* Quiz Submissions
* Grades
* Meetings
* Similarity Detection
* Mail & Notifications
* AWS S3 Integration

---

## Tech Stack

### Backend

* Node.js
* NestJS
* Passport.js
* JWT Authentication

### Database

* MongoDB
* MongoDB Aggregation Pipeline

### Caching & Background Processing

* Redis
* BullMQ

### File Storage

* AWS S3 Bucket
* CloudFront CDN

### AI Services

* FastAPI

### Infrastructure & Deployment

* Docker
* Docker Compose
* Azure Virtual Machine (VM)

### Documentation

* Swagger (OpenAPI)

---

## Project Structure

```txt
src
├── common
│   ├── constants
│   ├── decorators
│   ├── dto
│   ├── enums
│   ├── exceptions
│   ├── filters
│   ├── schemas
│   └── utils
│
├── modules
│   ├── admin
│   ├── announcements
│   ├── assignment-submissions
│   ├── assignments
│   ├── auth
│   ├── cache
│   ├── comments
│   ├── courses
│   ├── database
│   ├── enrollments
│   ├── grades
│   ├── instructor
│   ├── mail
│   ├── materials
│   ├── meeting
│   ├── questions
│   ├── quiz
│   ├── quiz-submissions
│   ├── roles
│   ├── s3
│   ├── similarity
│   └── users
│
├── app.module.ts
└── main.ts
```

---

## Database Design

The database schema and entity relationships can be found in:

```txt
docs/database-design/sams-erd.pdf
docs/database-design/sams-erd.png
```

---

## API Documentation

Swagger documentation is available after running the application:

```txt
http://localhost:3000/api/docs
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd sams-api
```

### Create Environment File

Create a `.env` file in the project root and configure the following variables:

```env
# Environment

NODE_ENV=
PORT=

# Initial Admin

INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=
INITIAL_ADMIN_NAME=
INITIAL_ADMIN_ID=000000001

# MongoDB

MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGODB_URI=

# JWT

JWT_ACCESS_TOKEN_SECRET=
JWT_ACCESS_TOKEN_EXPIRATION_MS=
JWT_REFRESH_TOKEN_SECRET=
JWT_REFRESH_TOKEN_EXPIRATION_MS=

# Redis

REDIS_HOST=
REDIS_PORT=

# Mail

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=

# AI Similarity Detection

WEBHOOK_URL=
PLAGIARISM_WEBHOOK_SECRET=
PLAGIARISM_CHECK_URL=
PLAGIARISM_CHECK_DELAY_AFTER_DUE_DATE=

# Agora

AGORA_APP_ID=
AGORA_APP_CERTIFICATE=

# AWS S3

BUCKET_NAME=
BUCKET_REGION=
ACCESS_KEY=
SECRET_ACCESS_KEY=
BASE_CLOUDFRONT_URL=
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run start:dev
```

### Run with Docker

```bash
docker compose up -d
```

---

## Highlights

* Role-Based Academic Management Platform
* JWT Authentication with Access & Refresh Tokens
* Admin Dashboard for User and Role Management
* Quiz Scheduling and Automatic Grading
* Excel & CSV Grade Management
* AWS S3 & CloudFront File Storage
* Redis Caching and BullMQ Background Jobs
* MongoDB Aggregation Pipelines
* AI-Powered Assignment Similarity Detection
* Dockerized Deployment on Azure VM
* Modular and Scalable NestJS Architecture
* Swagger API Documentation
* Real-Time Online Session Management with Agora


---

## Client Applications

The following repositories contain the client applications that integrate with this backend:

| Application | Description |
|-------------|-------------|
| [SAMS App](https://github.com/mohamed-dev-404/sams-app.git) | Flutter application for students and instructors. |
| [SAMS Dashboard](https://github.com/mohamed-dev-404/sams-dashboard.git) | Web-based dashboard for platform administration. |

---
