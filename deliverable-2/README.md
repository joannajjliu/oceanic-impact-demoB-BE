# Marine Way/Smart Solutions Inc - Team 12

## Iteration 02 - Review & Retrospect

 * When: Sun Nov 6, 2022
 * Where: ONLINE - Zoom

## Process - Reflection


#### Decisions that turned out well

- The decision to split into pods (front-end/back-end) for meetings and organization
  - This decision made meeting-scheduling much simpler, since fewer individual availabilities needed to be considered for each meeting. This division of labour has made the project simpler to manage, and the tasks easier to break down.
- The decision to encourage pair programming
  - Especially in this course, where experience levels vary significantly, pair programming has allowed our team to share stack knowledge with one another and resolve blockers quickly.
- The decision to have two repos, one for frontend for backend
  - By splitting up the repos for each respective team, each team was able to have good version control of their changes for their tasks without affecting or getting affected by the other team’s progress. 
- The decision to produce two unrelated iterations of the prototype
  - Two of the front-end engineers on our team independently produced UI prototypes to ensure a high diversity of ideas. Then we were able to request feedback from our partner on each of the prototypes, leading to the best version of each screen / element making it into the final layout.

#### Decisions that did not turn out as well as we hoped

- The decision to not have retrospective meetings
  - This wasn’t so much a conscious decision, rather something that got left out. As a result of this, we haven’t had an appropriate, recurring place to discuss successes and failures of our ongoing collaboration process.
- The decision to create only low-fidelity prototypes with a pen and paper.
  - This decision was made in the interest of time, but it has resulted in difficult coordination between front-end tasks, specifically pertaining to consistency in color-selection and other stylistic choices.
- Not setting up a Swagger Instance for sharing backend REST API documentation with the front-end team.
  - This lead to extra work scheduling and blocking unnecessarily between pods, where some good Swagger docs would make this much more seamless.


#### Planned changes

- Create a SwaggerUI instance for the backend API documentation.
  - This makes sharing the backend API between pods and integrating it with the frontend much easier.
  - This also serves as a great form of documentation for future development.
- A high-fidelity prototype wouldn’t necessarily be useful anymore since many major components of the UI are already constructed, so instead we will create a design document with standard color codes, text margins, and font styles for the front-end engineers to refer to when building out the rest of the UI.


## Product - Review

- We prepared the demo using an iOS emulator and mocked network requests.   
- We were able to demo navigation and some dynamic UI.   
- We demonstrated navigation between the log-in/signup screen, the home screen, the expanded listing screen, the profile screen, and the post-creation screen.   
- The dynamic UI elements that we demoed include hiding the “edit” button on the profile screen when the profile being opened does not belong to the currently-logged in user, and displaying “Owner: ownerNameHere” or “Finder: finderNameHere” on the expanded listing view depending on if the listing is for a lost item or a found item.   
- Our partner accepted the features but requested that the “Filter” button on the home screen, which is not yet implemented, be predominantly used for applying tag filters in order to refine the home screen listings by item type.  
- From this demo, we learned that it would have been better to enforce a stricter deadline for the deliverable to be before the demo day. This would have improved the feedback we were able to get, along with allowing time for discussion of any features that we are having difficulty completing.  


