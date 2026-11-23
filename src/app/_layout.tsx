import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { AppStoreProvider } from '@/store/app-store';
import { palettes } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = palettes[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, primary: c.accent, background: c.bg, card: c.surface, text: c.text, border: c.line } };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={theme}>
      <AppStoreProvider
        fallback={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
            <ActivityIndicator color={c.accent} />
          </View>
        }>
        <Stack screenOptions={{ headerTintColor: c.accent, headerTitleStyle: { color: c.text }, headerBackTitle: 'Voltar', contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Início' }} />
          <Stack.Screen name="novo" options={{ title: 'Novo evento', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/index" options={{ title: 'Evento' }} />
          <Stack.Screen name="evento/[id]/editar" options={{ title: 'Dados do evento', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/tarefa/[taskId]" options={{ title: 'Tarefa', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/convidado/[guestId]" options={{ title: 'Convidado', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/fornecedor/[vendorId]" options={{ title: 'Fornecedor', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/importar" options={{ title: 'Adicionar vários', presentation: 'modal' }} />
          <Stack.Screen name="evento/[id]/mensagem" options={{ title: 'Convite por WhatsApp' }} />
        </Stack>
      </AppStoreProvider>
    </ThemeProvider>
  );
}
