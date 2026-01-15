import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlayerScreen } from '../screens/player/PlayerScreen';
import { BottomPlayerContainer } from './BottomPlayerContainer';
import { SectionListScreen } from '@/screens/Home/SectionListScreen';
import { RootStackParamList } from '@/types/navigation';

// export type RootStackParamList = {
//   MainTabs: undefined;
//   Player: undefined;
//   SectionList: { title: string; section: string; query?: string };
// };


const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomPlayerContainer} />
        <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{
                presentation: 'transparentModal',
                animation: 'slide_from_bottom',
            }}
        />
         <Stack.Screen 
                name="SectionList" 
                component={SectionListScreen}
                options={{
                    headerShown: false,
                }}
            />

    </Stack.Navigator>
);