import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    if (email.trim().length < 5 || password.length < 6) {
      return Alert.alert(t("error"), t("min_length_error"));
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const res = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName: email.split("@")[0],
          email: email.trim(),
        });
      }
    } catch (e) {
      Alert.alert(t("error"), e.message);
    }
  };

  const themeContainer = isDarkMode
    ? styles.darkContainer
    : styles.lightContainer;
  const themeInput = isDarkMode ? styles.darkInput : styles.lightInput;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;
  const themeTitle = isDarkMode ? styles.darkTitle : styles.lightTitle;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeContainer]}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, themeTitle]}>WeListo</Text>

        <TextInput
          style={[styles.input, themeInput]}
          placeholder={t("email")}
          placeholderTextColor={isDarkMode ? "#999" : "#666"}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, themeInput]}
          placeholder={t("password")}
          placeholderTextColor={isDarkMode ? "#999" : "#666"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isLogin ? t("login") : t("register")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={[styles.linkText, themeText]}>
            {isLogin ? t("no_account") : t("have_account")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: "#F5F5F5" },
  darkContainer: { backgroundColor: "#121212" },
  inner: { flex: 1, justifyContent: "center", padding: 30 },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  lightTitle: { color: "#333" },
  darkTitle: { color: "#FFF" },
  input: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  lightInput: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    color: "#333",
  },
  darkInput: {
    backgroundColor: "#1E1E1E",
    borderColor: "#444",
    color: "#FFF",
  },
  button: {
    backgroundColor: "#55BCF6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  link: { marginTop: 25, alignItems: "center" },
  linkText: { color: "#55BCF6", fontSize: 14 },
  lightText: { color: "#333" },
  darkText: { color: "#FFF" },
});
