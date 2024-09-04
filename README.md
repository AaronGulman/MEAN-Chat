# Project Documentation

## Git Repository Organization and Version Control Approach

The Git repository is organized into two main directories:
- **`client/`**: Contains the Angular front-end application.
- **`server/`**: Contains the Node.js back-end server.

### Version Control Approach
- **Branching Strategy**: All work was done on a single main branch as this is an individual project, with no need for complex Git operations like feature or bug branches.
- **Commit Frequency**: Commits were made whenever a quantifiable feature was completed, allowing for easy tracking of progress and a clear history of changes.
- **Push Frequency**: Pushing to the remote repository was done after completing and testing major functionalities to ensure that the code pushed was stable.

## Main Data Structures

### Client-Side Data Structures
- **`User`**: Represents users with attributes like `id`, `username`, `email`, `password`, `roles`, `groups`, and `interested`. This structure manages user information and roles.

- **`Group`**: Represents a group with attributes such as `id`, `name`, `description`, `admins`, `members`, `channels`, `interested`, and `banned`. Groups manage user memberships and associated channels. `UserService` and `GroupService` are often used together due to the two-way relationship between user and group attributes.

- **`Channel`**: Represents a channel with attributes such as `id`, `name`, `groupId`, and `description`. Channels are used within groups for communication.

### Server-Side Data Structures
- Although data structures like `User`, `Group`, and `Channel` are defined on the server side, they are currently not in use since all data handling is done on the client side. These structures are prepared for future implementation with MongoDB integration.

## Angular Architecture

### Components
- **`LoginComponent`**: Manages the login form, validating user input and interacting with the `AuthService` to simulate authentication.

- **`RegisterComponent`**: Handles user registration, collecting data, and using the `AuthService` to demonstrate the registration flow.

- **`DashboardComponent`**: Serves as the main user interface post-login, displaying groups and channels the user is part of.

- **`GroupComponent`**: Displays and manages group details, allowing users to view members, join groups, or interact with associated channels.

- **`ChannelComponent`**: Manages individual channel views, allowing user interactions within the channel.

### Services
- **`AuthService`**: Handles basic authentication logic, including login and registration, by sending HTTP requests to the server.

- **`UserService`**: Manages user-related operations, such as fetching user details and updating profile information. Often used alongside `GroupService` due to shared data attributes between users and groups.

- **`GroupService`**: Manages group-related operations, including creating, updating, and fetching groups. Works closely with `UserService` to handle group memberships and roles.

- **`ChatService`**: Facilitates interactions within channels, such as navigating to different channels based on user interactions.

### Models
- **`User`**: Defines the user data structure used across components and services.

- **`Group`**: Defines the group data structure, representing group details and managing associated channels and members.

- **`Channel`**: Represents channels within groups, used to facilitate communication and user interactions within specific channels.

### Routes
- The routing configuration maps paths like login, registration, dashboard, group views, and channel views to their respective components, enabling navigation within the application.

## Node Server Architecture

### Server Folder Structure
- **`controllers/`**: Contains logic for handling incoming requests and processing data. Note that all controller functions are currently prototypes.
  - **`auth.controller.js`**: Handles basic request processing for login and registration.
  - **`channel.controller.js`**: Manages requests related to channels, including creation, retrieval, updating, and deletion.
  - **`group.controller.js`**: Manages requests related to groups, including creation, retrieval, updating, and deletion, as well as user and channel management within groups.
  - **`user.controller.js`**: Manages requests related to users, including creation, retrieval, updating, and deletion, as well as group membership and interest management.

- **`models/`**: Defines data structures on the server side.
  - **`channel.model.js`**, **`group.model.js`**, **`user.model.js`**: Represent the Channel, Group, and User data structures, prepared for future server-side storage.

- **`routes/`**: Defines the API routes exposed by the server.
  - **`auth.routes.js`**: Manages routes related to authentication, including login and registration.
  - **`channel.routes.js`**: Manages routes related to channels, including retrieving, creating, updating, and deleting channels.
  - **`group.routes.js`**: Manages routes related to groups, including retrieval, creation, updating, deletion, and user and channel management within groups.
  - **`user.routes.js`**: Manages routes related to users, including retrieval, creation, updating, deletion, and group and interest management.

