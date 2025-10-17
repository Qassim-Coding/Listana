import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddMovieModal({ visible, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [runtime, setRuntime] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");

  const handleSubmit = () => {
    onSubmit({
      title,
      year: year ? parseInt(year, 10) : undefined,
      runtime: runtime ? parseInt(runtime, 10) : undefined,
      review,
      // si l’utilisateur n’a rien saisi, on met la date du jour
      startedAt: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
    });

    // reset des champs
    setTitle("");
    setYear("");
    setRuntime("");
    setReview("");
    setStartedAt("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.label}>Titre</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="Ex: Inception"
          />

          <Text style={styles.label}>Année</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            style={styles.input}
            placeholder="Ex: 2010"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Durée (min)</Text>
          <TextInput
            value={runtime}
            onChangeText={setRuntime}
            style={styles.input}
            placeholder="Ex: 148"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Avis</Text>
          <TextInput
            value={review}
            onChangeText={setReview}
            style={styles.input}
            placeholder="Ton avis sur le film"
            multiline
          />

          <Text style={styles.label}>Date de début</Text>
          <TextInput
            value={startedAt}
            onChangeText={setStartedAt}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <View style={styles.row}>
            <Pressable onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
              <Text style={styles.btnText}>Annuler</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} style={[styles.btn, styles.addBtn]}>
              <Text style={[styles.btnText, { color: "#fff" }]}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  label: { fontWeight: "bold", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: Platform.OS === "ios" ? 12 : 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: "#eee",
  },
  addBtn: {
    backgroundColor: "#12AAB8",
  },
  btnText: {
    fontWeight: "bold",
  },
});