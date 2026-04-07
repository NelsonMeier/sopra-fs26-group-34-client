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
| **@NelsonMeier** | [31.03.26]   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/7b6b2bca144bf813cb70d73f913be58b30cee27e | Implemented the Figma layout, so the page 'looks correct'. Also created and made several buttons functional. Added placeholders for the rest. | This commit is important because it unifies the design with the rest of the page (font, colour, etc.). It also provides the client access to functionality like logging out, navigating to the friend request pages, and checking out their friend list. |                    | [27.03.26]   | https://github.com/NelsonMeier/sopra-fs26-group-34-client/commit/533e0c415b524de011f485e68c00ace534be27ec | This commit implements the base framework, on which the profile page is based. It implements the handling of the page-state through multiple useEffects, adds the necessary imports, and implements the base functionality of displaying the user's username | This commit provides most of the relevant structure for the profile page. Whereas the design and user-based functionality could be characterized as the skin and muscle, this is the skeleton of the profile page. Without it the page can't load and keep track of its state properly.|


---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