- **`server.js`**: The main server entry point, responsible for setting up Express, initializing middleware, and connecting routes.

### Route Definitions

#### **`user.route.js`**
- **`GET /users`**: Retrieve all users.
- **`POST /users`**: Create a new user.
- **`GET /users/:id`**: Retrieve a user by ID.
- **`POST /users/:id/update`**: Update a user by ID.
- **`DELETE /users/:id`**: Delete a user by ID.
- **`POST /users/:id/groups/:groupId`**: Add a group to a user.
- **`POST /users/:id/groups/:groupId/remove`**: Remove a group from a user.
- **`POST /users/:id/interests/:groupId`**: Add interest to a user.
- **`POST /users/:id/interests/:groupId/remove`**: Remove interest from a user.
- **`POST /users/:id/promote`**: Promote a user.
- **`POST /users/:id/demote`**: Demote a user.

#### **`group.route.js`**
- **`GET /groups`**: Retrieve all groups.
- **`POST /groups`**: Create a new group.
- **`GET /groups/:id`**: Retrieve a group by ID.
- **`POST /groups/:id/update`**: Update a group by ID.
- **`DELETE /groups/:id`**: Delete a group by ID.
- **`POST /groups/:id/channels`**: Add a channel to a group.
- **`DELETE /groups/:id/channels/:channelId`**: Remove a channel from a group.
- **`POST /groups/:id/users/:userId`**: Add a user to a group.
- **`DELETE /groups/:id/users/:userId`**: Remove a user from a group.
- **`POST /groups/:id/users/:userId/promote`**: Promote a user to admin.
- **`POST /groups/:id/users/:userId/demote`**: Demote an admin.
- **`POST /groups/:id/users/:userId/interested`**: Register a user as interested in a group.
- **`POST /groups/:id/users/:userId/approve`**: Approve an interested user.
- **`DELETE /groups/:id/users/:userId/deny`**: Deny an interested user.
- **`POST /groups/:id/users/:userId/ban`**: Ban a user from a group.

#### **`channel.route.js`**
- **`GET /channels/:groupId`**: Retrieve all channels for a specific group.
- **`POST /channels`**: Create a new channel.
- **`PUT /channels/:groupId/:id`**: Update an existing channel.
- **`DELETE /channels/:groupId/:id`**: Delete a channel by ID.
- **`GET /channel/:groupId/:id`**: Find a channel by ID.

#### **`auth.route.js`**
- **`POST /login`**: Handle login requests.
- **`POST /register`**: Handle registration requests.

### Modules and Functions
- **Modules**: Utilizes Express for routing, body-parser for parsing requests, and other standard utilities.
- **Functions**: Primarily set up for handling login and registration in the current phase, with plans for expansion in phase two when database integration begins.

### Server-Side Routes (Currently In-Use)
- **`/login`**: Handles login requests but currently only simulates authentication by returning a valid response.
  
- **`/register`**: Handles user registration requests but only validates the request without storing data server-side.

## Client-Server Interaction

### Current Interaction
- **Login and Register**: The client currently only interacts with the server for login and registration; however, these interactions are purely demonstrative. The server returns a valid response without actual authentication or data persistence (unable to use localStorage in node.js), showcasing basic REST API functionality.

- **Local Storage**: All other data, such as groups, channels, and user information, is managed within the browser using client localStorage, simulating what will later be server-side database interactions.

**NOTE:** _All controller functions are currently prototypes, as data is managed using localStorage on the front end._

### Future Phases
- In the second phase, with the addition of MongoDB, the server-side will be upgraded to manage data comprehensively. Client-side services will be modified to make asynchronous API calls for fetching and updating data from the server. This will transition the application to a fully asynchronous, database-driven model. Angular services will use observables to handle these asynchronous interactions, though the core functionality of the application will remain largely the same.
