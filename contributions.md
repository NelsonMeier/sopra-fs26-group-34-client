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
| **@NelsonMeier** | 31.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/7b6b2bca144bf813cb70d73f913be58b30cee27e | Implemented the Figma layout, so the page 'looks correct'. Also created and made several buttons functional. Added placeholders for the rest. | This commit is important because it unifies the design with the rest of the page (font, colour, etc.). It also provides the client access to functionality like logging out, navigating to the friend request pages, and checking out their friend list. |                    | 27.03.26   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/533e0c415b524de011f485e68c00ace534be27ec | This commit implements the base framework, on which the profile page is based. It implements the handling of the page-state through multiple useEffects, adds the necessary imports, and implements the base functionality of displaying the user's username | This commit provides most of the relevant structure for the profile page. Whereas the design and user-based functionality could be characterized as the skin and muscle, this is the skeleton of the profile page. Without it the page can't load and keep track of its state properly.|


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

## Contributions Week 3 - 09.04.26 to 16.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **NelsonMeier** | 13.04.2026  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/4be2a715267ff97777428ccdcab10b390e68980a | This commit completly overhauls/refactors the scaling for th user profile page to use flexible scaling. | This allows for the user to resize the window and still look at the page within a reasonable margin. It also means that the user profile page now uses the same scaling logic as other pages, unifying the feel and style across pages. |
| **NelsonMeier** | 14.04.2026  | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/e4c6f339a5ed21d5dcb094061121b0a15a698e55 | This task required implementation of a new scoreboard page and integrating navigation to that page via the user profile page. The Scoreboard page displays two boards for the two games.  | The commit is important because it allows the users to navigate to the new scoreboard page, where they can see lists with the top scoring players in different games (once the games are implemented). |
| **[@githubUser5]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
---

## Contributions Week 4 - 17.04.26 to 24.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser5]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
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

