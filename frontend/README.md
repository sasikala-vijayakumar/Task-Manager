# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Role-Based Hierarchy Implementation

## Overview
The Task Manager application implements a three-tier role-based access control system with hierarchical permissions.

## Role Hierarchy

```
Admin (Highest)
    ↓
Team Lead
    ↓
Employee (Lowest)
```

## Roles & Permissions

### 1. ADMIN
- **Access Level**: Full system access
- **Permissions**:
  - View all users
  - Create/Edit/Delete users
  - View all tasks (across all teams)
  - Create tasks and assign to any employee under any team lead
  - Edit/Delete any task
  - Manage team assignments
  - Access admin dashboard with full controls

### 2. TEAM LEAD
- **Access Level**: Team-scoped access
- **Permissions**:
  - View only their team members (employees under their team)
  - Create tasks within their team only
  - Assign tasks only to employees in their team
  - Edit/Delete only tasks they created
  - View tasks assigned to them or created by them
  - Cannot create/edit/delete users
  - Cannot manage users outside their team
  - Access team lead dashboard with team-filtered controls

### 3. EMPLOYEE
- **Access Level**: Personal task access only
- **Permissions**:
  - View only tasks assigned to them
  - Start/Stop tasks assigned to them
  - Cannot create tasks
  - Cannot assign tasks
  - Cannot delete tasks
  - Access employee dashboard showing only their tasks

---

## Implementation Details

### Backend Implementation

#### 1. Middleware: `roleCheck.js`
**Location**: `backend/src/middleware/roleCheck.js`

```javascript
module.exports = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
  if (req.user.role === 'admin') return next();  // Admin bypasses all checks
  if (allowedRoles.includes(req.user.role)) return next();
  return res.status(403).json({ msg: 'Forbidden: insufficient role' });
};
```

**Key Feature**: Admin role automatically bypasses all role checks, allowing full system access.

#### 2. Route-Level Authorization

**Tasks Routes** (`backend/src/routes/tasks.js`):
- `POST /` - `roleCheck(['teamlead'])` - Only teamlead+ can create tasks
- `GET /` - No role check (handled at controller level)
- `POST /:id/assign` - `roleCheck(['teamlead'])` - Only teamlead+ can assign
- `PUT /:id` - `roleCheck(['teamlead'])` - Only teamlead+ can edit
- `DELETE /:id` - `roleCheck(['teamlead'])` - Only teamlead+ can delete

**Users Routes** (`backend/src/routes/users.js`):
- `GET /` - `roleCheck(['admin', 'teamlead'])` - Admin sees all users, teamlead sees team members
- `GET /team-members` - `roleCheck(['teamlead'])` - Teamlead only
- `POST /` - `roleCheck(['admin'])` - Admin only
- `PUT /:id` - `roleCheck(['admin'])` - Admin only
- `DELETE /:id` - `roleCheck(['admin'])` - Admin only

#### 3. Controller-Level Authorization

**Task Controller** (`backend/src/controllers/taskController.js`):

```javascript
// In create() - Team validation for teamlead
if (req.user.role === 'teamlead' && assignee.team !== req.user.team) {
  return res.status(403).json({ msg: 'Cannot assign outside your team' });
}

// In update() - Owner check
if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
  return res.status(403).json({ msg: 'You can only update your own tasks' });
}

// In delete() - Owner check
if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
  return res.status(403).json({ msg: 'You can only delete your own tasks' });
}
```

#### 4. Query-Level Authorization

**Task Model** (`backend/src/models/taskModel.js`):

```javascript
const findTasksForUser = async (user) => {
  const query = `
    SELECT t.*, u.name as assigned_name 
    FROM tasks t 
    LEFT JOIN users u ON t.assigned_to = u.id
  `;
  
  if (user.role === 'admin') {
    // Admin sees all tasks
    const res = await pool.query(query + ' ORDER BY t.created_at DESC');
    return res.rows;
  }
  
  if (user.role === 'teamlead') {
    // Teamlead sees tasks in their team or assigned to them
    const res = await pool.query(
      query + ' WHERE t.team=$1 OR t.assigned_to=$2 ORDER BY t.created_at DESC', 
      [user.team, user.id]
    );
    return res.rows;
  }
  
  // Employee sees only their assigned tasks
  const res = await pool.query(
    query + ' WHERE t.assigned_to=$1 ORDER BY t.created_at DESC', 
    [user.id]
  );
  return res.rows;
};
```

