import React from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        username: "",
      },
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
  }

  componentDidMount() {
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
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
      this.unsubscribe = this.referenceMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

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

  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
  }

  componentWillUnmount() {
    // stop online authentication
    this.authUnsubscribe();
    this.unsubscribe();
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#696969",
          },
        }}
      />
    );
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
          showUserAvatar
          alwaysShowSend
          scrollToBottom
          inTyping={true}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
