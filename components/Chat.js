import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

export default class Chat extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let name = this.props.route.params.name;
    let backgroundColor = this.props.route.params.backgroundColor;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: backgroundColor,
        }}
      >
        <View>
          <Text style={styles.welcomeText}>Hello {name}!</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});