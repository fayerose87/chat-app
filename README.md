# Chat App
A chat app for mobile devices using React Native. The app provides users with a chat interface and options to share images and their location.

## Features
- A page where users can enter their name and choose a background color for the chat screen before joining the chat.
- A page displaying the conversation, as well as an input field and submit button.
- Data gets stored online and offline.

## Technologies Used:
- React Native  
- Expo  
- Firebase/ Firestore 

## User Stories
- As a new user, I want to be able to easily enter a chat room so I can quickly start talking to my friends and family.
- As a user, I want to be able to send messages to my friends and family members to exchange the latest news.
- As a user, I want to send images to my friends to show them what I’m currently doing.
- As a user, I want to share my location with my friends to show them where I am.
- As a user, I want to be able to read my messages offline so I can reread conversations at any time.
- As a user with a visual impairment, I want to use a chat app that is compatible with a screen reader so that I can engage with a chat interface.

# Getting Started  

## Setup
### Clone this repository 
`git clone https://github.com/fayerose87/chat-app.git`

### Go to project's root directory
`cd chat-app`

### Install dependencies
`npm install`  

### Run the project using expo 
`expo start` or `npx expo start`   

### Create an Expo account   
Set up an [Expo account](expo.dev), then download the Expo app on your smartphone from the App Store. (Take a look at Expo's [Installation Guide](https://docs.expo.dev/get-started/installation/) for additional details.)

From there, you can open the chat app on your phone by scanning the QR code that gets generated after running `expo start`.

### Set Up a Firebase database 
Set up a [Firestore database](https://firebase.google.com/). Details on how to set up the database can be found in the [Firebase documentation](https://firebase.google.com/docs).    

_Note: you will need to setup your own Firebase database and add your own database credentials in /components/chat.js, under the "Firebase Config Details", then allow anonymous authorization with your Database._)