---

### Frontend Implementation

#### 1. Dashboard Router (`App.js`)

```javascript
function DashboardRouter({ user }) {
  if (user.role === 'employee') {
    return <EmployeeDashboard />;
  }
  if (user.role === 'teamlead') {
    return <TeamleadDashboard />;
  }
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <div>Unknown role</div>;
}
```

#### 2. Component-Level Conditional Rendering

**TaskModal** (`components/Modal.js`):
- Admin sees: Title, Description, Team Lead dropdown, Assignee dropdown (filtered by selected team lead)
- Teamlead sees: Title, Description, Assignee dropdown (only team members)
- Employee: Cannot create/edit tasks

**Dashboards**:
- **EmployeeDashboard**: Shows only assigned tasks with Start/Stop actions
- **TeamleadDashboard**: Shows team tasks with Create/Edit/Delete/Assign actions
- **AdminDashboard**: Shows all tasks and all users with full management capabilities

#### 3. Conditional Form Fields in TaskModal

```javascript
// Team Lead dropdown (Admin only)
{userRole === 'admin' && teamLeads && teamLeads.length > 0 && (
  <div>Team Lead selector</div>
)}

// Assignee filtering based on selected team lead (Admin only)
if (userRole === 'admin' && formData.team) {
  employees = employees.filter(emp => emp.team === formData.team);
} else if (userRole === 'admin') {
  employees = [];  // Require team selection first
}
```

---

## Authorization Flow Example

### Creating a Task as Team Lead

1. **Frontend**: Teamlead clicks "Create Task" → TaskModal opens
2. **Modal Validation**: UserRole = 'teamlead' → No team lead dropdown shown
3. **Employees List**: Filtered to show only team members
4. **User Selects**: Employee and clicks Save
5. **API Call**: POST `/api/tasks` with task data
6. **Backend Route**: `auth` → `roleCheck(['teamlead'])` → Controller
7. **Controller Validation**: Check if assignee belongs to teamlead's team
8. **DB Query**: Insert task with `team = assignee.team`
9. **Response**: Success or error

### Trying to Access Task Outside Team (Blocked)

1. **Frontend**: Teamlead tries to edit another team's task
2. **Backend Controller**: 
   ```
   if (req.user.role === 'teamlead' && task.team !== req.user.team) {
     return 403 Forbidden
   }
   ```
3. **Result**: Request rejected

---

## Security Features

1. **Admin Bypass**: Admin role automatically passes all role checks (line 5 of roleCheck.js)
2. **Team Isolation**: Teamleads cannot assign or view employees outside their team
3. **Ownership Validation**: Only creators (or admin) can edit/delete tasks they don't own
4. **Query-Level Filtering**: Database queries filter results based on user role
5. **Hierarchical Fallback**: If teamlead permission fails, only admin can proceed

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/middleware/roleCheck.js` | Core authorization middleware |
| `backend/src/controllers/taskController.js` | Task authorization logic |
| `backend/src/models/taskModel.js` | Query-level role filtering |
| `backend/src/routes/tasks.js` | Task endpoint authorization |
| `backend/src/routes/users.js` | User endpoint authorization |
| `frontend/src/App.js` | Dashboard routing by role |
| `frontend/src/components/Modal.js` | Form-level conditional rendering |
| `frontend/src/components/EmployeeDashboard.js` | Employee-only view |
| `frontend/src/components/TeamleadDashboard.js` | Teamlead-scoped view |
| `frontend/src/components/AdminDashboard.js` | Admin full-control view |

---

## Testing Role Hierarchy

### Test Scenario 1: Teamlead Assigning Outside Team
1. Login as teamlead of Team A
2. Try to create task and assign to employee in Team B
3. Expected: Form shows only Team A employees (frontend filtering)
4. If somehow bypassed: Backend returns 403 Forbidden

### Test Scenario 2: Employee Accessing Admin Features
1. Login as employee
2. Try to access `/api/users` endpoint
3. Expected: 403 Forbidden (no role match in roleCheck)

### Test Scenario 3: Admin Full Access
1. Login as admin
2. Can view all tasks, all users, all teams
3. Can assign employees to any team lead
4. All operations succeed due to admin bypass in roleCheck middleware
