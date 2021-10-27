import React from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import {
  Bubble,
  GiftedChat,
  Day,
  InputToolbar,
} from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: "",
      user: {
        _id: "",
        username: "",
      },
      isConnected: false,
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDRr5U2XrYMIZ52NDtS_cNeL9BWJbNulnU",
        authDomain: "chat-app-f668f.firebaseapp.com",
        projectId: "chat-app-f668f",
        storageBucket: "chat-app-f668f.appspot.com",
        messagingSenderId: "646372390253",
        appId: "1:646372390253:web:56a750ec686577a7ec5664",
        measurementId: "G-5NC48W4269",
      });
    }
    // reference messages collection in firebase
    this.referenceMessages = firebase.firestore().collection("messages");
    this.referenceMessageUser = null;
  }

  componentDidMount() {
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // Check if user is online or offline
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");

        // listen to authentication events
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // update user with active user
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                _id: user.uid,
                name: name,
              },
              loggedInText: `${this.props.route.params.name} has entered the chat`,
            });
            // Create reference to the active users messages
            this.referenceMessagesUser = firebase
              .firestore()
              .collection("messages")
              .where("uid", "==", this.state.uid);
            // Listen for collection changes
            this.unsubscribe = this.referenceMessages
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        console.log("offline");
        this.setState({ isConnected: false });
        // Calls messeages from offline storage
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    // stop online authentication
    this.authUnsubscribe();
    this.unsubscribe();
  }

  async getMessages() {
    let messages = "";
    let uid = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      uid = await AsyncStorage.getItem("uid");
      this.setState({
        messages: JSON.parse(messages),
        uid: JSON.parse(uid),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  //Loads messages from AsyncStorage
  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Add messages to database
  addMessages() {
    const message = this.state.messages[0];
    // add a new messages to the collection
    this.referenceMessages.add({
      uid: this.state.uid,
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: message.user,
    });
  }

  //Delete messages from AsyncStorage
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Save Messages to local storage
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // Send messages
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        // Append new messages to the existing thread displayed on the UI
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      // Make sure to call addMessages so they get saved to the server
      () => {
        this.addMessages();
        // Calls function saves to local storage
        this.saveMessages();
      }
    );
  }

  // Retrieve current messages and store them in the state: messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages,
    });
  };

  renderAvatar(props) {
    return (
      <Avatar {...props} containerStyle={{ backgroundColor: "#ffffff" }} />
    );
  }

  // Sets System Message color
  renderDay(props) {
    let backgroundColor = this.props.route.params.backgroundColor;
    if (backgroundColor == "#B9C6AE") {
      return <Day {...props} textStyle={{ color: "#696969" }} />;
    } else {
      return <Day {...props} textStyle={{ color: "#FFFFFF" }} />;
    }
  }

  // If offline, dont render the input toolbar
  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  renderBubble(props) {
    let backgroundColor = this.props.route.params.backgroundColor;
    if (backgroundColor == "#474056") {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#221f29",
            },
            right: {
              backgroundColor: "#7f7498",
            },
          }}
          textStyle={{
            left: { color: "#ffffff" },
            right: { color: "#ffffff" },
          }}
          timeTextStyle={{
            right: { color: "#e9e9e9" },
            left: { color: "#e9e9e9" },
          }}
        />
      );
    }
    if (backgroundColor == "#8A95A5") {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#404753",
            },
            right: {
              backgroundColor: "#d8dbe1",
            },
          }}
          textStyle={{
            left: { color: "#ffffff" },
            right: { color: "#5f5f5f" },
          }}
          timeTextStyle={{
            right: { color: "#696969" },
            left: { color: "#e9e9e9" },
          }}
        />
      );
    }
    if (backgroundColor == "#B9C6AE") {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#696969",
            },
            right: {
              backgroundColor: "#4d5c41",
            },
          }}
          textStyle={{
            left: { color: "#ffffff" },
            right: { color: "#ffffff" },
          }}
          timeTextStyle={{
            right: { color: "#e9e9e9" },
            left: { color: "#e9e9e9" },
          }}
        />
      );
    } else {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#696969",
            },
            right: {
              backgroundColor: "#d6d6d6",
            },
          }}
          textStyle={{
            left: { color: "#ffffff" },
            right: { color: "#5f5f5f" },
          }}
          timeTextStyle={{
            right: { color: "#696969" },
            left: { color: "#e9e9e9" },
          }}
        />
      );
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.route.params.backgroundColor,
        }}
      >
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.state.user}
          renderBubble={this.renderBubble.bind(this)}
          renderDay={this.renderDay.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          showUserAvatar
          inTyping={true}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
