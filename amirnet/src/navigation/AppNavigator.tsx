import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import { COLORS } from '../utils/colors';

// Auth screens
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import TopicsScreen from '../screens/topics/TopicsScreen';
import TopicDetailScreen from '../screens/topics/TopicDetailScreen';
import QuizSetupScreen from '../screens/quiz/QuizSetupScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import QuizResultsScreen from '../screens/quiz/QuizResultsScreen';
import AdaptiveQuizScreen, { AdaptiveSetupScreen } from '../screens/quiz/AdaptiveQuizScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import QuestionManagerScreen from '../screens/admin/QuestionManagerScreen';
import ImportQuestionsScreen from '../screens/admin/ImportQuestionsScreen';
import ExportQuestionsScreen from '../screens/admin/ExportQuestionsScreen';
import ChapterManagerScreen from '../screens/admin/ChapterManagerScreen';
import ExamManagerScreen from '../screens/admin/ExamManagerScreen';
import UserManagerScreen from '../screens/admin/UserManagerScreen';
import AnnouncementsScreen from '../screens/admin/AnnouncementsScreen';
import SystemStatsScreen from '../screens/admin/SystemStatsScreen';
import BackupRestoreScreen from '../screens/admin/BackupRestoreScreen';
import TagManagerScreen from '../screens/admin/TagManagerScreen';
import QuickExamBuilderScreen from '../screens/admin/QuickExamBuilderScreen';
import SystemSettingsScreen from '../screens/admin/SystemSettingsScreen';
import StudyPlanManagerScreen from '../screens/admin/StudyPlanManagerScreen';
import QuestionPerformanceScreen from '../screens/admin/QuestionPerformanceScreen';
import ActivityCalendarScreen from '../screens/admin/ActivityCalendarScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠', Topics: '📚', QuizTab: '📝', Progress: '📊',
  Admin: '👑', Settings: '⚙️',
};

function MainTabs() {
  const { state } = useApp();
  const isAdmin = state.auth.currentUser?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingBottom: 4 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, color }) => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
            <Text style={{ fontSize: 9, color, fontWeight: focused ? '700' : '400', marginTop: 2 }}>
              {{ Home: 'בית', Topics: 'נושאים', QuizTab: 'בחינה', Progress: 'התקדמות', Admin: 'ניהול', Settings: 'הגדרות' }[route.name]}
            </Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Topics" component={TopicsStack} />
      <Tab.Screen name="QuizTab" component={QuizStack} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminStack} />}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
      <Stack.Screen name="AdaptiveSetup" component={AdaptiveSetupScreen} />
      <Stack.Screen name="AdaptiveQuiz" component={AdaptiveQuizScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
    </Stack.Navigator>
  );
}

function TopicsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TopicsList" component={TopicsScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
    </Stack.Navigator>
  );
}

function QuizStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuizSetupMain" component={QuizSetupScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
      <Stack.Screen name="AdaptiveSetup" component={AdaptiveSetupScreen} />
      <Stack.Screen name="AdaptiveQuiz" component={AdaptiveQuizScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={AdminScreen} />
      <Stack.Screen name="QuestionManager" component={QuestionManagerScreen} />
      <Stack.Screen name="ImportQuestions" component={ImportQuestionsScreen} />
      <Stack.Screen name="ExportQuestions" component={ExportQuestionsScreen} />
      <Stack.Screen name="ChapterManager" component={ChapterManagerScreen} />
      <Stack.Screen name="ExamManager" component={ExamManagerScreen} />
      <Stack.Screen name="UserManager" component={UserManagerScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="SystemStats" component={SystemStatsScreen} />
      <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      <Stack.Screen name="TagManager" component={TagManagerScreen} />
      <Stack.Screen name="QuickExamBuilder" component={QuickExamBuilderScreen} />
      <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
      <Stack.Screen name="StudyPlanManager" component={StudyPlanManagerScreen} />
      <Stack.Screen name="QuestionPerformance" component={QuestionPerformanceScreen} />
      <Stack.Screen name="ActivityCalendar" component={ActivityCalendarScreen} />
      <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
    </Stack.Navigator>
  );
}

// Simple bookmarks screen inline
function BookmarksScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const { FlatList, SafeAreaView } = require('react-native');
  const { DifficultyBadge } = require('../components/common');
  const bookmarked = [...require('../data/questions').BUILT_IN_QUESTIONS, ...state.customQuestions]
    .filter(q => state.progress.bookmarkedQuestionIDs.includes(q.id));

  if (bookmarked.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48 }}>🔖</Text>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: 10 }}>אין שאלות שמורות</Text>
        <Text style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>לחץ על 📎 בזמן בחינה כדי לשמור</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'right' }}>
          🔖 שאלות שמורות ({bookmarked.length})
        </Text>
      </View>
      <FlatList
        data={bookmarked}
        keyExtractor={(q: any) => q.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: q }: any) => (
          <View style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <DifficultyBadge difficulty={q.difficulty} />
              <Text style={{ fontSize: 14, color: COLORS.text, textAlign: 'right', flex: 1, marginLeft: 8 }}>
                {q.questionText}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.success, textAlign: 'right' }}>
              ✅ {q.options[q.correctIndex]}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  const { state } = useApp();

  if (!state.isLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingIcon}>🌐</Text>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>AmirNet Plus</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.auth.isAuthenticated ? (
          <>
            {!state.auth.hasSeenLanding && (
              <Stack.Screen name="Landing" component={LandingScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  loadingIcon: { fontSize: 64 },
  loadingText: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 12 },
});
