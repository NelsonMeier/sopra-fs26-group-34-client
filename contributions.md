# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 24.03.26 to 31.03.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@jonasdkf** | [26.03.26]   | [https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/8b945fab51437aa75dbe6659049ebd45fc4c179c] | Implemented Friend and FriendRequest entity, as well as the repository in backend | Whole friend relation system is based on these two entities |
| "" | [28.03.26]   | [https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/7bbf43949b76b08fab20e11f757d2a169e374305] | Implemented the Service Layer for friend system | Includes crucial operations like sending friendRequests, accepting / declining friendrequests, creating the friendships and deleting friendships |
| "" |[28.03.26]|[https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/7bbf43949b76b08fab20e11f757d2a169e374305]|Implemented the controller Layer (Including DTO Mapping) |Set up GET, POST, PUT and DELETE Mappings based on our REST specification, which allows for requests between the client and server|
| **@zar4hmed** | [28.03.26]   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/bb54319464dbd0f072d7a126688be94867f0d8ca | Update the backend to properly handle user registration by accepting username and password. This was done by updating the DTO, Mapper and Controller| This is relevant as without the backend would not be able to process the user input when registering.|
| "" | [28.03.26]   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/7c31135f97ebc76664febc87e7ea564076fe725e | Implemented user registration logic and duplicate username error handling in the service and repository file | Core requirement so the registerstration flow works including error handling |
| "" | [28.03.26]  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/a73c6162b25e7549d6ddd9ac98bceed2241c25ec | Implemented the landing page with Login and Register navigation buttons | Gives user an entry point to the application |
| "" | [28.03.26]  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/6cab5d35b2679f062b5a83801db11ba86a529be2 | Created the registration page with form that sends username&password to the backend, saves token, redirects to the profile | Needed page for the users to be able to create an account |
| **@Lukas81S** | 29.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/a3b103a512929d8ba1c3819e04605e174b035a5f | Added initial (non-functional) "add friend" and "friend requests" pages and buttons to return to the user profile. | These pages are the places where the user can send and receive friend requests. |
| "" | 29.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/bcfd1a53e3aae50a7c791bfb89f0a343dc6cf1be | Implemented the full "add friend" page. | In this page, the user can successfully send a friend request. |
| "" | 30.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/b37b77b65377fd4194236a76b0279f39200884a6 | Implemented the full "friend requests" page. | In this page, the user can successfully accept/decline a friend request. |
| **@anitbaum** | 29.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/b435875b7605cb947c9b778b3b4525e8f9a5bd4f | Implemented login in the backend | The input from the user has to be processed in the backend to log in successfully. |
| "" | 29.03.26 | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/ec2580db783ea56f2ccb029c56d012c2ee7e41b5 |  Implemented authentication of the user | The system has to verify if the tokens are correct for the respective user. |
| "" | 29.03.26 | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/256cc51a8f92afad5581df35cf91a225eaf01d0f | Update the DTO's, Mapper, Controller and Service | The variables have to be connected correctly for a smooth information flow. | 
| "" | 29.03.26 | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/e1466a28a14507c227ce3a47937aff86f32d6bc0 | Implemented page for login | The user has to be able to log in to their account. |
| ""| 30.03.26 | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/60ffb0eb064d81f286390d6bf4518ae2f9daa7c0 | Implemented logout function in controller and service. | Handles the functionality of logging the user out. |
| **@NelsonMeier** | 31.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/7b6b2bca144bf813cb70d73f913be58b30cee27e | Implemented the Figma layout, so the page 'looks correct'. Also created and made several buttons functional. Added placeholders for the rest. | This commit is important because it unifies the design with the rest of the page (font, colour, etc.). It also provides the client access to functionality like logging out, navigating to the friend request pages, and checking out their friend list. |
| **@NelsonMeier** | 27.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/533e0c415b524de011f485e68c00ace534be27ec | This commit implements the base framework, on which the profile page is based. It implements the handling of the page-state through multiple useEffects, adds the necessary imports, and implements the base functionality of displaying the user's username | This commit provides most of the relevant structure for the profile page. Whereas the design and user-based functionality could be characterized as the skin and muscle, this is the skeleton of the profile page. Without it the page can't load and keep track of its state properly.|


---

