# Marine Way/Smart Solutions Inc - Team 12
[Frontend D2](https://github.com/csc301-fall-2022/team-project-12-oceanic-impact-front-end/releases/tag/D2)

## Demo 

https://user-images.githubusercontent.com/82978761/200195862-fdf49f8f-3619-49dc-ae9b-03cfa338de55.mp4


## Description 
Our app, Marine Way, is a cross-platform mobile app that allows users to upload images and text metadata pertaining to items found/lost near or in bodies of water. 

Frequently, people lose items near, or in, bodies of water. This product seeks to provide an avenue for these people to be reunited with their lost items, and incentivize others to help find the lost items.
Users will be able to make posts about items they have lost, including details about the item, where it was lost, contact info, and an optional bounty for finding the item.

Users will also be able to make posts about items they have found, including their contact info and item description, so that the item's owner can reclaim the item, and optionally provide a reward.

## Key Features
- Login and authentication
    - A user can signup to the application and create a profile. 
    - This allows each user to associate themselves with their profile and make posts using their contact information, that can be modified later, and securely.
- Listing creation
  - A user can post a new listing of either a lost or found item.
  - Each listing contains details about the item that can be used to identify the item and reunite it with the owner.
  - Listings have a location for where the item was lost/found
- Listing view
  - Listings can be viewed without filtering to see all lost/found items
  - Listings can be searched/filtered based on:
    - location proximity to the user
    - keywords in the title or description
- Profile customization
  - each user can customize their profile
  - a user can add:
    - contact info (phone number/email)
    - a biography to establish trust 

## Instructions
- Upon running the app, the user is greeted with a login screen. The login screen is not connected with the database but the user can proceed by simply pressing 'login'.
 - After logging in, the homepage comes which forms the main door to all the features of the app.
 - On the home page, the user can see postings of lost items and similar notifications if they are found. These are dummy posting for now.
 - Clicking on each item will take the user to a separate page which has complete information about the respective item. The information will include an enlarged photo, description ,and contact information of the publisher.
 - Coming back to the home screen, the user can create their own post by pressing the "+post" button at the bottom.
 - Creating a new post will take the user to another page where they can enter all the information about the post.
 - Again coming back to the home screen, the user can click on the "User" button at the bottom to get their information. This will take the user to another page where they can view their photo and postings (dummy postings).
 
## Development requirements
The backend server is a NodeJS REST API that is installed separately from the frontend app. 
### Backend requirements 
 - Expo app on a mobile device
 - Ubuntu 18.04 +
 - nvm (node version manager)
 - nodejs v16
 - yarn
#### Install backend dependencies
    
 [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)   

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash  

Install node v16   

    nvm install 16

Install yarn  

    npm install -g yarn

Clone the backend repo to `backend_repo`

    git clone https://github.com/csc301-fall-2022/team-project-12-oceanic-impact-inc-m.git backend_repo

Install backend node dependencies  

    cd backend_repo/backend && yarn install


### Running the development server
First you need a mongoDB instance. You can either use a managed instance as from [mongo atlas](https://www.mongodb.com/atlas/database) or install yourself [locally](https://www.mongodb.com/).  

Open `backend/.env.development` and fill in the environment variables with the correct values.  
You should only need to fill in `MONGO_URI` with the connection string for the mongo instance you are running.  

Run the development server  

    yarn run dev

This will start the backend server on port `3000` so you can access it using `http://localhost:3000` from the same device.  

### Frontend requirements 
 - Ubuntu 18.04 +
 - nodejs v16
 - expo mobile app
#### Install Frontend dependencies

  Firstly, install the [Expo Mobile App](https://expo.dev/client) on your mobile device.
 Secondly, install the [Expo dependencies](https://docs.expo.dev/get-started/installation/#requirements) on your computer.
 
 
 ## Deployment and Github Workflow

Describe your Git / GitHub workflow. Essentially, we want to understand how your team members shares a codebase, avoid conflicts and deploys the application.

### Backend Workflow
#### Backend Deployment
The backend is manually deployed on a host server running Ubuntu 20.04.  
The backend deployment steps are:
1. Install dependencies (nvm/node/yarn)
   a. Install pm2 `yarn add -g pm2`
1. Verify port is open e.g. `ufw enable && ufw allow 80`
1. git clone/pull current main branch
1. `cd backend && yarn install` to install node dependencies
1. Copy current `.env.production` file over to host server using `scp`
1. build the project `yarn build`
1. start under pm2 to restart on crash `pm2 start yarn --time -- run start`  

#### Backend Git Workflow
We use github issues for Stories. These automatically are assigned a new issue ID by github.  

When creating a new branch for an issue, we use the branch naming convention of `[issue#]-[description]` which is automatically generated by the github issue if you go to `Development > Create a branch`, or using `GH-[issue#]-[description]`.  
> For example, either of   
> `23-a-user-can-use-the-api-to-edit-their-profile` or    
> `GH-23-a-user-can-use-the-api-to-edit-their-profile`  
> would be acceptable

This helps when tracking development progress for an issue as github should automatically find most of these branches and any PRs created from them.   

Each new branch for an issue is to be created off-of the `staging` branch. This is to separate code that is not ready for production release from code that is currently running in production (i.e. in `main`)    

We require pull-requests for merging into `staging`, and also for merging into `main`.  This is to prevent bugs and bad-code introduced due to quick-hands.  

On each pull-request into `staging` we require 1 review from someone in the backend pod, and for the tests to pass on the CI. This guarantees that code is reviewed before it enters the common `staging` branch and that any tests are not failing due to the changes. 

Our CI is run using Github Actions and automatically runs our Mocha test suite and shows as a check on each PR into `staging` or `main`.  

Before code is merged into `main`, we move it into a "release branch" which contains all the code thus far, and should contain any commits that we are ready to release.  This branch is reviewed before release, and any bug fixes can be made directly to it, instead of to staging, before release is made to `main`. The naming for these branches is `release/v#.#.#`.  

The purpose of this branch is to allow development to continue on `staging` without affecting the creation of the new release.  

On each pull-request into `main` we require **2** reviews from the backend pod, and for the tests to pass on the CI. This *should* guarantee that any code that goes into production has been reviewed by at least **3** (including the author) and any changes don't fail the tests.  

### Frontend Deployment

#### Frontend Workflow
 Coming to the repository on your machine. You should get into the folder "./frontend" and clone our frontend repository by running the command
    
    git clone https://github.com/csc301-fall-2022/team-project-12-oceanic-impact-front-end.git
    
 Following that, navigate inside the newly cloned repository and install the dependencies
    
    npm install
    
 To run the app, run
 
    npm start
    
 You will be given a QR code on your terminal which you can scan and run the app (the app has to be connected to the same internet as your system). Scan the code and the app should start.
 
 
 ## Licenses  
 The repo has no license.    
 The lack of license means the code is not free. And we plan to keep the code closed-source.  
 Our partner made this choice due to stakeholder concerns of having the platform be open-source.  
