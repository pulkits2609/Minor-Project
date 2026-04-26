# API Debugging Guide - 403 Error on PATCH /api/tasks/status

## Issues Fixed

### 1. **Missing CORS Configuration** ✅ FIXED

- **Problem**: Flask-CORS was in requirements.txt but not initialized in the app
- **Solution**: Added `CORS(app)` to `app/__init__.py`
- **Impact**: Enables cross-origin requests from frontend

### 2. **Unclear Error Messages** ✅ FIXED

- **Problem**: Generic "Unauthorized" error wasn't helpful for debugging
- **Solution**: Enhanced error messages in:
  - `app/utils/jwt_handler.py` - Better JWT error descriptions
  - `app/routes/tasks.py` - Includes user IDs in 403 error for debugging

### 3. **Ownership Check Logic** ✅ CONFIRMED WORKING

- **Issue**: Returns 403 if user is NOT assigned to the task
- **This is intentional**: Only the worker assigned to a task can update its status
- **Verify**: The `task.assigned_to` UUID must match the logged-in user's ID

---

## How to Test the Fix

### Step 1: Get a Valid JWT Token

```bash
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"worker@example.com","password":"password123"}'
```

Response will include a `token` field.

### Step 2: Check Which Tasks Are Assigned to You

```bash
curl -X GET http://localhost/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Copy a `task_id` from the response where `assigned_to` matches your user ID.

### Step 3: Update Task Status

```bash
curl -X PATCH http://localhost/api/tasks/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "task_id": "TASK_ID_FROM_STEP_2",
    "status": "in_progress"
  }'
```

### Valid Status Values

- `assigned`
- `in_progress`
- `completed`

---

## Common 403 Error Causes

### 1. **Wrong User Assigned to Task**

**Symptom**: 403 with "Forbidden - You can only update tasks assigned to you"
**Solution**: Only update tasks where `assigned_to` == your user ID

**Example Response**:

```json
{
  "error": "Forbidden - You can only update tasks assigned to you",
  "task_assigned_to": "550e8400-e29b-41d4-a716-446655440000",
  "your_user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

### 2. **Missing Authorization Header**

**Symptom**: 401 with "Missing or invalid Authorization header"
**Solution**: Send token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 3. **Expired Token**

**Symptom**: 401 with "Token has expired"
**Solution**: Get a new token via `/auth/login`

### 4. **Invalid JSON Body**

**Symptom**: 400 with "Request body must be JSON"
**Solution**: Ensure:

- Content-Type header is `application/json`
- Body is valid JSON with `task_id` and `status` fields

---

## API Endpoint Details

### Endpoint

```
PATCH /api/tasks/status
```

### Headers Required

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "task_id": "UUID_OF_TASK",
  "status": "in_progress"
}
```

### Success Response (200)

```json
{
  "status": "success",
  "message": "Task updated successfully",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "new_status": "in_progress"
}
```

### Error Response (403)

```json
{
  "error": "Forbidden - You can only update tasks assigned to you",
  "task_assigned_to": "550e8400-e29b-41d4-a716-446655440000",
  "your_user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

---

## Changes Made

### Modified Files

1. **app/**init**.py**
   - Added: `from flask_cors import CORS`
   - Added: `CORS(app)` initialization

2. **app/utils/jwt_handler.py**
   - Enhanced error messages for better debugging
   - Handles: Missing headers, expired tokens, invalid tokens

3. **app/routes/tasks.py**
   - Better 403 error response with debugging info
   - Added input validation for request body
   - More detailed success response

---

## Testing with Postman

1. **Login**: POST to `/auth/login` with credentials
2. **Copy Token**: From login response
3. **Set Authorization**: In Postman request → Authorization tab → Bearer Token
4. **Send PATCH**: To `/api/tasks/status` with task body
5. **Check Response**: Should be 200 for success, 403 with details if error

---

## Still Having Issues?

1. ✅ Restart the backend server: `python run.py`
2. ✅ Verify JWT_SECRET_KEY is set in `.env.local`
3. ✅ Check DATABASE_URL is correct in `.env.local`
4. ✅ Ensure you're updating a task assigned to your user ID
5. ✅ Check browser console for CORS errors (should be fixed now)
