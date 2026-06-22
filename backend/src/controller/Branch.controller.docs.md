# Branch Controller Documentation

File: `backend/src/controller/Branch.controller.ts`

This controller manages branch creation and retrieval under a specific tutorial.

## Handlers / Routes

> **Authentication required**: `createBranch` expects `req.user._id` to be present (typically added by your auth middleware).

### 1) `createBranch`
Creates a new branch under an existing tutorial for the currently authenticated user.

**Request**
- Method: `POST` (route mounted by your router)
- Body:
  - `branchName: string` (required)
  - `address: string` (required)
  - `tutorialName: string` (required)

**Validations & Status Codes**
- `401` if `req.user` or `req.user._id` is missing
  - (Current implementation relies on `req.user?._id` in the Tutorial lookup; you should enforce 401 in routing/middleware so `req.user` is always set.)
- `400` if any required field is missing/blank
  ```json
  {
    "success": false,
    "message": "Branch name, address, and tutorial name are required."
  }
  ```
- `404` if the tutorial is not found for the given `tutorialName` and current user
  ```json
  {
    "success": false,
    "message": "The specified tutorial was not found. Please create the tutorial first."
  }
  ```
- `409` if a branch with the same `branchName` already exists for that tutorial
  ```json
  {
    "success": false,
    "message": "A branch with this name already exists for this tutorial.",
    "data": { "/* existing branch document */" }
  }
  ```
- `500` on unexpected errors while creating the branch
  ```json
  {
    "success": false,
    "message": "An internal server error occurred while instantiating the branch metadata."
  }
  ```

**Success Response**
- `201`
  ```json
  {
    "success": true,
    "message": "Branch structure instantiated successfully.",
    "data": { /* created Branch document */ }
  }
  ```

**Behavior**
1. Trims `branchName`, `address`, and `tutorialName`.
2. Validates required fields are non-empty.
3. Looks up the tutorial:
   - `Tutorial.findOne({ owner: req.user?._id, name: trimmedTutorialName })`
4. Ensures branch uniqueness:
   - `Branch.findOne({ tutorial: tutorial._id, branchName: trimmedBranchName })`
5. Creates `Branch` with:
   - `branchName`, `address`, `tutorial: tutorial._id`

---

### 2) `getBranchDetails`
Fetches all branches under the tutorial specified by `tutorialName`.

**Request**
- Method: `GET` (route mounted by your router)
- Body:
  - `tutorialName: string` (required)

> Note: The current implementation reads `tutorialName` from `req.body`, even though the handler is described as `GET`. Your router/client must send a JSON body for this to work.

**Validations & Status Codes**
- `400` if `tutorialName` / tutorial is missing
  ```json
  {"success": false, "message": "Tutorial is required."}
  ```

**Success Response**
- `200`
  ```json
  {
    "success": true,
    "message": "Successfully fetched all the branches under this Tutorial",
    "data": [ /* list of Branch documents */ ]
  }
  ```

**Behavior**
1. Trims `tutorialName`.
2. Finds the tutorial by name:
   - `Tutorial.findOne({ name: trimmedTutorialName })`
3. Fetches branches for the tutorial:
   - `Branch.find({ tutorial: tutorial._id })`

---

## Exports
- `createBranch`
- `getBranchDetails`

