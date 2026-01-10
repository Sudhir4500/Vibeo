export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    Search: undefined;
    Library: undefined;
}
/**
 * global stack 
 */
export type RootStackParamList = {
    AuthStack: undefined;
    mainTabs: undefined;
    playerDetail: { videoId: string };
}