import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '📚', text: 'בנק שאלות מקיף לבחינת אמירנט' },
  { icon: '🧠', text: 'מבחן אדפטיבי המתאים לרמתך' },
  { icon: '📊', text: 'מעקב התקדמות ואנליטיקס מפורט' },
  { icon: '👑', text: 'ניהול מלא למנהלים: ייבוא, פרקים ובחינות' },
];

export default function LandingScreen({ navigation }: any) {
  const { dispatch } = useApp();

  function handleGetStarted() {
    dispatch({ type: 'SEEN_LANDING' });
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>🌐</Text>
        </View>
        <Text style={styles.title}>AmirNet Plus</Text>
        <Text style={styles.subtitle}>הכנה חכמה לבחינת אמירנט</Text>
        <Text style={styles.version}>גרסה 2.0</Text>
      </View>

      <View style={styles.featuresSection}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f.text}</Text>
            <Text style={styles.featureIcon}>{f.icon}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={handleGetStarted} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>התחל עכשיו</Text>
        </TouchableOpacity>

        <View style={styles.credentialHint}>
          <Text style={styles.hintText}>כניסה ראשונה:</Text>
          <Text style={styles.hintCode}>  admin / admin123</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 52,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  featuresSection: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    padding: 24,
    gap: 16,
  },
  startBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  credentialHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  hintCode: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
