import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
