# Oceanic Impact | Smart Solutions Inc.
## Product Details
 
#### Q1: What are you planning to build?

A cross-platform mobile app that allows users to upload images and text metadata pertaining to items found/lost near or in bodies of water. 

Frequently, people lose items near, or in, bodies of water. This product seeks to provide an avenue for these people to be reunited with their lost items, and incentivize others to help find the lost items.
Users will be able to make posts about items they have lost, including details about the item, where it was lost, contact info, and an optional bounty for finding the item.

Users will also be able to make posts about items they have found, including their contact info and item description, so that the item's owner can reclaim the item, and optionally provide a reward.
--------
#### Q2: Who are your target users?
- A fisherman who has lost items near bodies of water and wants to recover them.
- A surfer who has lost items near bodies of water and wants to recover them.
- A magnet fisher who would like to make a profit by selling items they found near or in water.
- A person who searches the beach for items and wants to profit off the items they found.
- A person whose job is to keep an area such a beach or lake clean, who can profit off the items they find while doing their job.

Example personas:

1. Chad, 52, is an environmentalist and magnet fisher in Canada. He consistently finds lost items which he deems worthless in a typical marketplace. In these situations, his ideal course of action is to scrap or trash such items.

1. Cindy, 20, lives by a beach and regularly walks near and swims in the water. Occasionally, she would lose items, but because she does not possess the right tools to find such items in a large beach, she would deem such items unrecoverable.
--------
#### Q3: Why would your users choose your product? What are they using today to solve their problem/need?

Today, there exist few apps that allow users to post about their lost items. Websites like Kijiji, craigslist, Nextdoor, and Facebook allow this functionality, but these platforms have problems. Firstly, listings on these platforms are unlikely to be seen by those that find lost items, due to the clutter of other listings made for other purposes. Further, these listings generally lack the accurate geo-location information required to help associate a lost item with its rightful owner. 

Our product fixes these shortcomings of general community classifieds by providing a more purposeful and descriptive platform. Users are better able to match a lost item with its owner, and owners are afforded more specific tooling such as accurate geolocation. Furthermore, our app helps to properly incentivize regular beach-goers, amateur scuba divers, and magnet-fishing hobbyists to seek out these lost items and reunite them with their owners.

Users of our platform will be able to save time browsing competing platforms for their lost items, and instead see more filtered results about lost items, reducing the need to consider every listing, instead only seeing listings geographically close to their lost item(s).

Further, our platform attracts a community of item finders, who may otherwise not be incentivized to search for lost items, to spend more time searching for items and tracking down their owners. 

We hope that this increase in efficiency will lead to less lost items cluttering our bodies of water, less consumer waste due to lost items, and more happy people, reunited with their lost treasures!
--------
#### Q4: How will you build it?

- The frontend of the app will be built using react native to enable compatibility with iOS and Android devices, as well as any future web deployments.
- MongoDB will be used for the backend database; using the mongo atlas free tier
- Deployment for the back-end server will be local until we discuss a publicly-hosted alternative and pricing.
- Back-end server will use Node/ExpressJS using TypeScript as the language.
- OpenStreetMap API will be used for the map functionalities. 
- Backend testing will be done using Mocha/Chai. 
- Front-end testing will be done manually, by each front-end reviewer, for each feature/code-review.
-------
#### Q5: What are the user stories that make up the MVP?

| User Story                                                                                                                                                                                     | Acceptance Criteria                                                                                                                                              |   |   |   |   |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|---|---|---|
| As a person who has found lost items, I want to be able to make a found-item post with information regarding the item(s), in order to sell or return them.                                     | Any user should be able to make found-item posts, each post must include at least a description (image or text), and the finder's contact information            |   |   |   |   |
| As a person who regularly retrieves garbage and lost items near or in water, I want to be able to check the app's posts pertaining to a specific location in order to sell or return my finds. | Given a location near bodies of water, any user can see a list of posts with description of lost items and ways to contact the owner                             |   |   |   |   |
| As a person who has lost something near water, I want to see a list of finds from that location in order to retrieve my item.                                                                  | Given a location near bodies of water, any user can see a list of posts with description of found items and ways to retrive the item                             |   |   |   |   |
| As a person who has lost something near water and seen a post about it on the app, I want to be able to get in contact with the person who found it in order to retrieve my item.              | Each post must include at least one way where finders and owners can get in touch with each other                                                                |   |   |   |   |
| As a person who has lost something near water, I want to be able to make a lost-item post, so people who have found the item can return it to me.                                              | Any user should be able to make lost-item posts, each post must include at least a description (image or text), a location, and the poster's contact information |   |   |   |   |

https://docs.google.com/spreadsheets/d/1gUiWG6nX8LubjlFXbARQl7m-hTnmnqAZQbSq9eC1Bkk/edit#gid=0
----
## Intellectual Property Confidentiality Agreement 

We have agreed to number 5 i.e. we will not publish any code publicly. 

----

## Process Details

#### Q6: What are the roles & responsibilities on the team?

Josiah Friesen: Frontend, team representative for partner meetings, prototype / UX design.  
  - Strengths: Android development, UX design/methodologies, agile development
  - Weaknesses: Backend, QA, Flutter/React Native

