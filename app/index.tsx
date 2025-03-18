import axios, { Axios, isAxiosError } from "axios";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
} from "react-native";

export default function Index() {
  const [devices, setDevices] = useState(() => []);

  useSpeechRecognitionEvent("result", (event) => {
    if (!event.isFinal) return;
    sendCommand(event.results[0]?.transcript);
  });

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync();
    (async () => setDevices(await getDevices()))();
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "grey" : "lightblue",
          },
          s.button,
        ]}
        onPressIn={startSpeechRecognition}
        onPressOut={stopSpeechRecognition}
      >
        <Text style={s.buttonText}>Maintenez appuyer pour parler</Text>
      </Pressable>
      <FlatList data={devices} renderItem={() => <></>} />
    </SafeAreaView>
  );
}

const getDevices = async () => {
  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/api/v1/devices`
    );
    return response.data;
  } catch (e) {
    return [];
  }
};

const sendCommand = async (speech: string) => {
  try {
    await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/api/v1/process-command`,
      { text: speech }
    );
  } catch (e) {}
};

const startSpeechRecognition = () => {
  ExpoSpeechRecognitionModule.start({
    lang: "fr-FR",
    interimResults: true,
    maxAlternatives: 1,
    requiresOnDeviceRecognition: false,
    addsPunctuation: false,
    contextualStrings: ["Commande", "Lumière"],
  });
};

const stopSpeechRecognition = () => {
  ExpoSpeechRecognitionModule.stop();
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
    padding: "10%",
    aspectRatio: 1,
    borderRadius: 99,
    marginTop: "20%",
    marginBottom: "10%",
  },
  buttonText: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
