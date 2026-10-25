import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { NoteKind, NoteWork } from "../types/note";
import { LibraryWork, WORK_LABEL, loadLibraryWorks, workColor } from "../utils/libraryWorks";
import BottomSheet from "./BottomSheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (kind: NoteKind, work?: NoteWork) => void;
  // true = seulement le choix d'une œuvre (pour « Changer » ou « Lier à une œuvre »)
  worksOnly?: boolean;
};

export default function NewNoteSheet({ visible, onClose, onPick, worksOnly = false }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [works, setWorks] = useState<LibraryWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setQuery("");
    setLoading(true);
    loadLibraryWorks()
      .then((w) => {
        if (active) setWorks(w);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const q = query.trim().toLowerCase();
  const shown = q
    ? works.filter((w) => w.title.toLowerCase().includes(q)).slice(0, 12)
    : works.filter((w) => w.inProgress).slice(0, 6);

  function pickWork(w: LibraryWork) {
    onPick("work", { key: w.key, id: w.id, title: w.title, meta: w.meta });
  }

  const listColor = t.accent;

  return (
    <BottomSheet visible={visible} onClose={onClose} dismissOnBackdrop>
      <View style={styles.headRow}>
        <Text style={styles.heading}>{worksOnly ? "Choisir une œuvre" : "Nouvelle note"}</Text>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.cancelBtn}>
          <Text style={styles.cancel}>Annuler</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {!worksOnly && (
          <>
            <Pressable onPress={() => onPick("free")} accessibilityRole="button" style={styles.typeBtn}>
              <View style={[styles.typeIcon, { backgroundColor: t.media.notes + "24" }]}>
                <Text style={[styles.typeIconText, { color: t.media.notes }]}>Aa</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Note libre</Text>
                <Text style={styles.typeSub}>Idées, pensées, brouillons</Text>
              </View>
            </Pressable>

            <Pressable onPress={() => onPick("list")} accessibilityRole="button" style={styles.typeBtn}>
              <View style={[styles.typeIcon, { backgroundColor: listColor + "24" }]}>
                <Ionicons name="checkbox-outline" size={20} color={t.scheme === "dark" ? listColor : t.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Liste à cocher</Text>
                <Text style={styles.typeSub}>Courses, à faire, valise…</Text>
              </View>
            </Pressable>
          </>
        )}

        <View style={[styles.workBox, !worksOnly && { borderColor: t.accent }]}>
          {!worksOnly && (
            <View style={styles.workHead}>
              <View style={[styles.typeIcon, { backgroundColor: listColor + "24" }]}>
                <Ionicons name="link-outline" size={20} color={t.scheme === "dark" ? listColor : t.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Note sur une œuvre</Text>
                <Text style={styles.typeSub}>Liée à un livre, un manga, un épisode…</Text>
              </View>
            </View>
          )}

          <View style={styles.search}>
            <Ionicons name="search-outline" size={16} color={t.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Chercher dans ma bibliothèque"
              placeholderTextColor={t.textMuted}
              accessibilityLabel="Chercher dans ma bibliothèque"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.section}>{q ? "RÉSULTATS" : "EN COURS"}</Text>

          {loading ? (
            <ActivityIndicator color={t.accent} style={{ marginVertical: 12 }} />
          ) : shown.length === 0 ? (
            <Text style={styles.empty}>
              {q ? "Aucune œuvre trouvée." : "Rien en cours. Cherche une œuvre par son titre."}
            </Text>
          ) : (
            shown.map((w) => {
              const c = workColor(t, w.key);
              return (
                <Pressable
                  key={`${w.key}-${w.id}`}
                  onPress={() => pickWork(w)}
                  accessibilityRole="button"
                  accessibilityLabel={`${w.title}, ${WORK_LABEL[w.key]}`}
                  style={({ pressed }) => [styles.workRow, pressed && { backgroundColor: t.cardAlt }]}
                >
                  <View style={[styles.avatar, { backgroundColor: c + "38" }]}>
                    <Text style={[styles.avatarText, { color: c }]}>{w.title.trim().charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.workTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    <Text style={[styles.workMeta, { color: c }]} numberOfLines={1}>
                      {WORK_LABEL[w.key]} · {w.meta}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44, marginBottom: 12 },
    list: { gap: 8 },
    heading: { fontFamily: t.fonts.bold, fontSize: t.fs(22), color: t.text },
    cancelBtn: { minHeight: 44, justifyContent: "center" },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    typeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      minHeight: 64,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.cardAlt,
    },
    typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    typeIconText: { fontFamily: t.fonts.bold, fontSize: t.fs(16) },
    typeTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    typeSub: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    workBox: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: t.border, backgroundColor: t.cardAlt },
    workHead: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.bg,
    },
    searchInput: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.text, paddingVertical: 8 },
    section: { fontFamily: t.fonts.bold, fontSize: t.fs(11), letterSpacing: 0.5, color: t.textMuted, marginTop: 12, marginBottom: 4 },
    empty: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted, paddingVertical: 8 },
    workRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderRadius: 10, paddingHorizontal: 4 },
    avatar: { width: 30, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: t.fonts.bold, fontSize: t.fs(14) },
    workTitle: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    workMeta: { fontFamily: t.fonts.regular, fontSize: t.fs(12) },
  });
}