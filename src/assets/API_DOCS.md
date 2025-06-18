# API Documentation

## Authentication Endpoints

### 1. Sign Up

- **Endpoint**: `POST /auth/signup`
- **Description**: Register a new user, once success, an OTP will be sent to the user's email.
- **Request Body**:
  - Form Data:

    ```json
    {
      "email": "string",
      "password": "string",
      "firstName": "string",
      "lastName": "string",
      "profileImage": "file (optional)" // Image file (jpg, jpeg, png, gif), max 5MB
    }
    ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "message": "User created successfully. Please check your email for verification.",
    }
  }
  ```

### 2. Verify OTP

- **Endpoint**: `POST /auth/verify-otp`
- **Description**: Verify the user by using the OTP received from the sign-up step.
- **Request Body**:
  - Form Data:

    ```json
    {
      "email": "string",
      "otp": "string"
    }
    ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
        "message": "Email verified successfully",
        "isEmailVerified": true
    }
  }
  ```

### 2.1 Resend OTP (if needed)

- **Endpoint**: `POST /auth/resend-verification-otp`
- **Description**: Resend the OTP to the user's email.
- **Request Body**:
  - Form Data:

    ```json
    {
      "email": "string"
    }
    ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
        "message": "Verification OTP sent successfully"
    }
  }
  ```

### 2. Login

- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get tokens
- **Request Body**:

  ```json
  {
    "email": "string",
    "password": "string",
    "token_expires_in": "string (optional)"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

### 3. Refresh Token

- **Endpoint**: `POST /auth/refresh-token`
- **Description**: Get new access token using refresh token
- **Request Body**:

  ```json
  {
    "refreshToken": "string",
    "token_expires_in": "string (optional)"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string", // New and fresh access token
      "refreshToken": "string", // New refresh token to be used later.
    }
  }
  ```

### 4. Forgot Password

- **Endpoint**: `POST /auth/forgot-password`
- **Description**: Ask for forgot password reset email, this will send email with reset password.
- **Request Body**:

  ```json
  {
    "email": "string"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
        "message": "Password reset email sent successfully"
    }
  }
  ```

### 5. Update User Profile

- **Endpoint**: `PUT /user/profile`
- **Description**: Update user's profile information
- **Authentication**: Required
- **Request Body**:
  - Form Data:

    ```json
    {
      "firstName": "string",
      "lastName": "string",
      "profileImage": "file (optional)" // Image file (jpg, jpeg, png, gif), max 5MB
    }
    ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "message": "Profile updated successfully",
      "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "profileImage": {
          "url": "string"
        },
        "isEmailVerified": boolean
      }
    }
  }
  ```

### 6. Get User Profile (My profile or someone else's profile)

- **Endpoint to get someone's profile**: `GET /user/profile/:userId`
- **Endpoint to get my own profile**: `GET /user/profile`
- **Description**: Get profile information of a user
- **Authentication**: Required
- **URL Parameters**:
  - `userId`: ID of the user whose profile to fetch
- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "profileImage": {
          "url": "string"
        },
        "isEmailVerified": boolean,
        "createdAt": "date"
      }
    }
  }
  ```

## Posts Endpoints

### 1. Get Posts

- **Endpoint**: `GET /posts`
- **Description**: Get paginated list of posts
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:

  ```json
  {
    "success": true,
    "data": [
      {
        // post data
      }
    ],
    "pagination": {
      "currentPage": number,
      "totalPages": number,
      "hasNextPage": boolean,
      "hasPrevPage": boolean,
      "totalItems": number,
      "limit": number
    }
  }
  ```

## Products Endpoints

### 1. Get Products

- **Endpoint**: `GET /products`
- **Description**: Get paginated list of products with filtering and sorting
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sortBy`: Field to sort by
  - `order`: Sort order ("asc" or "desc", default: "desc")
- **Response**:

  ```json
  {
    "success": true,
    "data": [
      {
        "title": "string",
        "description": "string",
        "price": number,
        "images": [{ "url": "string" }],
        "location": {
          "name": "string",
          "longitude": number,
          "latitude": number
        },
        "user": {
          "username": "string",
          "email": "string"
        },
        "createdAt": "date",
        "updatedAt": "date"
      }
    ],
    "pagination": {
      "currentPage": number,
      "totalPages": number,
      "hasNextPage": boolean,
      "hasPrevPage": boolean,
      "totalItems": number,
      "limit": number
    }
  }
  ```

### 2. Search Products

- **Endpoint**: `GET /products/search`
- **Description**: Search products by title and description
- **Authentication**: Required
- **Query Parameters**:
  - `query`: Search query string
- **Response**: Array of matching products

### 3. Get Product by ID

- **Endpoint**: `GET /products/:id`
- **Description**: Get detailed information about a specific product
- **Authentication**: Required
- **Response**: Product details

### 4. Create Product

- **Endpoint**: `POST /products`
- **Description**: Create a new product listing
- **Authentication**: Required
- **Request Body**:
  - Form Data:
    - `title`: Product title
    - `description`: Product description
    - `price`: Product price
    - `location`: Product location (JSON string or object)

      ```json
      {
        "name": "string",
        "longitude": number,
        "latitude": number
      }
      ```

    - `images`: Up to 5 product images (multipart/form-data)
- **Response**: Created product details

### 5. Update Product

- **Endpoint**: `PUT /products/:id`
- **Description**: Update an existing product listing
- **Authentication**: Required (only product owner)
- **Request Body**: Same as create product
- **Response**: Updated product details

### 6. Delete Product

- **Endpoint**: `DELETE /products/:id`
- **Description**: Delete a product listing
- **Authentication**: Required (only product owner)
- **Response**: Success message