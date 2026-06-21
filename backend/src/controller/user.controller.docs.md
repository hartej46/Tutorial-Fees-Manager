# User Controller Documentation

File: `backend/src/controller/user.controller.ts`

This controller handles user registration and login using JWT access tokens and refresh tokens stored in HTTP-only cookies.

## Imports
- `options` from `../constants`: cookie settings used for `accessToken` and `refreshToken`.
- `User`, `UserType` from `../model/User.model`: Mongoose user model + inferred document type.
- `asyncHandler` from `../utils/asyncHandler`: wrapper to forward async errors to Express error handling.
- `Request`, `Response` from `express`.
- `Types` from `mongoose`.

## Types
### `token`
Represents the pair of JWT tokens generated for a user.
- `refreshToken: string`
- `accessToken: string`

### `CustomRequest`
Extends Express `Request` and optionally attaches the authenticated user.
- `user?: any`

> Note: In this file, `CustomRequest` is declared but not directly used in the exported handlers.

## Functions

### `createRefreshAccessToken(id: Types.ObjectId): Promise<token>`
Creates a new access token and refresh token for the given user id.

**Flow**
1. Fetches the user by id: `User.findById(id)`.
2. If user does not exist, throws: `Error("User not found")`.
3. Generates:
   - `accessToken` via `user.generateAccessToken()`
   - `refreshToken` via `user.generateRefreshToken()`
4. Stores the new refresh token on the user document: `user.refreshToken = refreshToken` and saves the user.
5. Returns `{ refreshToken, accessToken }`.

**Dependencies**
- `User.generateAccessToken()`
- `User.generateRefreshToken()`

**Error behavior**
- Throws if the user is missing.

---

### `createUser(req: Request, res: Response): Promise<Response>`
Registers a new user and sets cookies with newly generated tokens.

**Request body**
- `name: string`
- `email: string`
- `password: string`

**Validation**
- If any of `name`, `email`, or `password` is missing/empty after `trim()`, responds with:
  - `400` and `{ success: false, message: "Please give correct input." }`

**Behavior**
1. Checks if a user already exists by email: `User.findOne({ email })`.
2. If found, responds with:
   - `409` and `{ success: false, message: "User already exist" }`
3. Creates the user:
   - `User.create({ name, email, password })`
4. If creation fails unexpectedly, responds with:
   - `500` and `{ success: false, message: "Something went wrong internally." }`
5. Generates tokens via `createRefreshAccessToken(newUser._id)`.
6. Saves the refresh token on the new user document.

**Response**
- On success: `200` with
  - `{ success: true, message: "User created successfully" }`

> Note: This handler currently does **not** set cookies in the response.

---

### `login(req: Request, res: Response): Promise<Response>`
Authenticates a user using email + password and sets JWT cookies.

**Request body**
- `email: string`
- `password: string`

**Behavior**
1. Fetches user by email: `User.findOne({ email })`
2. If user not found, responds:
   - `401` and `{ success: false, message: "Wrong email id, pls check again" }`
3. Verifies password:
   - `user.isPasswordCorrect(password)`
4. If password invalid, responds:
   - `401` and `{ success: false, message: "Password is incorrect" }`
5. Generates tokens via `createRefreshAccessToken(user._id)`.
6. Sets cookies:
   - `accessToken` cookie
   - `refreshToken` cookie

Cookies use `options` from `backend/src/constants.ts`.

**Response**
- On success: `200` and
  - `{ success: true, message: "Logged in SuccessFully" }`

---

## Exports
- `createRefreshAccessToken`
- `login`

> Note: `createUser` is currently **not exported** from this controller file.

