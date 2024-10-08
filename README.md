# Table of Contents

- [MEAN Chat Documentation](#mean-chat-documentation)
  - [Git Repository Organization and Version Control Approach](#git-repository-organization-and-version-control-approach)
    - [Version Control Approach](#version-control-approach)
  - [Installation and Setup Instructions](#installation-and-setup-instructions)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2.  Setting Up the Client (Angular Application)](#2--setting-up-the-client-angular-application)
    - [3. Setting Up the Server (Node.js Application)](#3-setting-up-the-server-nodejs-application)
    - [4. Running End-to-End (E2E) Tests with Cypress](#4-running-endtoend-e2e-tests-with-cypress)
    - [5. Install MongoDB](#5-install-mongodb)
    - [Windows](#windows)
    - [5. Configuring MongoDB for MEAN-Chat Application](#5-configuring-mongodb-for-meanchat-application)
      - [1. Create the Database](#1-create-the-database)
      - [2. Create Collections](#2-create-collections)
      - [3. Verify Collections](#3-verify-collections)
    - [Additional Information](#additional-information)
  - [Main Data Structures](#main-data-structures)
    - [Client-Side Data Structures](#clientside-data-structures)
  - [Server-Side Data Structures](#serverside-data-structures)
    - [Server-Side Models](#serverside-models)
  - [Angular Architecture](#angular-architecture)
    - [Components](#components)
    - [Services](#services)
    - [Models](#models)
    - [Routes](#routes)
  - [Node Server Architecture](#node-server-architecture)
    - [Server Folder Structure](#server-folder-structure)
    - [Route Definitions](#route-definitions)
      - [`user.route.js`](#userroutejs)
      - [`group.route.js`](#grouproutejs)
      - [`channel.routes.js`](#channelroutesjs)
      - [`auth.route.js`](#authroutejs)

# MEAN Chat Documentation

## Git Repository Organization and Version Control Approach

The Git repository is organized into two main directories:
- **`client/`**: Contains the Angular front-end application.
- **`server/`**: Contains the Node.js back-end server.

### Version Control Approach
- **Branching Strategy**: All work was done on a single main branch as this is an individual project, with no need for complex Git operations like feature or bug branches.
- **Commit Frequency**: Commits were made whenever a quantifiable feature was completed, allowing for easy tracking of progress and a clear history of changes.
- **Push Frequency**: Pushing to the remote repository was done after completing and testing major functionalities to ensure that the code pushed was stable.


## Installation and Setup Instructions

To run this project locally, follow the steps below:

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/dwacochan/MEAN-Chat.git
```
### 2.  Setting Up the Client (Angular Application)

Navigate to the `/client` directory:

```bash
cd MEAN-Chat/client
```
Install the required dependencies:
```bash
npm install
```
Once the dependencies are installed, start the Angular development server:
```bash
ng serve
```
The Angular application will be available at http://localhost:4200.

**To run unit tests** for the Angular application, use:
```bash
ng test
```

### 3. Setting Up the Server (Node.js Application)

Navigate to the `/server` directory:
```bash
cd ../server
```
Start the Node.js server:
```bash
npm start
```
The server will be available at http://localhost:3000.

**To run server-side tests**, use:

```bash
npm run test
```

### 4. Running End-to-End (E2E) Tests with Cypress
Navigate back to the `/client` directory:

```bash
cd ../client
```
Run Cypress end-to-end tests using the following command:
```bash
npx cypress run
```
This command will execute the Cypress E2E test cases and display the results in the terminal.


### 5. Install MongoDB

### Windows

1. Download the MongoDB Community Edition installer from the [official MongoDB website](https://www.mongodb.com/try/download/community).
2. Run the installer and follow the on-screen instructions:
   - Choose the "Complete" setup type.
   - When prompted, select "Run service as Network Service user" to run MongoDB as a Windows service.
3. After installation, MongoDB should start automatically. If not, you can start it manually:
   - Open Command Prompt as an Administrator.
   - Run the following command to start the MongoDB service:
     ```bash
     net start MongoDB
     ```
4. To verify the installation, open a new Command Prompt window and run:
   ```bash
   mongo
   ```
If MongoDB is running correctly, you should see the MongoDB shell prompt (`>`).


### 5. Configuring MongoDB for MEAN-Chat Application

Once MongoDB is installed and running, follow these steps to set up the database for the MEAN-Chat application:

#### 1. Create the Database

Open a new Command Prompt (Windows) or Terminal (Mac) and launch the MongoDB shell by running:

```bash
mongo
```
Create a new database named `Frameworks-Assignment` by running the following command in the MongoDB shell:

This command will switch to the new database. If the database does not exist, MongoDB will create it.

Verify that the database is created by listing all available databases:

```bash
show dbs
```

#### 2. Create Collections

In the `Frameworks-Assignment` database, create the necessary collections for the MEAN-Chat application:

```bash
db.createCollection("channels")
db.createCollection("messages")
```

These collections will be used to store data related to channels and messages in the MEAN-Chat application.

#### 3. Verify Collections
To ensure the collections have been created, run the following command:

```bash
show collections
```
You should see the `channels` and `messages` collections listed in the output.

### Additional Information
- **Client Development Server**: http://localhost:4200
- **API Server**: http://localhost:3000

## Main Data Structures

### Client-Side Data Structures

- **`User`**: Represents users with attributes such as:
  - **Attributes**:
    - `id`: A unique identifier for the user.
    - `username`: The user's display name.
    - `email`: The user's email address.
    - `password`: The user's password.
    - `roles`: An array of roles associated with the user, such as `'user'` or `'admin'`.
    - `groups`: An array of group IDs that the user is a member of.
    - `interested`: An array of group IDs that the user has shown interest in.
    - `avatarPath`: A string path to the user's avatar image, defaulting to `/assets/avatar.jpg`.

  - **Example**:
    ```typescript
    const user = new User(
      '1',
      'john_doe',
      'john@example.com',
      'password123',
      ['user'],
      ['group1', 'group2'],
      ['group3'],
      '/assets/avatar.jpg'
    );
    ```

- **`Group`**: Represents a group with attributes such as:
  - **Attributes**:
    - `id`: A unique identifier for the group.
    - `name`: The name of the group.
    - `description`: A brief description of the group.
    - `admins`: An array of `User` objects representing the group admins.
    - `members`: An array of `User` objects representing the group members.
    - `channels`: An array of `Channel` objects representing the channels within the group.
    - `interested`: An array of `User` objects representing users who are interested in joining the group.
    - `banned`: An array of `User` objects representing users who are banned from the group.

  - **Example**:
    ```typescript
    const group = new Group(
      '1',
      'Developers Group',
      'A group for software developers to share knowledge and collaborate.',
      [adminUser],
      [memberUser1, memberUser2],
      [channel1, channel2],
      [interestedUser],
      [bannedUser]
    );
    ```

- **`Channel`**: Represents a communication channel within a group with attributes such as:
  - **Attributes**:
    - `id`: A unique identifier for the channel.
    - `name`: The name of the channel.
    - `groupId`: The ID of the group this channel belongs to.
    - `description`: A brief description of the channel.
    - `users`: An optional array of user IDs who are members of this channel.

  - **Example**:
    ```typescript
    const channel = new Channel(
      '1',
      'General Chat',
      'group1',
      'A channel for general discussions and announcements.',
      ['user1', 'user2', 'user3']
    );
    ```

- **`Message`**: Represents a message exchanged within a channel, with attributes such as:
  - **Attributes**:
    - `channelId`: The ID of the channel where the message was sent.
    - `userId`: The ID of the user who sent the message.
    - `message`: The content of the message.
    - `timestamp`: The date and time when the message was sent.
    - `uploadUrl`: An optional array of URLs pointing to uploaded files associated with the message.
    - `avatarPath`: A string path to the sender's avatar image.

  - **Example**:
    ```typescript
    const message = new Message(
      'channel1',
      'user1',
      'Hello, everyone! Welcome to the channel.',
      new Date(),
      ['/uploads/file1.png'],
      '/assets/avatar.jpg'
    );
    ```

## Server-Side Data Structures

The server-side data structures mirror the client-side models to maintain consistency across both client and server implementations. These classes are prepared for future server-side storage and database integration using MongoDB.

### Server-Side Models

- **`User`**
  - Represents a user in the system.
  - **Attributes**:
    - `id`: Unique identifier for the user.
    - `username`: The user's display name.
    - `email`: The user's email address.
    - `password`: The user's password.
    - `roles`: Array of roles assigned to the user, such as `'user'` or `'admin'`.
    - `groups`: Array of group IDs that the user is a member of.
    - `interested`: Array of group IDs that the user has shown interest in.
    - `avatarPath`: Path to the user's avatar image.

- **`Group`**
  - Represents a group with attributes to manage user memberships and associated channels.
  - **Attributes**:
    - `id`: Unique identifier for the group.
    - `name`: The name of the group.
    - `description`: A brief description of the group.
    - `admins`: Array of `User` objects representing group admins.
    - `members`: Array of `User` objects representing group members.
    - `channels`: Array of `Channel` objects representing channels within the group.
    - `interested`: Array of `User` objects representing users interested in joining the group.
    - `banned`: Array of `User` objects representing users banned from the group.

- **`Channel`**
  - Represents a communication channel within a group.
  - **Attributes**:
    - `id`: Unique identifier for the channel.
    - `name`: The name of the channel.
    - `groupId`: The ID of the group this channel belongs to.
    - `description`: A brief description of the channel.
    - `users`: Optional array of user IDs who are members of this channel.

- **`Message`**
  - Represents a message exchanged within a channel.
  - **Attributes**:
    - `channelId`: The ID of the channel where the message was sent.
    - `userId`: The ID of the user who sent the message.
    - `message`: The content of the message.
    - `timestamp`: Date and time when the message was sent.
    - `uploadUrl`: Optional array of URLs pointing to files associated with the message.


## Angular Architecture

### Components

- **`LoginComponent`**
  - **Files**: `login.component.ts`, `login.component.html`, `login.component.css`, `login.component.spec.ts`
  - **Description**: Manages the login form, validating user input and interacting with the `AuthService` to simulate authentication.

- **`RegisterComponent`**
  - **Files**: `register.component.ts`, `register.component.html`, `register.component.css`, `register.component.spec.ts`
  - **Description**: Handles user registration by collecting data and using the `AuthService` to demonstrate the registration flow.

- **`DashboardComponent`**
  - **Files**: `dashboard.component.ts`, `dashboard.component.html`, `dashboard.component.css`, `dashboard.component.spec.ts`
  - **Description**: Serves as the main user interface post-login, displaying groups and channels the user is part of.

- **`GroupComponent`**
  - **Files**: `group.component.ts`, `group.component.html`, `group.component.css`, `group.component.spec.ts`
  - **Description**: Displays and manages group details, allowing users to view members, join groups, or interact with associated channels.

- **`ChannelComponent`**
  - **Files**: `channel.component.ts`, `channel.component.html`, `channel.component.css`, `channel.component.spec.ts`
  - **Description**: Manages individual channel views, allowing user interactions within the channel.


### Services

- **`AuthService`**
  - **Description**: Handles authentication logic, including user login and registration by sending HTTP requests to the backend API. Manages user sessions and interactions with the `UserService`.

- **`UserService`**
  - **Description**: Manages user-related operations, such as retrieving user details, updating profiles, and handling user groups and interests. Works alongside `GroupService` due to shared attributes between users and groups.

- **`GroupService`**
  - **Description**: Manages group-related operations, including creating, updating, and deleting groups. Responsible for handling group memberships, channel management within groups, and promoting or demoting group members.

- **`ChannelService`**
  - **Description**: Facilitates channel operations, including creating, updating, and deleting channels within groups. Also manages adding and removing users from channels.

- **`PeerService`**
  - **Description**: Manages peer-to-peer connections for real-time features like video calls or direct messaging. Establishes connections and handles data transfer protocols between users.

- **`SocketService`**
  - **Description**: Manages WebSocket connections for real-time communication features such as live chat and user presence notifications.

- **`UploadService`**
  - **Description**: Manages file upload and retrieval operations, facilitating user uploads for profiles, messages, and shared content within channels.


### Models

- **`User`**
  - **Files**: `user.model.ts`, `user.model.spec.ts`
  - **Description**: Defines the user data structure used across components and services, including attributes like `id`, `username`, `email`, `password`, `roles`, `groups`, and `interests`.

- **`Group`**
  - **Files**: `group.model.ts`, `group.model.spec.ts`
  - **Description**: Defines the group data structure, representing group details and managing associated channels and members. Attributes include `id`, `name`, `description`, `admins`, `members`, `channels`, `interests`, and `banned`.

- **`Channel`**
  - **Files**: `channel.model.ts`, `channel.model.spec.ts`
  - **Description**: Represents channels within groups, used to facilitate communication and user interactions within specific channels. Attributes include `id`, `name`, `groupId`, and `description`.

- **`Message`**
  - **Files**: `message.ts`, `message.spec.ts`
  - **Description**: Represents messages exchanged within channels, including content, sender, timestamp, and message status.


### Routes

The routing configuration in the Angular application maps paths to their corresponding components, enabling smooth navigation across various views.

- **Frontend Routes**:
  - **`/login`**: Routes to `LoginComponent`, where users can enter their credentials to log into the application.
  - **`/register`**: Routes to `RegisterComponent`, allowing users to create new accounts.
  - **`/dashboard`**: Routes to `DashboardComponent`, serving as the main landing page post-login, displaying groups and channels the user is part of.
  - **`/group/:id`**: Routes to `GroupComponent`, displaying the details of the selected group, including group description, members, and channels.
  - **`/channel/:groupId/:channelId`**: Routes to `ChannelComponent`, displaying a specific channel within the selected group, allowing users to view and send messages.

---

## Node Server Architecture

### Server Folder Structure

The server directory is structured to organize backend functionality into controllers, models, routes, and middleware. This separation of concerns ensures a modular and maintainable architecture.

- **`config/`**: Contains configuration files for the server, such as SSL certificates for secure communication.
  - `server.cert`, `server.key`: SSL certificates used for secure server communication.

- **`controllers/`**: Contains logic for handling incoming requests and processing data for each module.
  - **`auth.controller.js`**: Manages authentication operations, including user login and registration.
  - **`channel.controller.js`**: Manages operations related to channels, such as creating, retrieving, updating, and deleting channels.
  - **`group.controller.js`**: Manages operations related to groups, including group creation, membership management, and channel association within groups.
  - **`user.controller.js`**: Handles operations related to users, such as user profile management, group memberships, and role assignments.

- **`middleware/`**: Contains middleware functions for request processing and validation.
  - **`middleware.js`**: Middleware for handling authentication, error handling, and other request validation.

- **`models/`**: Defines data structures used on the server side.
  - **`channel.model.js`**: Represents the Channel entity, used to structure channel data for storage and retrieval.
  - **`group.model.js`**: Represents the Group entity, used to structure group data, including members and channels.
  - **`message.model.js`**: Represents the Message entity, used to structure messages exchanged in channels.
  - **`user.model.js`**: Represents the User entity, used to structure user data, including roles and group memberships.

- **`routes/`**: Defines the API routes exposed by the server.
  - **`auth.routes.js`**: Manages routes related to user authentication, such as login and registration.
  - **`channel.routes.js`**: Manages routes related to channel operations, such as retrieving, creating, updating, and deleting channels.
  - **`group.routes.js`**: Manages routes related to group operations, such as group retrieval, creation, updating, and membership management.
  - **`user.routes.js`**: Manages routes related to user operations, such as user profile management, group memberships, and roles.

- **`test/`**: Contains test scripts and mock data for unit and integration testing of the server.
  - **`auth.controller.test.js`**: Unit tests for authentication operations.
  - **`group.controller.test.js`**: Unit tests for group-related operations.
  - **`mockData.js`**: Mock data used in testing for consistent results.
  - **`socket.test.js`**: Unit tests for WebSocket-related operations.
  - **`user.controller.test.js`**: Unit tests for user-related operations.
  

- **`server.js`**: The main server entry point, responsible for setting up Express, initializing middleware, and connecting routes.

- **`initSuperUser.js`**: Script for initializing a superuser.

- **`socket.js`**: Manages WebSocket connections for real-time features such as chat and notifications.

- **`upload.js`**: Manages file upload functionality, including storing and retrieving uploaded files.

- **`users.json`**: JSON storage data for Users.

- **`groups.json`**: JSON storage data for Groups.

---

### Route Definitions

#### `user.route.js`

- **`GET /users`**
  - **Parameters:** None
  - **Return Value:** A JSON array of User objects
  - **Description:** Retrieves a list of all users in the system.

- **`POST /users`**
  - **Parameters:** A JSON object containing `password`, `username`, and `email`
  - **Return Value:** A JSON object of the newly created User
  - **Description:** Creates a new user with the provided `password`, `username`, and `email`.

- **`GET /users/:id`**
  - **Parameters:** `id` (the unique identifier of the user)
  - **Return Value:** A JSON object of the User with the specified ID
  - **Description:** Retrieves a user by their unique ID.

- **`POST /users/:id/update`**
  - **Parameters:** `id` (the unique identifier of the user) and a JSON object with updated user details (e.g., `password`, `username`, `email`)
  - **Return Value:** A JSON object of the updated User
  - **Description:** Updates the details of a user with the specified ID.

- **`DELETE /users/:id`**
  - **Parameters:** `id` (the unique identifier of the user)
  - **Return Value:** A confirmation message (e.g., "User deleted")
  - **Description:** Deletes a user by their unique ID.

- **`POST /users/:id/groups/:groupId`**
  - **Parameters:** `id` (user ID) and `groupId` (ID of the group to add)
  - **Return Value:** A JSON object of the updated User
  - **Description:** Adds a specified group to the user's list of groups.

- **`POST /users/:id/groups/:groupId/remove`**
  - **Parameters:** `id` (user ID) and `groupId` (ID of the group to remove)
  - **Return Value:** A JSON object of the updated User
  - **Description:** Removes a specified group from the user's list of groups.

- **`POST /users/:id/interests/:groupId`**
  - **Parameters:** `id` (user ID) and `groupId` (ID of the group of interest)
  - **Return Value:** A JSON object of the updated User
  - **Description:** Adds a specified group as an interest for the user.

- **`POST /users/:id/interests/:groupId/remove`**
  - **Parameters:** `id` (user ID) and `groupId` (ID of the group to remove from interests)
  - **Return Value:** A JSON object of the updated User
  - **Description:** Removes a specified group from the user's list of interests.

- **`POST /users/:id/promote`**
  - **Parameters:** `id` (user ID)
  - **Return Value:** A JSON object of the updated User with promoted status
  - **Description:** Promotes the specified user to a higher role.

- **`POST /users/:id/demote`**
  - **Parameters:** `id` (user ID)
  - **Return Value:** A JSON object of the updated User with demoted status
  - **Description:** Demotes the specified user to a lower role.

#### `group.route.js`

- **`GET /groups`**
  - **Parameters:** None
  - **Return Value:** A JSON array of Group objects
  - **Description:** Retrieves a list of all groups in the system.

- **`POST /groups`**
  - **Parameters:** A JSON object containing group details (e.g., `name`, `description`)
  - **Return Value:** A JSON object of the newly created Group
  - **Description:** Creates a new group with the provided details.

- **`GET /groups/:id`**
  - **Parameters:** `id` (the unique identifier of the group)
  - **Return Value:** A JSON object of the Group with the specified ID
  - **Description:** Retrieves a group by its unique ID.

- **`POST /groups/:id/update`**
  - **Parameters:** `id` (the unique identifier of the group) and a JSON object with updated group details (e.g., `name`, `description`)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Updates the details of a group with the specified ID.

- **`DELETE /groups/:id`**
  - **Parameters:** `id` (the unique identifier of the group)
  - **Return Value:** A confirmation message (e.g., "Group deleted")
  - **Description:** Deletes a group by its unique ID.

- **`POST /groups/:id/channels`**
  - **Parameters:** `id` (group ID) and a JSON object with channel details (e.g., `name`, `description`)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Adds a new channel to the specified group.

- **`DELETE /groups/:id/channels/:channelId`**
  - **Parameters:** `id` (group ID) and `channelId` (ID of the channel to remove)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Removes a specified channel from the group.

- **`POST /groups/:id/users/:userId`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user to add)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Adds a user to the specified group.

- **`DELETE /groups/:id/users/:userId`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user to remove)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Removes a user from the specified group.

- **`POST /groups/:id/users/:userId/promote`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user to promote)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Promotes a user to admin status within the group.

- **`POST /groups/:id/users/:userId/demote`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user to demote)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Demotes an admin to a regular user within the group.

- **`POST /groups/:id/users/:userId/interested`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Registers a user as interested in the group.

- **`POST /groups/:id/users/:userId/approve`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the interested user)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Approves an interested user to join the group.

- **`DELETE /groups/:id/users/:userId/deny`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the interested user)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Denies an interested user from joining the group.

- **`POST /groups/:id/users/:userId/ban`**
  - **Parameters:** `id` (group ID) and `userId` (ID of the user to ban)
  - **Return Value:** A JSON object of the updated Group
  - **Description:** Bans a user from the group.

#### `channel.routes.js`

- **`GET /channels/:groupId`**
  - **Parameters:** `groupId` (the unique identifier of the group)
  - **Return Value:** A JSON array of Channel objects for the specified group.
  - **Description:** Retrieves all channels associated with a specific group.

- **`POST /channels/:groupId`**
  - **Parameters:** `groupId` (the unique identifier of the group) and a JSON object containing channel details (e.g., `name`, `description`).
  - **Return Value:** A JSON object of the newly created Channel.
  - **Description:** Creates a new channel within the specified group using the provided details.

- **`POST /channels/:groupId/:channelId`**
  - **Parameters:** `groupId` (group ID) and `channelId` (channel ID), along with a JSON object containing updated channel details (e.g., `name`, `description`).
  - **Return Value:** A JSON object of the updated Channel.
  - **Description:** Updates an existing channel within a specific group.

- **`DELETE /channels/:groupId/:channelId`**
  - **Parameters:** `groupId` (group ID) and `channelId` (channel ID).
  - **Return Value:** A confirmation message (e.g., "Channel deleted").
  - **Description:** Deletes a channel by its ID within a specific group.

- **`GET /channels/:groupId/:channelId`**
  - **Parameters:** `groupId` (group ID) and `channelId` (channel ID).
  - **Return Value:** A JSON object of the Channel with the specified ID.
  - **Description:** Finds and retrieves a channel by its ID within a specific group.

- **`POST /channels/:groupId/:channelId/addUser`**
  - **Parameters:** `groupId` (group ID), `channelId` (channel ID), and `userId` in the request body.
  - **Return Value:** A confirmation message or the updated Channel object.
  - **Description:** Adds a user to the specified channel.

- **`POST /channels/:groupId/:channelId/removeUser`**
  - **Parameters:** `groupId` (group ID), `channelId` (channel ID), and `userId` in the request body.
  - **Return Value:** A confirmation message or the updated Channel object.
  - **Description:** Removes a user from the specified channel.

#### `auth.route.js`

- **`POST /login`**
  - **Parameters:** A JSON object containing `username` and `password`
  - **Return Value:** A JSON object with authentication details (e.g., `token`, `user`)
  - **Description:** Handles login requests and returns authentication details.

- **`POST /register`**
  - **Parameters:** A JSON object containing `username`, `password`, and `email`
  - **Return Value:** A JSON object of the newly registered User
  - **Description:** Handles registration requests and creates a new user.

