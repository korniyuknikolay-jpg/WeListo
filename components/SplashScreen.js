import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛒</Text>
      <ActivityIndicator size="large" color="#55BCF6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#55BCF6",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
});

export default SplashScreen;
