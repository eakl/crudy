A simple RESTful CRUD API
=========================

## Prerequisite

Before running CRUDY make sure that you have **MongoDB** installed on your machine

## Installation

```bash
# Install Yarn
brew update
brew install yarn

# Clone the repo
git clone https://github.com/eakl/crudy
cd crudy

# Install dependencies
yarn

# Run tests
yarn test

# Start the server
yarn start
```

## Usage

Once the server has started, you can use this simple API with [cURL](https://curl.haxx.se/docs/httpscripting.html) or [Postman](https://www.getpostman.com/)

### Home

```bash
curl http://localhost:8080/
```

Returns:

```
Welcome to CRUDY v1.
```

### Signup

Adds a user to the database.  
Choose *YOUR_USERNAME* and *YOUR_PASSWORD*.  


```bash
curl http://localhost:8080/signup \
-X POST \
-H "Content-Type:application/json" \
-d '{"username":"YOUR_USERNAME", "password": "YOUR_PASSWORD"}'
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "username": YOUR_USERNAME,
  "password": YOUR_PASSWORD
}
```

### Login

Gets an access token for a given registered user.  
Replace *YOUR_USERNAME* and *YOUR_PASSWORD*.

```bash
curl http://localhost:8080/login \
-X GET \
-u YOUR_USERNAME:YOUR_PASSWORD
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "username": YOUR_USERNAME,
  "token": ACCESS_TOKEN
}
```

### List all the users

Lists all the users registered in the database.  
Replace *ACCESS_TOKEN*.

```bash
curl http://localhost:8080/user \
-X GET \
-H "Authorization: ACCESS_TOKEN"
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "users": EXISTING_USERS
}
```

### Get information about a user

Gets the information about a given user.  
Replace *USER* and *ACCESS_TOKEN*

```bash
curl http://localhost:8080/user/USER \
-X GET \
-H "Authorization: ACCESS_TOKEN"
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "user": USER_INFO
}
```

### Update a user information

Updates the information of a given user. You can only update your information if you're not admin.  
Replace *USER*, *ACCESS_TOKEN* and the KEY/VALUE pairs you want to update.

Available updates:
- `username` -- change the username of a user
- `password` -- change the password of a user
- `isAdmin` -- change the right of a user (only admins have access to this command)

```bash
curl http://localhost:8080/user/USER \
-X PATCH \
-H "Authorization: ACCESS_TOKEN" \
-H "Content-Type:application/json" \
-d '{"KEY_TO_UPDATE": "VALUE_TO_UPDATE"}'
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "user": UPDATED_USER_INFO,
  "delta": DELTA
}
```

### Delete a user

Deletes a user. You can only delete yourself if you're not admin.  
Replace *USER* and *ACCESS_TOKEN*

```bash
curl http://localhost:8080/user/USER \
-X DELETE \
-H "Authorization: ACCESS_TOKEN"
```

Returns:

```
{
  "message": SUCCESS_MESSAGE,
  "user": DELETED_INFO
}
```
