import React, { useState, Component } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";

//background image & chat icon
const background = require("../assets/background.png");
const icon = require("../assets/chaticon.png");

export default class Start extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", backgroundColor: "#757083" };
  }

  // Check for username
  onGoToChat = (name, backgroundColor) => {
    if (name == "") {
      return Alert.alert("Please enter your name.");
    }
    this.props.navigation.navigate("Chat", {
      name: this.state.name,
      backgroundColor: this.state.backgroundColor,
    });
  };

  render() {
    return (
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Welcome!</Text>

          {/* white box */}
          <View style={styles.box}>
            {/* enter user name */}
            <View style={styles.nameBox}>
              <Image style={styles.nameIcon} source={icon} />
              <TextInput
                style={styles.nameText}
                onChangeText={(name) => this.setState({ name })}
                value={this.state.name}
                placeholder="Enter Your Name"
                placeholderTextColor="#757083"
              />
            </View>
            {/* end enter user name */}

            {/* pick background color */}
            <View style={styles.colorPickerContainer}>
              <Text style={styles.chooseColor}>Choose Background Color:</Text>
              <View style={styles.colorPicker}>
                <TouchableOpacity
                  //#090C08; #474056; #8A95A5; #B9C6AE colors
                  style={[
                    styles.colors,
                    styles.black,
                    this.state.backgroundColor === "#090c08"
                      ? styles.border
                      : null,
                  ]}
                  onPress={() => this.setState({ backgroundColor: "#090c08" })}
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.colors,
                    styles.purple,
                    this.state.backgroundColor === "#474056"
                      ? styles.border
                      : null,
                  ]}
                  onPress={() => this.setState({ backgroundColor: "#474056" })}
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.colors,
                    styles.gray,
                    this.state.backgroundColor === "#8A95A5"
                      ? styles.border
                      : null,
                  ]}
                  onPress={() => this.setState({ backgroundColor: "#8A95A5" })}
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.colors,
                    styles.green,
                    this.state.backgroundColor === "#B9C6AE"
                      ? styles.border
                      : null,
                  ]}
                  onPress={() => this.setState({ backgroundColor: "#B9C6AE" })}
                ></TouchableOpacity>
              </View>
            </View>
            <View>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Go to chat"
                accessibilityHint="Takes you to the chat screen."
                accessibilityRole="button"
                style={styles.button}
                onPress={() =>
                  this.onGoToChat(this.state.name, this.state.backgroundColor)
                }
              >
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column-reverse",
    alignItems: "center",
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#fff",
    position: "absolute",
    top: 100,
  },
  box: {
    width: "88%",
    height: 320,
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
  },
  nameBox: {
    flex: 1,
    width: "88%",
  },
  nameText: {
    top: 25,
    height: 60,
    borderColor: "#757083",
    borderWidth: 2,
    fontSize: 16,
    fontWeight: "300",
    paddingLeft: 45,
    borderRadius: 10,
  },
  nameIcon: {
    position: "absolute",
    top: 45,
    left: 15,
  },
  colorPickerContainer: {
    position: "absolute",
    alignItems: "center",
  },
  chooseColor: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
  },
  colorPicker: {
    flexDirection: "row",
    marginTop: 15,
    width: "92%",
  },
  colors: {
    width: 45,
    height: 45,
    marginRight: 20,
    borderRadius: 45 / 2,
  },
  black: {
    backgroundColor: "#090C08",
  },
  purple: {
    backgroundColor: "#474056",
  },
  gray: {
    backgroundColor: "#8A95A5",
  },
  green: {
    backgroundColor: "#B9C6AE",
  },
  button: {
    flex: 1,
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#757083",
    width: "88%",
    height: 60,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imgBackground: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  border: {
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: "#757083",
  },
});
