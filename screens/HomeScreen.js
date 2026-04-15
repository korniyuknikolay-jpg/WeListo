import React, { useState, useEffect } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  orderBy,
  where,
  arrayUnion,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { setStringAsync } from "expo-clipboard";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
import { generateInviteCode } from "../utils/inviteCodeGenerator";

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useStore();
  const [listName, setListName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [shoppingLists, setShoppingLists] = useState([]);
  const headerHeight = useHeaderHeight();

  const handleJoinList = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (code.length > 0) {
      try {
        const q = query(
          collection(db, "lists"),
          where("inviteCode", "==", code),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const listDoc = querySnapshot.docs[0];
          const listRef = doc(db, "lists", listDoc.id);

          await updateDoc(listRef, {
            members: arrayUnion(auth.currentUser.uid),
          });
          setInviteCode("");
          Alert.alert(
            t("success"),
            `${t("joined_to")} "${listDoc.data().title}"`,
          );
          Keyboard.dismiss();
        } else {
          Alert.alert(t("error"), t("list_not_found"));
        }
      } catch (e) {
        Alert.alert(t("error"), t("join_error"));
      }
    }
  };

  const copyToClipboard = async (inviteCode) => {
    try {
      await setStringAsync(inviteCode);
      Alert.alert(t("copied"), t("invite_code_copied"));
    } catch (error) {
      Alert.alert(t("error"), t("copy_error"));
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "lists"),
      where("members", "array-contains", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listsArray = [];
      querySnapshot.forEach((doc) => {
        listsArray.push({ ...doc.data(), id: doc.id });
      });
      setShoppingLists(listsArray);
    });

    return () => unsubscribe();
  }, []);

  const handleAddList = async () => {
    if (listName.trim().length === 0) return;

    try {
      let uniqueCode = generateInviteCode();
      let codeExists = true;

      for (let i = 0; i < 3; i++) {
        const q = query(
          collection(db, "lists"),
          where("inviteCode", "==", uniqueCode),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          codeExists = false;
          break;
        }
        uniqueCode = generateInviteCode();
      }

      if (codeExists) {
        Alert.alert(t("error"), t("unique_code_error"));
        return;
      }

      await addDoc(collection(db, "lists"), {
        title: listName,
        createdAt: new Date(),
        owner: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        inviteCode: uniqueCode,
      });

      setListName("");
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert(t("error"), error.message);
    }
  };

  const deleteList = async (id) => {
    try {
      await deleteDoc(doc(db, "lists", id));
      Alert.alert(t("success"), t("list_deleted"));
    } catch (error) {
      Alert.alert(t("error"), error.message);
    }
  };

  const confirmDeleteList = (id, title) => {
    Alert.alert(
      t("delete_list"),
      `${t("delete_list_confirm")} "${title}"?`,
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => deleteList(id),
        },
      ],
      { cancelable: true },
    );
  };

  const themeContainer = isDarkMode
    ? styles.darkContainer
    : styles.lightContainer;
  const themeCard = isDarkMode ? styles.darkCard : styles.lightCard;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;
  const themeInput = isDarkMode ? styles.darkInput : styles.lightInput;

  return (
    <View style={[styles.container, themeContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.joinContainer,
            isDarkMode && { backgroundColor: "#1E1E1E" },
          ]}
        >
          <TextInput
            key={i18n.language}
            style={[styles.joinInput, themeText]}
            placeholder={t("enter_invite_code")}
            placeholderTextColor={isDarkMode ? "#999" : "#666"}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity onPress={handleJoinList} style={styles.joinButton}>
            <Text style={styles.joinButtonText}>OK</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {shoppingLists.map((list) => (
            <View key={list.id} style={[styles.listItem, themeCard]}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ListDetails", {
                      listId: list.id,
                      listTitle: list.title,
                    })
                  }
                >
                  <Text style={[styles.listTitle, themeText]}>
                    📓 {list.title}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => copyToClipboard(list.inviteCode)}
                >
                  <Text style={styles.listIdText}>
                    🔑 {t("invite_code")}: {list.inviteCode}{" "}
                    <Text style={{ color: "#55BCF6" }}>({t("copy")})</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => confirmDeleteList(list.id, list.title)}
              >
                <Text
                  style={[styles.deleteBtn, isDarkMode && { color: "#FF453A" }]}
                >
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.footer,
            isDarkMode && {
              backgroundColor: "#121212",
              borderTopColor: "#333",
            },
          ]}
        >
          <TextInput
            key={i18n.language}
            style={[styles.input, themeInput]}
            placeholder={t("new_list_placeholder")}
            placeholderTextColor={isDarkMode ? "#999" : "#ccc"}
            value={listName}
            onChangeText={setListName}
          />
          <TouchableOpacity onPress={handleAddList} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: "#F5F5F5" },
  darkContainer: { backgroundColor: "#121212" },
  lightText: { color: "#333" },
  darkText: { color: "#FFF" },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  listItem: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  lightCard: { backgroundColor: "#FFF" },
  darkCard: { backgroundColor: "#1E1E1E" },
  listTitle: { fontSize: 18, fontWeight: "500" },
  deleteBtn: { fontSize: 22 },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  input: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
  },
  lightInput: { backgroundColor: "#FFF", borderColor: "#DDD", color: "#333" },
  darkInput: { backgroundColor: "#1E1E1E", borderColor: "#444", color: "#FFF" },
  button: {
    width: 55,
    height: 55,
    backgroundColor: "#55BCF6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 30, marginBottom: 4 },
  joinContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  joinInput: { flex: 1, fontSize: 14 },
  joinButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: { color: "#FFF", fontWeight: "bold" },
  listIdText: { fontSize: 10, color: "#999", marginTop: 5 },
});
