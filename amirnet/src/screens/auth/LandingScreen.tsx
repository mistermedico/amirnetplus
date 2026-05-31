import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

const FEATURES = [
  { icon: '📚', text: 'בנק שאלות מקיף לבחינת אמירנט', color: '#DBEAFE' },
  { icon: '🧠', text: 'מבחן אדפטיבי המתאים לרמתך', color: '#F3E8FF' },
  { icon: '📊', text: 'מעקב התקדמות ואנליטיקס מפורט', color: '#DCFCE7' },
  { icon: '👑', text: 'ניהול מלא: ייבוא, פרקים ובחינות', color: '#FEF3C7' },
];

export default function LandingScreen({ navigation }: any) {
  const { dispatch } = useApp();

  function handleGetStarted() {
    dispatch({ type: 'SEEN_LANDING' });
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.heroSection}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>🌐</Text>
        </View>
        <Text style={styles.title}>AmirNet Plus</Text>
        <Text style={styles.subtitle}>הכנה חכמה לבחינת אמירנט</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>גרסה 2.0</Text>
        </View>
      </View>

      <View style={styles.featuresSection}>
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.featureCard, { backgroundColor: f.color }]}>
            <Text style={styles.featureText}>{f.text}</Text>
            <Text style={styles.featureIcon}>{f.icon}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={handleGetStarted} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>התחל עכשיו ›</Text>
        </TouchableOpacity>

        <View style={styles.credentialHint}>
          <Text style={styles.hintCode}>admin / admin123</Text>
          <Text style={styles.hintText}>כניסה ראשונה: </Text>
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
  blobTop: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  blobBottom: {
    position: 'absolute', bottom: 100, left: -80,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  logoIcon: { fontSize: 54 },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  versionText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  featuresSection: {
    marginHorizontal: 20,
    gap: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureIcon: { fontSize: 22 },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    gap: 14,
  },
  startBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    gap: 4,
  },
  hintText: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  hintCode: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
