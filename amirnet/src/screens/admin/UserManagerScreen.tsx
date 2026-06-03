import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { UserRole } from '../../types';

export default function UserManagerScreen({ navigation }: any) {
  const { state, createUser, changePassword, dispatch } = useApp();
  const currentUserID = state.auth.currentUser?.id;
  const [showAdd, setShowAdd] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [newPwd, setNewPwd] = useState('');

  function handleAdd() {
    if (!username.trim() || !displayName.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות'); return;
    }
    if (password.length < 6) { Alert.alert('שגיאה', 'סיסמה חייבת להיות לפחות 6 תווים'); return; }
    const ok = createUser(username.trim(), password, role, displayName.trim());
    if (!ok) { Alert.alert('שגיאה', 'שם המשתמש כבר קיים'); return; }
    setShowAdd(false); setUsername(''); setDisplayName(''); setPassword(''); setRole('student');
    Alert.alert('הצלחה', 'משתמש נוצר בהצלחה');
  }

  function handleDelete(id: string, name: string) {
    if (id === currentUserID) { Alert.alert('שגיאה', 'לא ניתן למחוק את המשתמש הנוכחי'); return; }
    Alert.alert('מחיקת משתמש', `למחוק את "${name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_USER', payload: id }) },
    ]);
  }

  function handleRoleToggle(id: string, currentRole: UserRole) {
    if (id === currentUserID) { Alert.alert('שגיאה', 'לא ניתן לשנות את תפקיד המשתמש הנוכחי'); return; }
    const newRole: UserRole = currentRole === 'admin' ? 'student' : 'admin';
    dispatch({ type: 'UPDATE_USER_ROLE', payload: { id, role: newRole } });
  }

  function handleChangePwd() {
    if (!newPwd || newPwd.length < 6) { Alert.alert('שגיאה', 'סיסמה חייבת להיות לפחות 6 תווים'); return; }
    if (showChangePwd) changePassword(showChangePwd, newPwd);
    setShowChangePwd(null); setNewPwd('');
    Alert.alert('הצלחה', 'הסיסמה שונתה');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>ניהול משתמשים</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}><Text style={styles.addBtnTxt}>+ הוסף</Text></TouchableOpacity>
      </View>

      <FlatList
        data={state.auth.users}
        keyExtractor={u => u.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: user }) => {
          const isMe = user.id === currentUserID;
          return (
            <View style={[styles.userCard, isMe && styles.userCardMe]}>
              <View style={styles.userLeft}>
                {!isMe && (
                  <TouchableOpacity onPress={() => handleDelete(user.id, user.displayName)} style={styles.delBtn}>
                    <Text>🗑</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => { setShowChangePwd(user.id); setNewPwd(''); }} style={styles.pwdBtn}>
                  <Text style={styles.pwdBtnTxt}>🔑</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.userMain}>
                <View style={styles.userNameRow}>
                  {isMe && <Text style={styles.meTag}>אני</Text>}
                  <Text style={styles.userName}>{user.displayName}</Text>
                </View>
                <Text style={styles.userUsername}>@{user.username}</Text>
                <Text style={styles.userDate}>נוצר: {new Date(user.createdAt).toLocaleDateString('he-IL')}</Text>
              </View>
              <View style={styles.userRight}>
                <TouchableOpacity
                  style={[styles.roleBadge, user.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeStudent]}
                  onPress={() => handleRoleToggle(user.id, user.role)}
                  disabled={isMe}
                >
                  <Text style={[styles.roleText, user.role === 'admin' ? styles.roleTextAdmin : styles.roleTextStudent]}>
                    {user.role === 'admin' ? '👑 מנהל' : '🎓 תלמיד'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.roleTap}>{!isMe ? 'לחץ לשינוי' : ''}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Add user modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.cancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>משתמש חדש</Text>
            <TouchableOpacity onPress={handleAdd}><Text style={styles.save}>צור</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            {[
              { label: 'שם מלא', value: displayName, setter: setDisplayName, placeholder: 'שם מלא', autoCapitalize: 'words' as const },
              { label: 'שם משתמש', value: username, setter: setUsername, placeholder: 'username', autoCapitalize: 'none' as const },
              { label: 'סיסמה (מינימום 6)', value: password, setter: setPassword, placeholder: '••••••', autoCapitalize: 'none' as const, secure: true },
            ].map(f => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={f.value}
                  onChangeText={f.setter}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize={f.autoCapitalize}
                  secureTextEntry={f.secure}
                  textAlign="right"
                />
              </View>
            ))}
            <Text style={styles.label}>תפקיד</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['student', 'admin'] as UserRole[]).map(r => (
                <TouchableOpacity key={r} style={[styles.roleOpt, role === r && styles.roleOptActive]} onPress={() => setRole(r)}>
                  <Text style={[styles.roleOptTxt, role === r && { color: COLORS.primary, fontWeight: '700' }]}>
                    {r === 'admin' ? '👑 מנהל' : '🎓 תלמיד'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change password modal */}
      <Modal visible={!!showChangePwd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePwd(null)}><Text style={styles.cancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>שינוי סיסמה</Text>
            <TouchableOpacity onPress={handleChangePwd}><Text style={styles.save}>שמור</Text></TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={styles.label}>סיסמה חדשה</Text>
            <TextInput
              style={styles.input}
              value={newPwd}
              onChangeText={setNewPwd}
              secureTextEntry
              placeholder="הכנס סיסמה חדשה (מינימום 6)"
              placeholderTextColor={COLORS.textTertiary}
              textAlign="right"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  userCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  userCardMe: { borderWidth: 1.5, borderColor: COLORS.primary },
  userLeft: { gap: 6 },
  delBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 6 },
  pwdBtn: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 6 },
  pwdBtnTxt: { fontSize: 14 },
  userMain: { flex: 1, gap: 2, alignItems: 'flex-end' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  meTag: { backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  userUsername: { fontSize: 12, color: COLORS.textSecondary },
  userDate: { fontSize: 11, color: COLORS.textTertiary },
  userRight: { alignItems: 'center', gap: 3 },
  roleBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5 },
  roleBadgeAdmin: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  roleBadgeStudent: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  roleText: { fontSize: 12, fontWeight: '700' },
  roleTextAdmin: { color: '#D97706' },
  roleTextStudent: { color: COLORS.primary },
  roleTap: { fontSize: 9, color: COLORS.textTertiary },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cancel: { color: COLORS.danger, fontSize: 15 },
  save: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
  roleOpt: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  roleOptActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleOptTxt: { fontSize: 14, color: COLORS.text },
});