## Contributions Week 2 - 01.04.26 to 08.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@anitbaum** | 05.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/d716f091a6811ab0812f5cc4f08d67e02f53aefa | Started working on the multiplayer room page, implmeneted the buttons to go from the Profile to the multiplayer page and back. | The user should be able to go to the multiplayer page and back to their profile. |
| "" | 08.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/679c70440817b5603b280180e924624e3d2f8722 | Final commit for the multiplayer page and it's functionalities. | It's important that the user can easily understand the different functions of the multiplayer page. |
| **zar4hmed** | 06.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/bcbb9fd2b829190467bd3e6a35f4547fba7a7ba5 | Added WebSocket support to enable the communication in the multiplayer room. This includes the WebSocket configuration, room entity and a room controller for handling room related things. | This is important because without it, players cannot communicate in real time in the multiplayer room. |
| "" | 08.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/bdc7f639a221e941f6acb66f31004214eeb41383 | Added full WebSocket integration for the multiplayer room page . This includes the useWebSocket hook to manage the connection and making the other room related features  work + fixed the login page to save the username to localStorage as else the  WebSocket connection wont work. | This is important because it connects the frontend to the backend WebSocket which makes the multiplayer room work. |
| **Lukas81S** | 07.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/a69f6a2be50820785ba0a3582bdca57466339110 | Implemented the singleplayer room page. | Allows the player to choose a game to play in singleplayer. |
| "" | 07.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/38b253431b50589a20556d07a47dc869592514c7 | Implemented basic functionality of the reaction time game (no backend communication for high scores yet). | The user can now play a functional reaction speed game. |
| **@NelsonMeier** |  7.4.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/b88851c60f39537a9fc587e54be2b05a7f556ebb | Commit implements frontend logic and apiService calls for changing password. | With these final changes to the password changing functionality, the user can now click on the "change password" button, fill out the form, and request the change from the backend. |
|                    |  7.4.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/ed7a44d3c98c560411a892cd73bf8173d562357d | This commit relates to the backend logic which allows the password to be changed. UserService and UserControler files now have methods to handle a request from the frontend to change the password. | This change makes it so, that the changed password is sent to the backend and actually saved in the database (along with some checks). This makes it possible to log in with the new changed password. |
|@jonasdkf|07.04.26|https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/6026807cf0822a09b45856c6b463565fc6dd28ba|fixed some bugs and switched from using alert() function to antd's message feature| The switch to message makes the user experience more seemless, because the message doesnt pause the website and disappears automatically. |
|"|07.04.26|https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/079b0836f88c9113a1ef08edbc08a66ff40f26b2| read documentations of the quotable API and planned next steps to implement the singleplayer speet-typing game|The quotable API is essential for the speed-typing game, as it proveds the user with the text that the user must type out as quick as possible|

---

## Contributions Week 3 - 09.04.26 to 15.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **zar4hmed** | 12.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/b3122802a5950458c927ddbcce0094294b608c96 | Created WebSocketContext to manage incoming invites and share them across the entire application + accordingly adjusted layout.txt and the multiplayer page | This contribution is relevant because it enables real time handling of the game invitations |
| **""** | 14.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/31af9681669f3411a6732b0ee7cfb6c3a9fabc88 | This commit is related to the game invitation. Edited the code so that now the game invite pop up shows up for the invited player and makes them join the admins room. | Important as this is the key feature of the multiplayer room that allows players to play games together. |
| **[@jonasdkf]** | [14.04.2026]   | [https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/1748b46f0414994df3cd4d696f5e690fa6c69274] | [Implemented the logic and Layout of the speed-typing game. Includes fetching random quotes Quotable API] | [This contribution includes one of the two games that we planned to implement, aswell as implements the mandatory external API.] |
|**""**| [14.04.2026] | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/14ebc8c596ee9996a7007d56b471a4aff08389d0 | Implemented GameController.java to fetch from the Quotable API. | This contribution is important because I was unable to fetch from the Quotable API from the client side, the issue seems to be because SSL certificates in the Quotable API's URL. The Implementation in GameController strictly ignores the SSL certificates which makes it work. |
| **NelsonMeier** | 13.04.2026  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/4be2a715267ff97777428ccdcab10b390e68980a | This commit completly overhauls/refactors the scaling for th user profile page to use flexible scaling. | This allows for the user to resize the window and still look at the page within a reasonable margin. It also means that the user profile page now uses the same scaling logic as other pages, unifying the feel and style across pages. |
| **NelsonMeier** | 14.04.2026  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/e4c6f339a5ed21d5dcb094061121b0a15a698e55 | This task required implementation of a new scoreboard page and integrating navigation to that page via the user profile page. The Scoreboard page displays two boards for the two games.  | The commit is important because it allows the users to navigate to the new scoreboard page, where they can see lists with the top scoring players in different games (once the games are implemented). |
| **@anitbaum** | 14.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/0b553f8ec31d1d08e18b47d4719aa7a3cc81332b | Fixed password --> implemented UserPutDTO | For correct mapping |
| **""** | 14.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/0e2f7150ddf5cfb609c15e74adbeef6d61e0c89f | implemented the functionalities of the accept and decline buttons for game invititations | The user receiving a game invitation should be able to accept or decline it. |
| **""** | 15.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/28f032c59b9970da8a02b269926d529bf2c71ebb | Adjusted the layout of the User Profile to the other pages. | A coherent website design is important for clarity to the user. |
| **Lukas81S** | 14.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/2ed6fe2edfed793800fc1f4a10687708275a55b7 | Added functionality to select how many rounds should be played | The singleplayer room now better fits the original specification and is more unified with the multiplayer.  |
| **""** | 14.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/4eefbe9f9ed7165692ec23e190a8b46bc9a74b17 | Added the singleplayer results page and updated game logic to fit singleplayer room. | The results page allows the user to see the scores they got in the singleplayer session.  |
---

