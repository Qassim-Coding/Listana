import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardEvent, LayoutChangeEvent, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void; // appelé par le bouton (ou le geste) retour d'Android
  children: ReactNode;
  fill?: boolean; // fenêtre haute (éditeur de note) : le contenu gère lui-même son défilement
  dismissOnBackdrop?: boolean; // toucher le fond sombre ferme la fenêtre (sélecteurs sans saisie importante)
};

// La fenêtre du bas, commune à tous les formulaires d'ajout et de modification.
// 1. Le fond sombre couvre TOUT l'écran, séparément de la fenêtre : il ne peut plus y avoir de trou en bas.
// 2. La fenêtre remonte au-dessus du clavier, puis redescend dès qu'il se ferme.
// 3. Une marge garde les boutons au-dessus de la barre de navigation d'Android,
//    et la fenêtre ne passe jamais sous la barre d'état (heure, batterie).
export default function BottomSheet({ visible, onClose, children, fill = false, dismissOnBackdrop = false }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(0);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);

  // On écoute le clavier : où commence-t-il à l'écran ?
  useEffect(() => {
    if (Platform.OS === "web") return;
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e: KeyboardEvent) => setKeyboardTop(e.endCoordinates.screenY));
    const onHide = Keyboard.addListener(hideEvent, () => setKeyboardTop(null));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  // Fenêtre fermée : on oublie le clavier, pour repartir propre à la prochaine ouverture
  useEffect(() => {
    if (!visible) setKeyboardTop(null);
  }, [visible]);

  // Hauteur cachée par le clavier. Si Android a déjà réduit l'écran pour le clavier, elle vaut 0.
  const keyboardOverlap =
    keyboardTop !== null && screenHeight > 0 ? Math.max(0, screenHeight - keyboardTop) : 0;
  const keyboardOpen = keyboardOverlap > 0;
  const topGap = fill ? 24 : 8;
  const maxHeight = screenHeight > 0 ? screenHeight - insets.top - topGap - keyboardOverlap : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} onLayout={(e: LayoutChangeEvent) => setScreenHeight(e.nativeEvent.layout.height)}>
        {/* Fond sombre plein écran, indépendant de la fenêtre */}
        {dismissOnBackdrop ? (
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        ) : (
          <View style={styles.backdrop} />
        )}

        <View style={[styles.sheet, { marginBottom: keyboardOverlap }, fill ? { height: maxHeight } : { maxHeight }]}>
          {fill ? (
            <View style={[styles.content, styles.fillContent, { paddingBottom: 12 + (keyboardOpen ? 0 : insets.bottom) }]}>
              <View style={styles.handle} />
              {children}
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.content,
                // Clavier fermé : on laisse la place de la barre de navigation d'Android
                { paddingBottom: 20 + (keyboardOpen ? 0 : insets.bottom) },
              ]}
            >
              <View style={styles.handle} />
              {children}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: t.border,
      overflow: "hidden",
    },
    content: { padding: 20, paddingTop: 10 },
    fillContent: { flex: 1 },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 14,
    },
  });
}
