import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import firebase from "firebase";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { IconButton } from "react-native-paper";

export default class CustomActions extends React.Component {
  // Choose a photo from image library
  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({
            image: imageUrl,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Take a photo
  takePhoto = async () => {
    // asks permission for camera and media library
    const { status } = await Camera.requestCameraPermissionsAsync();

    try {
      if (status === "granted") {
        // launches camera
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        // uploads image to database and sends in chat bubble
        if (!ImagePicker.getPendingResultAsync.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl, text: "" });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Upload image to Firebase in blob format
  uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      // Create new XMLHttp request
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      // Opens connection to receive image data and reponds as blob
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    // Creates unique file names for storage
    const imageNameBefore = uri.split("/");
    const imageName = imageNameBefore[imageNameBefore.length - 1];

    // Reference remote DB
    const ref = firebase.storage().ref().child(`images/${imageName}`);

    const snapshot = await ref.put(blob);
    // Close connection
    blob.close();

    // Returns unique image URL from the remote DB
    return await snapshot.ref.getDownloadURL();
  };

  //share location
  getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await Location.getCurrentPositionAsync({}).catch((error) =>
          console.log(error)
        );
        const longitude = JSON.stringify(result.coords.longitude);
        const latitude = JSON.stringify(result.coords.latitude);
        if (result) {
          this.props.onSend({
            location: {
              longitude: longitude,
              latitude: latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <TouchableOpacity style={[styles.container]}>
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <IconButton
            icon="camera"
            size={30}
            color="#b6b6b6"
            style={{ marginRight: -17 }}
            accessibilityLabel="Action button"
            accessibilityHint="Take a photo"
            onPress={this.takePhoto}
          />

          <IconButton
            icon="image"
            size={30}
            color="#b6b6b6"
            accessibilityLabel="Action button"
            accessibilityHint="Share an image"
            onPress={this.pickImage}
            style={{ marginRight: -19 }}
          />
          <IconButton
            icon="map-marker"
            size={30}
            color="#b6b6b6"
            accessibilityLabel="Action button"
            accessibilityHint="Share location"
            onPress={this.getLocation}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: 110,
    height: 26,
    marginBottom: 10,
  },
  wrapper: {
    flex: 1,
    flexDirection: "row",
    marginRight: 20,
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
