import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Importar Picker do pacote correto
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const CriadorDeSala = () => {
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [mostrarMensagem, setMostrarMensagem] = useState(false);
  const [nomeSala, setNomeSala] = useState("");
  const [valorPicker, setValorPicker] = useState("Área 1 (inferior)");
  const [andarSelecionado, setAndarSelecionado] = useState("Área 1 (inferior)");

  const mostrarMensagemTemporaria = () => {
    setMostrarMensagem(true);
    setTimeout(() => setMostrarMensagem(false), 5000); // Mostrar por 5 segundos
  };

  const selecionarImagem = async () => {
    const permissaoResultado = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissaoResultado.granted === false) {
      Alert.alert("Permissão necessária", "Permissão para acessar a biblioteca de mídia é necessária.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.cancelled) {
      setImagemSelecionada(pickerResult);
    }
  };

  const subirSala = () => {
    // Valide os campos, se necessário
    if (nomeSala.trim() === "") {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    // Criar objeto turma com os dados
    const novaSala = {
      nomeSala: nomeSala,
      posicaoSala: valorPicker,
      url_imagem: nomeSala + ".png",
    };

    // Enviar os dados para o back-end
    fetch("https://appback.azurewebsites.net/salas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaSala),
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert("Sucesso", "Sala adicionada com sucesso");
          setImagemSelecionada(null);
          setNomeSala("");
        } else {
          throw new Error("Erro ao adicionar sala");
        }
      })
      .catch((error) => {
        console.error("Erro ao adicionar sala:", error);
        Alert.alert(
          "Erro",
          "Erro ao adicionar sala. Por favor, tente novamente mais tarde."
        );
      });
  };

  const subirImagem = async (nomeDaSala) => {
    if (!imagemSelecionada) {
      Alert.alert("Erro", "Por favor, selecione uma imagem antes de fazer o upload.");
      return;
    }

    try {
      const response = await fetch(imagemSelecionada.uri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob);

      const uploadResponse = await axios.post(
        `http://10.110.12.19:8080/salas/upload/${nomeDaSala}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      mostrarMensagemTemporaria();
      console.log("Resposta do servidor:", uploadResponse.data);
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error);
    }
  };

  const subirTudo = () => {
    subirSala();
    subirImagem(nomeSala);
  };

  const handleChange = (itemValue) => {
    setValorPicker(itemValue);
    switch (itemValue) {
      case "Área 1 (superior)":
        setAndarSelecionado("Área 1 (superior)");
        break;
      case "Área 1 (inferior)":
        setAndarSelecionado("Área 1 (inferior)");
        break;
      case "Área 2":
        setAndarSelecionado("Área 2");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        Criar sala
      </Text>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "80%",
          width: "100%",
        }}
      >
        {imagemSelecionada && (
          <Text style={{ fontSize: 14, fontStyle: 'italic', color: 'black', marginBottom: 5 }}>Prévia</Text>
        )}
        {imagemSelecionada && (
          <Image
            source={{ uri: imagemSelecionada.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Pressable style={styles.button} onPress={selecionarImagem}>
          <Text style={styles.buttonText}>Selecionar Imagem</Text>
        </Pressable>

        <TextInput
          placeholder="Nome da sala"
          value={nomeSala}
          onChangeText={(text) => setNomeSala(text)}
          style={{
            backgroundColor: 'white',
            height: 30,
            width: "40%",
            borderWidth: 2,
            fontSize: 18,
            margin: 20,
          }}
        />

        <Picker
          selectedValue={valorPicker}
          onValueChange={handleChange}
          style={{ height: 30, width: "30%", marginBottom: 20, fontSize: 18 }}
        >
          <Picker.Item label="Área 1 (inferior)" value="Área 1 (inferior)" />
          <Picker.Item label="Área 1 (superior)" value="Área 1 (superior)" />
          <Picker.Item label="Área 2" value="Área 2" />
        </Picker>

        <Pressable
          style={{
            ...styles.button,
            backgroundColor: "blue",
          }}
          onPress={subirTudo} // Passar a função sem chamá-la
        >
          <Text style={styles.buttonText}>Enviar</Text>
        </Pressable>

        {mostrarMensagem && (
          <View style={styles.messageContainer}>
            <Text style={styles.successMessage}>
              Imagem enviada com sucesso!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#E8E8E8",
  },
  image: {
    borderWidth: 2,
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "red",
    borderRadius: 5,
    marginTop: 10,
    width: "16%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    padding: 5,
  },
  messageContainer: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 10,
  },
  successMessage: {
    color: "white",
  },
});

export default CriadorDeSala;
