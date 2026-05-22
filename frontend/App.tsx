import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// --- CONFIGURAÇÃO DA API ---
// ATENÇÃO: Se for rodar no celular físico (Expo Go), troque 'localhost' pelo IP do seu Mac (ex: 192.168.1.15)
const IP_BACKEND = 'localhost';
const API_URL = `http://${IP_BACKEND}:8080/api/sensores`;

// Tipagem
type Medicao = {
  id: number;
  sensor: string;
  valor: number;
  status: "normal" | "alerta" | "critico";
};

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TEMAS = {
  light: {
    background: '#F0F2F5',
    card: '#FFFFFF',
    textoPrincipal: '#1A1A1A',
    textoSecundario: '#757575',
    primaria: '#3949AB',
    divisor: '#EEEEEE',
    status: {
      normalBg: '#E8F5E9', normalText: '#2E7D32',
      alertaBg: '#FFFDE7', alertaText: '#F9A825',
      criticoBg: '#FFEBEE', criticoText: '#C62828',
    }
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    textoPrincipal: '#FFFFFF',
    textoSecundario: '#A0A0A0',
    primaria: '#5C6BC0',
    divisor: '#333333',
    status: {
      normalBg: '#1B5E20', normalText: '#A5D6A7',
      alertaBg: '#F57F17', alertaText: '#FFE082',
      criticoBg: '#B71C1C', criticoText: '#EF9A9A',
    }
  }
};

