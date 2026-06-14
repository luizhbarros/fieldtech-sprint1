import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Importações da nova organização do projeto (Sprint 2)
import { Sensor, Medicao, StatusMedicao } from './src/types';
import { calcularStatus } from './src/utils/status';

// Configuração da API
const IP_BACKEND = 'localhost'; // Troque para o IP local ao usar no Expo Go
const API_URL = `http://${IP_BACKEND}:8080/api/sensores`;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Mock de múltiplos sensores para simulação (Sprint 2)
const SENSORES_MOCK: Sensor[] = [
  { id: 1, nome: "Termômetro Caldeira", tipo: "Temperatura", unidade: "°C" },
  { id: 2, nome: "Nó LoRa V4 - Km 42", tipo: "Vegetação", unidade: "cm" },
  { id: 3, nome: "Umidade Solo - Setor Sul", tipo: "Umidade", unidade: "%" },
];

const TEMAS = {
  light: {
    background: '#F0F2F5', card: '#FFFFFF', textoPrincipal: '#1A1A1A',
    textoSecundario: '#757575', primaria: '#3949AB', divisor: '#EEEEEE',
    status: {
      normalBg: '#E8F5E9', normalText: '#2E7D32',
      alertaBg: '#FFFDE7', alertaText: '#F9A825',
      criticoBg: '#FFEBEE', criticoText: '#C62828',
    }
  },
  dark: {
    background: '#121212', card: '#1E1E1E', textoPrincipal: '#FFFFFF',
    textoSecundario: '#A0A0A0', primaria: '#5C6BC0', divisor: '#333333',
    status: {
      normalBg: '#1B5E20', normalText: '#A5D6A7',
      alertaBg: '#F57F17', alertaText: '#FFE082',
      criticoBg: '#B71C1C', criticoText: '#EF9A9A',
    }
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModoAPI, setIsModoAPI] = useState(false);

  // Estado para alternância de sensores (Sprint 2)
  const [indiceSensorAtual, setIndiceSensorAtual] = useState(0);

  // Estado inicial tipado com a nova modelagem
  const [medicao, setMedicao] = useState<Medicao>({
    id: 1,
    sensor: SENSORES_MOCK[0],
    valor: 22.5,
    data: new Date(),
    status: "normal"
  });

  const temaAtivo = isDarkMode ? TEMAS.dark : TEMAS.light;
  const sensorSelecionado = SENSORES_MOCK[indiceSensorAtual];

  // Alternar entre os sensores mockados
  const alternarSensor = () => {
    const proximoIndice = (indiceSensorAtual + 1) % SENSORES_MOCK.length;
    setIndiceSensorAtual(proximoIndice);
  };

  const gerarNovaMedicao = async () => {
    const valorAleatorio = Math.floor(Math.random() * 120) + 10;
    const novoStatus = calcularStatus(valorAleatorio); // Usando a lógica do arquivo separado
    const dataAtual = new Date();

    if (!isModoAPI) {
      // MODO LOCAL
      setMedicao(prev => ({
        id: prev.id + 1,
        sensor: sensorSelecionado,
        valor: valorAleatorio,
        data: dataAtual,
        status: novoStatus
      }));
    } else {
      // MODO INTEGRADO (Mantendo a compatibilidade com a sua API Spring)
      const novoSensorParaBackend = {
        nome: sensorSelecionado.nome,
        tipo: sensorSelecionado.tipo,
        local: "Laboratório / Rodovia",
        unidade: sensorSelecionado.unidade,
        limiteMinimo: 0.0,
        limiteMaximo: valorAleatorio, // Passando o valor como limiteMaximo para refletir na API por enquanto
        ativo: true
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoSensorParaBackend)
        });

        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        const data = await response.json();

        setMedicao({
          id: data.id,
          sensor: { ...sensorSelecionado, id: data.id },
          valor: data.limiteMaximo,
          data: dataAtual,
          status: novoStatus
        });
      } catch (error) {
        console.error("Erro na API:", error);
        Alert.alert("Erro", "Conexão falhou. Desativando Modo API.");
        setIsModoAPI(false);
      }
    }
  };

  const getConfigStatus = (status: StatusMedicao): { bg: string; text: string; icon: IconName } => {
    switch (status) {
      case 'normal': return { bg: temaAtivo.status.normalBg, text: temaAtivo.status.normalText, icon: 'check-circle' };
      case 'alerta': return { bg: temaAtivo.status.alertaBg, text: temaAtivo.status.alertaText, icon: 'alert' };
      case 'critico': return { bg: temaAtivo.status.criticoBg, text: temaAtivo.status.criticoText, icon: 'fire' };
      default: return { bg: temaAtivo.divisor, text: temaAtivo.textoPrincipal, icon: 'help-circle' };
    }
  };

  const statusConfig = getConfigStatus(medicao.status);

  // Formatação de data simples
  const formatarData = (data: Date) => {
    return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR')}`;
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: temaAtivo.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={temaAtivo.background} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: temaAtivo.card, borderBottomColor: temaAtivo.divisor }]}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="broadcast" size={28} color={temaAtivo.primaria} />
            <Text style={[styles.tituloSistema, { color: temaAtivo.textoPrincipal }]}>IoT Monitor</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setIsModoAPI(!isModoAPI)} style={[styles.apiToggle, { backgroundColor: isModoAPI ? '#4CAF50' : '#9E9E9E' }]}>
              <MaterialCommunityIcons name={isModoAPI ? "cloud-check" : "cloud-off-outline"} size={16} color="#FFF" />
              <Text style={styles.apiToggleText}>{isModoAPI ? "API" : "Local"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.themeToggle}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-night" : "weather-sunny"} size={24} color={temaAtivo.textoPrincipal} />
            </TouchableOpacity>
          </View>
        </View> {/* <--- CORRIGIDO AQUI: Fecha a View do Header */}

        <View style={styles.content}>
          {/* Controle de Alternância de Sensores */}
          <View style={styles.sensorSelector}>
            <Text style={[styles.selectorTitle, { color: temaAtivo.textoSecundario }]}>Monitorando no momento:</Text>
            <TouchableOpacity style={[styles.selectorButton, { backgroundColor: temaAtivo.card, borderColor: temaAtivo.primaria }]} onPress={alternarSensor}>
              <Ionicons name="swap-horizontal" size={20} color={temaAtivo.primaria} />
              <Text style={[styles.selectorButtonText, { color: temaAtivo.primaria }]}>{sensorSelecionado.nome}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: temaAtivo.card }]}>
            <View style={[styles.modoBadge, { backgroundColor: isModoAPI ? '#E8F5E9' : '#EEEEEE' }]}>
              <Text style={{ color: isModoAPI ? '#2E7D32' : '#757575', fontSize: 12, fontWeight: 'bold' }}>
                {isModoAPI ? "DADOS SPRING BOOT" : "SIMULAÇÃO LOCAL"}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <View style={styles.badgeTipo}>
                <Text style={styles.badgeTipoText}>{medicao.sensor.tipo.toUpperCase()}</Text>
              </View>
              <Text style={[styles.nomeSensor, { color: temaAtivo.textoPrincipal }]}>{medicao.sensor.nome}</Text>
              <Text style={[styles.dataText, { color: temaAtivo.textoSecundario }]}>
                Última leitura: {formatarData(medicao.data)}
              </Text>
            </View>

            <View style={[styles.divisor, { backgroundColor: temaAtivo.divisor }]} />

            <View style={styles.valorContainer}>
              <Text style={[styles.valorDestaque, { color: temaAtivo.primaria }]}>{medicao.valor.toFixed(1)}</Text>
              <Text style={[styles.unidade, { color: temaAtivo.primaria }]}>{medicao.sensor.unidade}</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
              <MaterialCommunityIcons name={statusConfig.icon} size={18} color={statusConfig.text} />
              <Text style={[styles.badgeTexto, { color: statusConfig.text }]}>
                {medicao.status.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.idText, { color: temaAtivo.textoSecundario }]}>Reg. ID: #{medicao.id} | Sensor ID: {medicao.sensor.id}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.botao, { backgroundColor: temaAtivo.primaria }]} onPress={gerarNovaMedicao} activeOpacity={0.8}>
            <MaterialCommunityIcons name={isModoAPI ? "database-sync" : "refresh"} size={22} color="#FFF" style={styles.iconBotao} />
            <Text style={styles.botaoTexto}>
              {isModoAPI ? "ENVIAR & LER API" : "SIMULAR LEITURA"}
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

  sensorSelector: { marginBottom: 20, alignItems: 'center' },
  selectorTitle: { fontSize: 14, marginBottom: 8 },
  selectorButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  selectorButtonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  card: { borderRadius: 24, padding: 30, paddingTop: 40, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8, position: 'relative' },
  modoBadge: { position: 'absolute', top: -12, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#FFF' },
  cardHeader: { alignItems: 'center', marginBottom: 15 },
  badgeTipo: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeTipoText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  nomeSensor: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 5 },
  dataText: { fontSize: 12, fontStyle: 'italic' },
  divisor: { width: '100%', height: 1, marginBottom: 25 },
  valorContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  valorDestaque: { fontSize: 80, fontWeight: 'bold', lineHeight: 80 },
  unidade: { fontSize: 24, fontWeight: '600', marginTop: 10, marginLeft: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, marginBottom: 15 },
  badgeTexto: { fontWeight: '700', fontSize: 14, marginLeft: 8, letterSpacing: 1 },
  idText: { fontSize: 12, fontStyle: 'italic' },
  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 30 },
  botao: { flexDirection: 'row', paddingVertical: 18, borderRadius: 16, width: '100%', alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  iconBotao: { marginRight: 10 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});