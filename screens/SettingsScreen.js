import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
import { auth, db } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SettingsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const {
    isDarkMode,
    toggleTheme,
    userName,
    setProfile,
    language,
    setLanguage,
  } = useStore();
  const [newName, setNewName] = useState(
    userName || auth.currentUser?.displayName || "",
  );

  const handleSaveProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            displayName: newName,
            uid: auth.currentUser.uid,
          },
          { merge: true },
        );
        setProfile(newName, null);
        Alert.alert(t("success"), t("profile_updated"));
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <ScrollView
      style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#333" }]}>
        {t("profile")}
      </Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={newName}
        onChangeText={setNewName}
      />
      <TouchableOpacity style={styles.btn} onPress={handleSaveProfile}>
        <Text style={{ color: "#FFF" }}>{t("save")}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={{ color: isDarkMode ? "#FFF" : "#333" }}>
          {t("dark_theme")}
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? "#FFF" : "#333", marginTop: 20 },
          ]}
        >
          {t("language")}
        </Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, language === "ru" && styles.activeLang]}
            onPress={() => changeLanguage("ru")}
          >
            <Text style={language === "ru" && { color: "#FFF" }}>RU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === "en" && styles.activeLang]}
            onPress={() => changeLanguage("en")}
          >
            <Text style={language === "en" && { color: "#FFF" }}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  darkBg: { backgroundColor: "#121212" },
  lightBg: { backgroundColor: "#F5F5F5" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 10,
  },
  darkInput: { backgroundColor: "#333", color: "#FFF", borderColor: "#444" },
  btn: {
    backgroundColor: "#55BCF6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  langBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  activeLang: { backgroundColor: "#55BCF6", borderColor: "#55BCF6" },
});
