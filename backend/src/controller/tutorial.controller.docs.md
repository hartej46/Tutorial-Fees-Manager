# Tutorial Controller Documentation

File: `backend/src/controller/Tutorial.controller.ts`

This controller manages the authenticated user's tutorial profile.

## Handlers / Routes

> **Authentication required**: Both handlers expect `req.user._id` to be present (typically added by an auth middleware).

### 1) `createTutorial` 
Creates a tutorial profile for the currently authenticated user.

**Request**
- Method: `POST` (route mounted by your router)
- Body:
  - `name: string` (required)

**Validations & Status Codes**
- `401` if `req.user` or `req.user._id` is missing
  ```json
  {"success": false, "message": "Unauthorized request. User authentication missing."}
  ```
- `400` if `name` is missing or blank
  ```json
  {"success": false, "message": "Please provide a valid tutorial name."}
  ```
- `409` if the user already has a tutorial profile
  ```json
  {
    "success": false,
    "message": "You have already created a tutorial profile. Multi-tenant tutorial hosting requires account upgrades."
  }
  ```
- `500` if the tutorial document is not created
  ```json
  {"success": false, "message": "An internal server error occurred while instantiating the tutorial metadata."}
  ```

**Success Response**
- `201`
  ```json
  {
    "success": true,
    "message": "Tutorial structure instantiated successfully.",
    "data": { /* created Tutorial document */ }
  }
  ```

**Behavior**
1. Checks authentication (`req.user._id`).
2. Validates `name`.
3. Ensures a tutorial profile does not already exist for `owner: req.user._id`.
4. Creates `Tutorial` with:
   - `name: name.trim()`
   - `owner: req.user._id`

---

### 2) `getMyTutorialProfile`
Fetches the tutorial profile owned by the currently authenticated user.

**Request**
- Method: `GET` (route mounted by your router)

**Status Codes & Responses**
- `401` if `req.user` or `req.user._id` is missing
  ```json
  {"success": false, "message": "Unauthorized request."}
  ```

- `404` if no tutorial profile exists for the user
  ```json
  {
    "success": false,
    "message": "No tutorial registration details found for this active user identity.",
    "hasSetupTutorial": false
  }
  ```

- `200` on success
  - Uses `.populate("owner", "-password -refreshToken")` to exclude sensitive fields from the populated owner.
  ```json
  {
    "success": true,
    "message": "Tutorial configuration payload resolved successfully.",
    "data": { /* Tutorial document with populated owner */ },
    "hasSetupTutorial": true
  }
  ```

**Exports**
- `createTutorial`
- `getMyTutorialProfile`

