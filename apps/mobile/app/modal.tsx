import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';

import { ScreenContent } from '~/components/ScreenContent';

export default function Modal() {
  const params = useLocalSearchParams()
  return (
    <>
      <Stack.Screen options={{
        title: ""
      }} />
      <Text>{params.id}</Text>
    </>
  );
}