export default function App() {
  const [medicao, setMedicao] = useState<Medicao>({
    id: 1,
    sensor: "Termômetro Caldeira 01",
    valor: 22.5,
    status: "normal"
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // NOVO ESTADO: Controle de Modo Local vs Modo Integrado (API)
  const [isModoAPI, setIsModoAPI] = useState(false);

  const temaAtivo = isDarkMode ? TEMAS.dark : TEMAS.light;

  const gerarNovaMedicao = async () => {
    const valorAleatorio = Math.floor(Math.random() * 101) + 10;
    let novoStatus: "normal" | "alerta" | "critico" = "normal";

    if (valorAleatorio >= 90) novoStatus = "critico";
    else if (valorAleatorio >= 70) novoStatus = "alerta";

    if (!isModoAPI) {
      // === MODO LOCAL (Simulação isolada) ===
      setMedicao(prev => ({
        id: prev.id + 1,
        sensor: "Sensor Local - Aleatório",
        valor: valorAleatorio,
        status: novoStatus
      }));
    } else {
      // === MODO INTEGRADO (Conexão real com Spring Boot) ===
      const novoSensorParaBackend = {
        nome: `Nó LoRa V4 - Km ${Math.floor(Math.random() * 100)}`,
        tipo: "vegetação",
        local: "Rodovia Bandeirantes",
        unidade: "cm",
        limiteMinimo: 0.0,
        limiteMaximo: valorAleatorio, // Usando o valor aleatório como limite para refletir na tela
        ativo: true
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoSensorParaBackend)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Atualiza a tela com a resposta oficial do banco H2 (com o ID gerado lá)
        setMedicao({
          id: data.id,
          sensor: data.nome,
          valor: data.limiteMaximo,
          status: novoStatus
        });

      } catch (error) {
        console.error("Erro na API:", error);
        Alert.alert(
            "Erro de Conexão",
            "Não foi possível conectar ao Spring Boot. Se você estiver usando o celular, certifique-se de trocar 'localhost' pelo IP do seu Mac no código."
        );
        // Desativa o modo API para não travar o app
        setIsModoAPI(false);
      }
    }
  };

  const getConfigStatus = (status: string): { bg: string; text: string; icon: IconName } => {
    switch (status) {
      case 'normal':
        return { bg: temaAtivo.status.normalBg, text: temaAtivo.status.normalText, icon: 'check-circle' };
      case 'alerta':
        return { bg: temaAtivo.status.alertaBg, text: temaAtivo.status.alertaText, icon: 'alert' };
      case 'critico':
        return { bg: temaAtivo.status.criticoBg, text: temaAtivo.status.criticoText, icon: 'fire' };
      default:
        return { bg: temaAtivo.divisor, text: temaAtivo.textoPrincipal, icon: 'help-circle' };
    }
  };

  const statusConfig = getConfigStatus(medicao.status);

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: temaAtivo.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={temaAtivo.background} />

        {/* Cabeçalho */}
        <View style={[styles.header, { backgroundColor: temaAtivo.card, borderBottomColor: temaAtivo.divisor }]}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="remote-desktop" size={28} color={temaAtivo.primaria} />
            <Text style={[styles.tituloSistema, { color: temaAtivo.textoPrincipal }]}>IoT Monitor</Text>
          </View>

          <View style={styles.headerRight}>
            {/* NOVO: Toggle de Modo API vs Local */}
            <TouchableOpacity
                onPress={() => setIsModoAPI(!isModoAPI)}
                style={[styles.apiToggle, { backgroundColor: isModoAPI ? '#4CAF50' : '#9E9E9E' }]}
            >
              <MaterialCommunityIcons name={isModoAPI ? "cloud-check" : "cloud-off-outline"} size={16} color="#FFF" />
              <Text style={styles.apiToggleText}>{isModoAPI ? "API" : "Local"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.themeToggle}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-night" : "weather-sunny"} size={24} color={temaAtivo.textoPrincipal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conteúdo Centralizado */}
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: temaAtivo.card }]}>

            {/* Badge indicando o modo atual em cima do card */}
            <View style={[styles.modoBadge, { backgroundColor: isModoAPI ? '#E8F5E9' : '#EEEEEE' }]}>
              <Text style={{ color: isModoAPI ? '#2E7D32' : '#757575', fontSize: 12, fontWeight: 'bold' }}>
                {isModoAPI ? "DADOS REAIS (SPRING BOOT)" : "DADOS FALSOS (MOCK)"}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <View style={styles.sensorInfo}>
                <FontAwesome5 name="satellite-dish" size={16} color={temaAtivo.textoSecundario} />
                <Text style={[styles.labelSensor, { color: temaAtivo.textoSecundario }]}>SENSOR H2</Text>
              </View>
              <Text style={[styles.nomeSensor, { color: temaAtivo.textoPrincipal }]}>{medicao.sensor}</Text>
            </View>

            <View style={[styles.divisor, { backgroundColor: temaAtivo.divisor }]} />

            <View style={styles.valorContainer}>
              <Text style={[styles.valorDestaque, { color: temaAtivo.primaria }]}>{medicao.valor.toFixed(1)}</Text>
              <Text style={[styles.unidade, { color: temaAtivo.primaria }]}>cm</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
              <MaterialCommunityIcons name={statusConfig.icon} size={18} color={statusConfig.text} />
              <Text style={[styles.badgeTexto, { color: statusConfig.text }]}>
                {medicao.status.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.idText, { color: temaAtivo.textoSecundario }]}>Registro ID: #{medicao.id}</Text>
          </View>
        </View>

        {/* Botão Inferior */}
        <View style={styles.footer}>
          <TouchableOpacity
              style={[styles.botao, { backgroundColor: temaAtivo.primaria }]}
              onPress={gerarNovaMedicao}
              activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={isModoAPI ? "database-sync" : "refresh"} size={22} color="#FFF" style={styles.iconBotao} />
            <Text style={styles.botaoTexto}>
              {isModoAPI ? "CADASTRAR E LER API" : "SIMULAR NOVA LEITURA"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  tituloSistema: { fontSize: 20, fontWeight: '700', marginLeft: 10, letterSpacing: 0.5 },
  apiToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 15 },
  apiToggleText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  themeToggle: { padding: 8, borderRadius: 20 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 30, paddingTop: 40, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8, position: 'relative' },
  modoBadge: { position: 'absolute', top: -12, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#FFF' },
  cardHeader: { alignItems: 'center', marginBottom: 15 },
  sensorInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  labelSensor: { fontSize: 12, fontWeight: '600', marginLeft: 6, letterSpacing: 1 },
  nomeSensor: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  divisor: { width: '100%', height: 1, marginBottom: 25 },
  valorContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  valorDestaque: { fontSize: 80, fontWeight: 'bold', lineHeight: 80 },
  unidade: { fontSize: 24, fontWeight: '600', marginTop: 10, marginLeft: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, marginBottom: 15 },
  badgeTexto: { fontWeight: '700', fontSize: 14, marginLeft: 8, letterSpacing: 1 },
  idText: { fontSize: 12, fontStyle: 'italic' },
  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 30 },
  botao: { flexDirection: 'row', paddingVertical: 18, borderRadius: 16, width: '100%', alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  iconBotao: { marginRight: 10 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});