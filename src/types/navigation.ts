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
    MainTabs: undefined;
    Player: undefined;
    SectionList: {
        title: string;
        section: string;
        query?: string;
    };
    playerDetail: { videoId: string };
};
