A simple RESTful CRUD API using Node.js, Hapi, MongoDB and JWT
==============================================================

Getting Started
---------------

## Prerequisite

Before running the TW-API make sure that:
- You have **MongoDB** installed on your machine
- You have **Python 2.x**

**NOTE:** `bcrypt` uses `node-gyp` as a dependency which in turn requires Python 2.x to build.

If you use Python 3.x by default, you must install **Python 2.x** in parallel and configure NPM to point towards the `python2` binary.

After having cloned the repo, you can either pass the `--python` option to `npm install`:

```bash
npm install --python /path/to/python2.7
```

or configure NPM to use the `python2` binary:

```bash
npm config set python /path/to/python2.7
```

## Installation

```bash
# Clone the repo
git clone https://github.com/eakl/tw-api
cd tw-api

# Install dependencies
npm install

# Start the server
npm start
```

## Usage

Once the server has started, you can use this simple API with [cURL](https://curl.haxx.se/docs/httpscripting.html) or [Postman](https://www.getpostman.com/)

### Home

```bash
curl http://localhost:8080/
```

Returns:

```
Welcome to TW API v1.
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
