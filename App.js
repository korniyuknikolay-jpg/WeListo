import React, { useState, useEffect } from "react";
import {
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./i18n";
import { useStore } from "./store/useStore";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ListDetailsScreen from "./screens/ListDetailsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { useTranslation } from "react-i18next";

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { isDarkMode } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      t("exit"),
      t("exit_question"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("exit"),
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert(t("error"), error.message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            color: isDarkMode ? "#FFF" : "#333",
          },
          headerTintColor: isDarkMode ? "#FFF" : "#55BCF6",
          headerTitleAlign: "center",
        }}
      >
        {user ? (
          <Stack.Group>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: "🛒 WeListo",
                headerLeft: () => (
                  <TouchableOpacity
                    style={styles.headerLeftBtn}
                    onPress={() => navigation.navigate("Settings")}
                  >
                    <Text style={styles.headerLeftText}>⚙️</Text>
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleSignOut}
                  >
                    <Text style={styles.logoutText}>{t("exit")}</Text>
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="ListDetails"
              component={ListDetailsScreen}
              options={({ route }) => ({
                title: route.params.listTitle,
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: t("settings"),
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerLeftBtn: {
    marginLeft: 15,
  },
  headerLeftText: {
    fontSize: 22,
  },
  logoutBtn: {
    marginRight: 15,
    padding: 5,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
  },
});