## Contributions Week 4 - 17.04.26 to 24.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@jonasdkf]** | 20.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/bc62d06c2a49147259806d431a68b0a0b6c9ee0c | Implementation of a search feature when adding new Friends | This feature allows for the user to search Users to add as friend. This improves the user experience when it comes to sending friend requests, as the user doesnt have to know the exact username anymore. |
| **[""]** | 20.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/22452889e6ecc6f8e78a1c56e79dbe15f9e6c98d | This commit includes the backend implementation of the search feature. | The backend functions in the UserController and UserService had to be updated to return a list of users that start with the prefix (search query). |
| **""** | [20.04.2026]   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/8ab30563dfbf6da26482379fcefc34610cc3b47b | Adjusted tests to pass with new searchByUserPrefix function. | Without these tweaks in the UserControllerTest file, two tests would fail leading to the backend not deploying. |
| **@NelsonMeier** | 19.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/8709ef398515c54c95f6aa3c50c434ab65a64fce | This commit implements service and controler methods for scoreboard retrieval from the backend side. It also implements custom database queries to get the ten highest scores. It also creates the mappings for the two scoreboard DTOs. | These changes integrate the usage of the previously created scoreboard DTOs to be able to provide the client with the correct result and format when a scoreboard GET request is made. The custom database queries also directly sort the scores descendingly/ascendingly respectively, which saves us from having to sort elsewhere. |
| **@NelsonMeier** | 19.04.2026   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/5c68cff31dc5001d2d8e59c2a71ff5f0eccb037a | Makes the frontend changes to be able to display the live scoreboard. Implements fetching the scoreboard via GET request and then deconstructs DTO and displays results. | This change completes the implementation of scoreboard functionality. It allows the user to navigate to the scoreboard page and inspect the top 10 leaders of the two games, sorted by scores. It also implements loading and errors for fetching scoreboard. |
| **zar4hmed** | 18.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/1679992b78b7b6b0098d0e102b43ac1d12700c1e| Added a Scorecard component and extended the WebSocket hook to track round progress, player submission and scores in real time. | This enables players to see scores after each round in multiplayer mode. |
| **""** | 21.04.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/878de4b9fa819f354cd8f19d4d410e02f1f3db48| Added full multiplayer support for the typing speed game which includes synced quotes and round score submission via WebSocket. | With this players can play in multiplayer mode with their friend and compare their skills. |
| **@anitbaum** | 19.04.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/8d77705ac841fe2b72c31086dda2ac056b27fef0#diff-28cdc226ce1c9f69f0dcc9a448fff4b82e02f379efca02145d13ca93e6740ea2 | Implemented the "Back to Profile" button. | User should be able to go back to their profile when a game is done. |
| **""** | 21.04.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/350653947a0df73ec26c5d9fac8b4caf4b50e444#diff-28cdc226ce1c9f69f0dcc9a448fff4b82e02f379efca02145d13ca93e6740ea2 | Implemented websocket for Reaction Time to play the game in multiplayer mode. (Back button was closed here because I forgot to in the actual commit.) | User should be able to play Reaction Time in multiplayer mode. |
| **Lukas81S** | 18.04.26  | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/bf5852cd4a121190559cba89a009ff181814468b | Implemented backend logic for saving high scores. |  The player's high scores should be saved for the scoreboards to function.  |
| **""** | 21.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-server/commit/00c4337a6872573770b391cf6dec04e8a589505a | Implemented tests for friend functionalities. | Testing the friend methods ensures their functionality after changes are made. |
| **""** | 21.04.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/75b2286037700d50a68f4edafeab88f845e70832 | Made High scores more apparent in the results page. | The results page communicates the high score more clearly to the player. |
---

## Contributions Week 5 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser5]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
---

## Contributions Week 6 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser5]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
---

