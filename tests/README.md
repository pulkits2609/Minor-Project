# Coal Mine Management API - Test Suite Documentation

This directory contains automated functional and logic tests built using `pytest`. These test cases trace the main application endpoints and mathematical logic (such as DGMS Risk Scoring) without needing to connect to the live Supabase database. 

## How It Works (`conftest.py`)
To prevent test data from colliding with your live data, `conftest.py` overrides your `.env.local` settings and mounts a temporary, in-memory SQLite database just for the millisecond duration of the tests.

## Running the Tests
If your virtual environment is active, you can trigger all tests by running:
```bash
pytest tests/
```

---

## Breakdown of Test Cases (`test_routes.py`)

### Authentication & General Routes
*   **`test_health_check`**: A simple sanity test checking that the Flask factory pattern boots successfully (returns 200).
*   **`test_login_stub`**: Validates that standard POST payloads to `/auth/login` map to the function.
*   **`test_register_stub`**: Ensures creating a new hierarchy-based user account maps correctly and responds with a `201 Created` code.
*   **`test_get_profile_stub`**: Validates fetching the logged-in user profile payload.

### Shift Management & Operator Logs
*   **`test_create_shift_log`**: Asserts that new shift schedule creation logs are accepted under standard formatting.
*   **`test_shift_check_in` & `test_shift_check_out`**: Two distinct tests evaluating the worker attendance punch-system endpoints.
*   **`test_digital_shift_handover_report_generation`**: The largest integration test. It feeds mock supervisor data (Production stats, Equipment logic, Output flags) to the `/shifts/handover` API endpoint. It verifies a successful database response (`201 Created`) and actively traverses the physical hard drive to assert that `reportlab` correctly generated and dropped a formatted PDF log on your machine before auto-deleting it.

### DGMS Safety Management Plan Rules
*   **`test_report_general_incident` & `test_get_incidents`**: Asserts that general-purpose logging data writes and loads properly without crashing.
*   **`test_smp_hazard_scoring_critical`**: Simulates a high-level hazard by injecting a `Probability of 4` and `Consequence of 4`. **Crucially, this tests the underlying math equation.** It mathematically verifies that the backend output equals a `16` Risk Score and automatically switches the `requires_immediate_action` alert flag to `True`.
*   **`test_smp_hazard_scoring_minor`**: Tests the safe threshold of the scoring algorithm to make sure lower numbers do NOT trigger emergency safety mechanisms.
*   **`test_smp_dashboard_fetch`**: Verifies that the Safety Officer Dashboard analytics successfully aggregate array data.
*   **`test_review_incident`**: Tracks PUT methods to verify Supervisors can overwrite existing statuses (e.g. tracking "Open" hazards to "Closed").

### Worker & Job Task Logistics
*   **`test_assign_worker_task`**: Checks the `/tasks/` POST endpoint where a Supervisor dispatches a job directly mapped to a specific worker ID.
*   **`test_fetch_worker_tasks`**: Simulates the Worker's active view fetching all their assigned daily tasks.
*   **`test_worker_update_task`**: Validates a Worker hitting the PUT endpoint to transition their assignment lifecycle (e.g. moving a task from 'Pending' to 'Completed').
