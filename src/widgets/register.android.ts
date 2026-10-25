import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "./widgetTaskHandler";

// Android uniquement (le suffixe .android.ts) : branche les widgets de Listana.
registerWidgetTaskHandler(widgetTaskHandler);
