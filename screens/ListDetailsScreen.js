import React, { useState, useEffect } from "react";
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
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  updateDoc,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import ShoppingItem from "../components/ShoppingItem";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";

export default function ListDetailsScreen({ route }) {
  const { listId } = route.params;
  const headerHeight = useHeaderHeight();
  const { t, i18n } = useTranslation();
  const { isDarkMode, userName } = useStore();

  const [task, setTask] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [members, setMembers] = useState([]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    const unsubItems = onSnapshot(
      query(
        collection(db, "items"),
        where("listId", "==", listId),
        orderBy("createdAt", "asc"),
      ),
      (snap) => {
        setItems(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      },
    );

    const listRef = doc(db, "lists", listId);
    const unsubList = onSnapshot(listRef, async (snap) => {
      const data = snap.data();
      if (!data) return;
      setTypingUser(
        data.typingUserId && data.typingUserId !== auth.currentUser?.uid
          ? data.typingUserName
          : null,
      );
      if (data.members?.length > 0) {
        const uSnap = await getDocs(
          query(collection(db, "users"), where("uid", "in", data.members)),
        );
        setMembers(uSnap.docs.map((d) => d.data()));
      }
    });

    return () => {
      updateDoc(doc(db, "lists", listId), { typingUserId: null }).catch(
        () => {},
      );
      unsubItems();
      unsubList();
    };
  }, [listId]);

  const handleTyping = async (text) => {
    setTask(text);
    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      typingUserId: text.length > 0 ? auth.currentUser.uid : null,
      typingUserName:
        text.length > 0
          ? userName || auth.currentUser.email.split("@")[0]
          : null,
    });
  };

  const handleAddItem = async () => {
    if (!task.trim()) return;
    try {
      await addDoc(collection(db, "items"), {
        listId,
        text: task,
        note: note.trim(),
        completed: false,
        createdAt: new Date(),
      });
      setTask("");
      setNote("");
      await updateDoc(doc(db, "lists", listId), { typingUserId: null });
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert(t("error"), e.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTask(item.text);
    setEditNote(item.note || "");
    setIsEditModalVisible(true);
  };

  const handleUpdateItem = async () => {
    if (!editTask.trim()) return;
    try {
      await updateDoc(doc(db, "items", editingItem.id), {
        text: editTask,
        note: editNote.trim(),
      });
      setIsEditModalVisible(false);
    } catch (e) {
      Alert.alert(t("error"), e.message);
    }
  };

  const themeInput = isDarkMode ? styles.darkInput : styles.lightInput;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={headerHeight}
          style={{ flex: 1 }}
        >
          <View style={styles.membersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text
                style={[
                  styles.memberLabel,
                  { color: isDarkMode ? "#666" : "#999" },
                ]}
              >
                {t("members_label")}:
              </Text>
              {members.map((m) => (
                <View
                  key={m.uid}
                  style={[
                    styles.badge,
                    { backgroundColor: isDarkMode ? "#333" : "#DDD" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? "#FFF" : "#333",
                    }}
                  >
                    👤{" "}
                    {m.uid === auth.currentUser?.uid
                      ? t("you")
                      : m.displayName || "User"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {items.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggle={() =>
                  updateDoc(doc(db, "items", item.id), {
                    completed: !item.completed,
                  })
                }
                onDelete={() => deleteDoc(doc(db, "items", item.id))}
                onLongPress={() => openEditModal(item)}
              />
            ))}
          </ScrollView>

          {typingUser && (
            <Text style={styles.typing}>
              ✍️ {typingUser} {t("typing")}
            </Text>
          )}

          <View
            style={[
              styles.footer,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
            ]}
          >
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  key={`task-${i18n.language}`}
                  style={[styles.input, themeInput]}
                  placeholder={t("buy_placeholder")}
                  value={task}
                  onChangeText={handleTyping}
                  placeholderTextColor={isDarkMode ? "#777" : "#CCC"}
                />
                <TextInput
                  key={`note-${i18n.language}`}
                  style={[styles.input, styles.smallInput, themeInput]}
                  placeholder={t("note_placeholder")}
                  value={note}
                  onChangeText={setNote}
                  placeholderTextColor={isDarkMode ? "#666" : "#CCC"}
                />
              </View>
              <TouchableOpacity onPress={handleAddItem} style={styles.addBtn}>
                <Text style={{ color: "#FFF", fontSize: 24 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Modal visible={isEditModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
              ]}
            >
              <Text style={[styles.modalTitle, themeText]}>{t("edit")}</Text>
              <TextInput
                style={[styles.input, themeInput]}
                value={editTask}
                onChangeText={setEditTask}
              />
              <TextInput
                style={[styles.input, styles.smallInput, themeInput]}
                value={editNote}
                onChangeText={setEditNote}
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={themeText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#55BCF6" }]}
                  onPress={handleUpdateItem}
                >
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkBg: { backgroundColor: "#121212" },
  lightBg: { backgroundColor: "#F5F5F5" },
  membersRow: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  memberLabel: { fontSize: 10, marginRight: 8, alignSelf: "center" },
  badge: { padding: 6, borderRadius: 10, marginRight: 5, flexDirection: "row" },
  typing: {
    paddingLeft: 20,
    color: "#55BCF6",
    fontStyle: "italic",
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 5,
  },
  smallInput: { fontSize: 13, padding: 6 },
  lightInput: { backgroundColor: "#FFF", borderColor: "#DDD", color: "#333" },
  darkInput: { backgroundColor: "#1E1E1E", borderColor: "#444", color: "#FFF" },
  addBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#55BCF6",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "85%", padding: 20, borderRadius: 15 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalBtn: {
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  darkText: { color: "#FFF" },
  lightText: { color: "#333" },
});
