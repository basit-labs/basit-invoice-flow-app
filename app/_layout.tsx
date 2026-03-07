import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DataProvider } from "@/lib/data-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="invoice/create"
        options={{
          title: "New Invoice",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="invoice/[id]"
        options={{
          title: "Invoice",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="client/create"
        options={{
          title: "New Client",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="client/[id]"
        options={{
          title: "Client",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="product/create"
        options={{
          title: "New Product",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="expense/create"
        options={{
          title: "New Expense",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Business Profile",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "Reports",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: "Products & Services",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="expenses"
        options={{
          title: "Expenses",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </DataProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
