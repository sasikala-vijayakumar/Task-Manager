Complete task management application with role-based access control

## Description

Initial release of Task Manager - a full-stack web application for managing tasks with
role-based hierarchical access control. This includes a complete backend API with
PostgreSQL database, and a modern React frontend with Redux state management.

## Features

### Core Functionality
- User authentication with JWT tokens and refresh token rotation
- Task creation, assignment, and management
- Role-based dashboard system (Employee, Team Lead, Admin)
- Task lifecycle management (Open, In Progress, Completed)
- User profile editing with password change capability

### Role-Based Hierarchy
- **Admin**: Full system access - manage all users, tasks, and teams
- **Team Lead**: Team-scoped management - manage tasks within their team
- **Employee**: Personal task access - view and work on assigned tasks

### Backend Features
- Express.js REST API with PostgreSQL database
- JWT authentication with access and refresh tokens
- Role-based middleware for endpoint authorization
- Query-level role filtering for data isolation
- Comprehensive error handling and validation
- Database schema with users, tasks, and refresh tokens tables

### Frontend Features
- Modern React application with Redux Toolkit state management
- Responsive component-based architecture
- Three specialized dashboards (Employee, Team Lead, Admin)
- Modal dialogs for task and user management
- Toast notifications for user feedback
- Pagination support on all data tables
- Password visibility toggle in login/profile forms
- Global profile editor accessible from all dashboards
- Modern gradient UI with consistent styling

### UI/UX Improvements
- Beautiful gradient authentication page with toggle between login and sign up
- Table-based layouts with modern styling
- Role badges and status indicators
- Conditional form fields based on user role
- Dependent dropdowns for team lead -> employee assignment
- Smooth transitions and hover effects

### Security Features
- Hierarchical role-based access control
- Team isolation for team leads
- Ownership validation for task modifications
- Token refresh mechanism for session management
- Password hashing with bcryptjs
- Environment variable protection via .env files
- Git ignore configuration to prevent accidental commits

## Technical Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- bcryptjs for password hashing
- express-validator for request validation
- JWT for authentication

### Frontend
- React 18
- Redux Toolkit for state management
- CSS-in-JS for component styling
- React hooks for state management
- Responsive design patterns

