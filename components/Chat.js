import React from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ImageBackground,
} from "react-native";
import {
  Bubble,
  GiftedChat,
  Day,
  InputToolbar,
  Send,
  Composer,
} from "react-native-gifted-chat";
import { IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import MapView from "react-native-maps";
import CustomActions from "./CustomActions";

const firebase = require("firebase");
require("firebase/firestore");

const chatBackground = require("../assets/chat-bubbles.png");

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTyping: false,
      messages: [],
      uid: 0,
      loginText: "Authenticating..",
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
      dotColor: "",
      image: null,
      location: null,
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
                avatar: "https://placeimg.com/140/140/any",
              },
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
    if (this.state.isConnected == true) {
      // stop online authentication
      this.authUnsubscribe();
      this.unsubscribe();
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
      text: message.text || null,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
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
      var data = doc.data();
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text || "",
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

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
      return <InputToolbar {...props} containerStyle={[styles.inputToolBar]} />;
    }
  }

  renderComposer(props) {
    return (
      <Composer
        {...props}
        placeholder={"Type a message..."}
        placeholderColor={"#BCBCBC"}
        textInputStyle={styles.composerText}
      />
    );
  }

  // shows the Action menu (imagePicker, Camera, Location) sub-menu in Chat window
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  //renders a Map View when the message is a location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          showsUserLocation={true}
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            longitude: Number(currentMessage.location.longitude),
            latitude: Number(currentMessage.location.latitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  renderBubble(props) {
    let backgroundColor = this.props.route.params.backgroundColor;
    //purple
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
    // gray
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
    //green
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
      //black
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
        <ImageBackground style={styles.chatBackground} source={chatBackground}>
          <Text>{this.state.loggedInText}</Text>
          <GiftedChat
            messages={this.state.messages}
            onSend={(messages) => this.onSend(messages)}
            user={this.state.user}
            renderBubble={this.renderBubble.bind(this)}
            renderDay={this.renderDay.bind(this)}
            renderInputToolbar={this.renderInputToolbar.bind(this)}
            renderActions={this.renderCustomActions}
            renderCustomView={this.renderCustomView}
            renderSystemMessage={this.renderSystemMessage.bind(this)}
            isTyping={true}
            renderUsernameOnMessage={true}
            isConnected={this.state.isConnected}
            renderSend={(props) => {
              return (
                <Send {...props}>
                  <IconButton
                    icon="send-circle"
                    style={{ paddingTop: 17 }}
                    size={36}
                    color="#696969"
                  />
                </Send>
              );
            }}
          />
          {Platform.OS === "android" ? (
            <KeyboardAvoidingView behavior="height" />
          ) : null}
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputToolBar: {
    paddingTop: 5,
  },
  chatBackground: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
});
