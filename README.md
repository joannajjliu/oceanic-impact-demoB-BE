# Oceanic Impact | Smart Solutions Inc. App Backend
This directory contains the backend for the mobile app. This includes the server and docker configuration for server deployment.

## Version
v0.0.1

## Develop Requirements
The backend server is a NodeJS REST API that is installed separately from the frontend app. 
### Backend requirements 
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

    cd backend_repo/ && yarn install

### Running the development server
First you need a mongoDB instance. You can either use a managed instance as from [mongo atlas](https://www.mongodb.com/atlas/database) or install yourself [locally](https://www.mongodb.com/).  

Open `backend/.env.development` and fill in the environment variables with the correct values.  
You should only need to fill in `MONGO_URI` with the connection string for the mongo instance you are running.  

Run the development server  

    yarn run dev

This will start the backend server on port `3000` so you can access it using `http://localhost:3000` from the same device.  
 
 ## Deployment and Github Workflow

Describe your Git / GitHub workflow. Essentially, we want to understand how your team members shares a codebase, avoid conflicts and deploys the application.

 * Be concise, yet precise. For example, "we use pull-requests" is not a precise statement since it leaves too many open questions - Pull-requests from where to where? Who reviews the pull-requests? Who is responsible for merging them? etc.
 * If applicable, specify any naming conventions or standards you decide to adopt.
 * Describe your overall deployment process from writing code to viewing a live applicatioon
 * What deployment tool(s) are you using and how
 * Don't forget to **briefly explain why** you chose this workflow or particular aspects of it!

### Backend Workflow
#### Backend Deployment
A Heroku remote has been created for the app, the `deploy` branch is set up with Heroku's automatic deployment. Every time a push is made to `deploy` branch, Heroku will automatically re-deploy as soon as the continuous integration tests pass.

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
