import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useStore } from "../store/useStore";

const ShoppingItem = ({ item, onToggle, onDelete, onLongPress }) => {
  const { isDarkMode } = useStore();

  const themeItem = isDarkMode ? styles.darkItem : styles.lightItem;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;

  return (
    <View style={[styles.item, themeItem]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onToggle}
        onLongPress={onLongPress}
        delayLongPress={500}
      >
        <Text style={styles.icon}>{item.completed ? "✅" : "⚪️"}</Text>
        <View style={styles.textBlock}>
          <Text
            style={[styles.itemText, themeText, item.completed && styles.done]}
          >
            {item.text}
          </Text>
          {item.note ? <Text style={styles.note}>📝 {item.note}</Text> : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onDelete}>
        <Text style={[styles.deleteBtn, isDarkMode && styles.deleteBtnDark]}>
          🗑️
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  lightItem: { backgroundColor: "#FFF" },
  darkItem: { backgroundColor: "#1E1E1E" },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textBlock: {
    flex: 1,
  },
  icon: {
    marginRight: 10,
    fontSize: 18,
  },
  itemText: {
    fontSize: 17,
  },
  lightText: { color: "#333" },
  darkText: { color: "#FFF" },
  done: {
    textDecorationLine: "line-through",
    color: "#AAA",
  },
  note: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
  },
  deleteBtn: {
    fontSize: 20,
    paddingLeft: 10,
  },
  deleteBtnDark: {
    color: "#FF453A",
  },
});

export default ShoppingItem;