Cameron Fairchild: Back-end co-lead, Team Lead, team representative for partner meetings, API-implementation, devops/CI, QA  
   - Strengths: NodeJS/Express back-end, MongoDB,docker
   - Weaknesses: Front-end design, Flutter/React Native, API-design    

Aryan Gandhi: Back-end, Team Lead, Scrum Master, QA  
   - Strengths: QA testing, Javascript, React Web
   - Weaknesses: Databases, Flutter/React Native, UX Design

Ellie Zhang: Back-end  
   - Strengths: PostgreSQL, APIs
   - Weaknesses: Flutter/React Native, JavaScript, 

Kelvin Jiang: Front-end, UX and prototyping  
   - Strengths: UX design/methodologies, SQL databases, APIs
   - Weaknesses: QA, NodeJS/Express back-end, Flutter/React Native

Pushti Gandhi: Back-end, QA  
   - Strengths: SQL databases, APIs, JavaScript, QA testing
   - Weaknesses: Flutter/React Native

-----

#### Q7: What operational events will you have as a team? 
Weekly All-hands Meeting: Saturday (1-2pm) - Discord/Microsoft Teams
    Sync meeting
    Discuss team progress, partner communications and project decisions.
Weekly Front-end Meeting:
    Discuss blockers, progress, team decisions, coordinate scheduling/collaboration
Weekly Back-end Meeting:
    Discuss blockers, progress, team decisions, coordinate scheduling/collaboration

-  Meeting 1: Joint meeting with other team  

   - Discussed work division between project teams: undecided by other team
     - Assumed we will work on different versions of the project
   - Discussed expectations with partner: 
      - Client wants a robust and usable MVP
      - Client wants to be able to test the app with some users after the semester is over
      - Received wishlist (beyond expectations) items via email
   - Discussed licensing:
      - Won’t be open-source     i.e. code is not public

See further minutes in the [minutes document](../meeting-minutes/Meeting1.md)

----
#### Q8: What artifacts will you use to self-organize?

Artifacts: 
- Jira will be used to track tasks and organize what has been completed and what still needs to get done
- Tasks will be prioritized by Jira based on number of dependencies of other application components
- Tasks will be assigned based on the capabilities, strengths and interests of members
- The status of work will be tracked using Jira and will be determined by completion requirements of each task
- Microsoft Teams will be used to organize and schedule meetings
- Specific team meeting date and times will be decided based on availabilities
- Team meetings will be approximately 60-90 minutes, weekly

-----
#### Q9: What are the rules regarding how your team works?

Team will meet collectively twice a meet - once in lecture and once on Saturdays for a discord call. Front-end and back-end teams will meet separately once a week again on discord.
Everyone will attend three meetings a week. 

The process for communicating with our partner is to first contact through emails. The emails will be between the partner and team leads but the rest of the group is CC’ed on emails. We expect to have some meetings on zoom calls. For this, the team representatives will get in contact with our partner at least two days prior to when we hope to have the meeting. 
Only these team representatives will attend the zoom meeting with our partner and the rest of the team will be informed about what was discussed and decided in the following group meeting or, for more time-sensitive information, a message will be sent in our team’s discord server. 

As a team, we are establishing a set of guidelines for communicating availability and progress made. If an individual cannot attend a meeting, we expect to receive a notification in the server letting us know. The people in the meeting will take minutes and anyone who is not present is expected to review those minutes and be informed before the next meeting. 
In our scrum, each person will share what task they are currently working on, what of that task is completed, what is remaining, and any confusion or blockages they are experiencing around the task. As a team, we will resolve any confusion or delegate assistance as needed to get the task completed. Anyone who cannot attend scrum must send a message in the discord server with these details.

Violations of these guidelines will be tracked by the team and will be reflected in the final evaluations. 


----
## Highlights

1. Decided the tech stack (framework, database, etc.)  
   - React Native will be used to create the front-end because some of the team members already have experience with React web. So it should be easier to learn to work with React Native rather than other frameworks. It is also cross-platform so the code can be used for iOS and android
      - An alternative we were considering is Flutter because it is cross platform as well and has good performance compared to React Native. However, none of the members have any experience with Flutter or Dart (language) so because of this it may be harder to learn for the most part compared to React Native.
   - MongoDB will be used as our database because some members already have experience with it and it is easy to modify tables.
      - An alternative we were considering is PostgreSQL because some of our members have experience with it and many of our members are experienced with SQL. However, we chose MongoDB because it could provide some flexibility with prototyping since it is easier to modify models.
   - Node/ExpressJS will be used for the backend server as some members have experience with it already. Further, express is a very popular framework with lots of libraries and learning resources available.
      - We also considered Flask and Django as they are Python frameworks and all of the team has Python experience. However, some of our team feels more confident with Express and the JS DB drivers, so it would be easier to integrate into our team.
   - TypeScript will be used for the backend instead of (plain) JavaScript because it offers typing which makes documentation and development much easier
1. Decided the team roles based on a front-end/back-end split
   - The alternative was to have everyone as full-stack, but this would be less-organized than having separate teams. Separate teams also better emulates a structure that would exist in industry.    
   - The team roles are chosen based on the strengths, weaknesses and interest of each team member to optimize progress in the project development
   - The front-end/back-end split was decided to create different sub-teams in order to better organize the task assignments and collaboration between members
1. Decided to how to organize meetings and tasks as well as what tools we will be using to do so
1. Decided to work independently from the other group working on the project.
