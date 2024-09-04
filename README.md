# MEAN Chat Documentation

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

#### `channel.route.js`

- **`GET /channels/:groupId`**
  - **Parameters:** `groupId` (the unique identifier of the group)
  - **Return Value:** A JSON array of Channel objects for the specified group
  - **Description:** Retrieves all channels associated with a specific group.

- **`POST /channels`**
  - **Parameters:** A JSON object containing channel details (e.g., `name`, `description`, `groupId`)
  - **Return Value:** A JSON object of the newly created Channel
  - **Description:** Creates a new channel with the provided details.

- **`PUT /channels/:groupId/:id`**
  - **Parameters:** `groupId` (group ID) and `id` (channel ID), along with a JSON object with updated channel details (e.g., `name`, `description`)
  - **Return Value:** A JSON object of the updated Channel
  - **Description:** Updates an existing channel within a specific group.

- **`DELETE /channels/:groupId/:id`**
  - **Parameters:** `groupId` (group ID) and `id` (channel ID)
  - **Return Value:** A confirmation message (e.g., "Channel deleted")
  - **Description:** Deletes a channel by its ID within a specific group.

- **`GET /channel/:groupId/:id`**
  - **Parameters:** `groupId` (group ID) and `id` (channel ID)
  - **Return Value:** A JSON object of the Channel with the specified ID
  - **Description:** Finds and retrieves a channel by its ID within a specific group.

#### `auth.route.js`

- **`POST /login`**
  - **Parameters:** A JSON object containing `username` and `password`
  - **Return Value:** A JSON object with authentication details (e.g., `token`, `user`)
  - **Description:** Handles login requests and returns authentication details.

- **`POST /register`**
  - **Parameters:** A JSON object containing `username`, `password`, and `email`
  - **Return Value:** A JSON object of the newly registered User
  - **Description:** Handles registration requests and creates a new user.


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
