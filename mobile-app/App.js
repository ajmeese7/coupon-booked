import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
	ActivityIndicator,
	Animated,
	StyleSheet,
	View
} from 'react-native';

// Normal screens
import Home from './screens/Home';

// Auth stack screens
import SignIn from './screens/SignIn';
import ForgotPassword from './screens/ForgotPassword';
import ForgotPasswordCode from './screens/ForgotPasswordCode';
import SignUp from './screens/SignUp';
import FinishSignUp from './screens/FinishSignUp';
import ConfirmSignUp from './screens/ConfirmSignUp';

// Navigation items
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const AuthenticationStack = createStackNavigator();
const AppStack = createStackNavigator();

// AWS stuff
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);
Auth.configure(awsconfig);

// Instruct SplashScreen not to hide yet
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
	const [isUserLoggedIn, setUserLoggedIn] = useState('initializing');
	useEffect(() => {
		checkAuthState();
	}, []);
	
	async function checkAuthState() {
		try {
			await Auth.currentAuthenticatedUser();
			console.log('✅ User is signed in');
			setUserLoggedIn('loggedIn');
		} catch (err) {
			console.log('❌ User is not signed in');
			setUserLoggedIn('loggedOut');
		}
	}

	function updateAuthState(isUserLoggedIn) {
		setUserLoggedIn(isUserLoggedIn);
	}

	return (
		<AnimatedAppLoader image={{ uri: Constants.manifest.splash.image }}>
			<SafeAreaProvider>
				<NavigationContainer>
					{isUserLoggedIn === 'initializing' && <Initializing />}
					{isUserLoggedIn === 'loggedIn' && (
						<AppNavigator updateAuthState={updateAuthState} />
					)}
					{isUserLoggedIn === 'loggedOut' && (
						<AuthenticationNavigator updateAuthState={updateAuthState} />
					)}
				</NavigationContainer>
			</SafeAreaProvider>
		</AnimatedAppLoader>
	);
}

const AuthenticationNavigator = props => {
	return (
		<AuthenticationStack.Navigator headerMode='none'>
			<AuthenticationStack.Screen name='SignIn'>
				{screenProps => (
					<SignIn {...screenProps} updateAuthState={props.updateAuthState} />
				)}
			</AuthenticationStack.Screen>
			<AuthenticationStack.Screen name='ForgotPassword' component={ForgotPassword} />
			<AuthenticationStack.Screen name='ForgotPasswordCode' component={ForgotPasswordCode} />
			<AuthenticationStack.Screen name='SignUp' component={SignUp} />
			<AuthenticationStack.Screen name='FinishSignUp' component={FinishSignUp} />
			<AuthenticationStack.Screen
				name='ConfirmSignUp'
				component={ConfirmSignUp}
			/>
		</AuthenticationStack.Navigator>
	);
};

const AppNavigator = props => {
	return (
		<AppStack.Navigator headerMode='none'>
			<AppStack.Screen name='Home'>
				{screenProps => (
					<Home {...screenProps} updateAuthState={props.updateAuthState} />
				)}
			</AppStack.Screen>
		</AppStack.Navigator>
	);
};

// TODO: See if/when this actually gets called, and customize
const Initializing = () => {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size='large' color='tomato' />
		</View>
	);
};

function AnimatedAppLoader({ children, image }) {
	const [isSplashReady, setSplashReady] = React.useState(false);
	const onFinish = React.useMemo(() => setSplashReady(true), []);
	const startAsync = React.useMemo(
		// TODO: See if I can replace this
		() => () => Asset.fromModule(image).downloadAsync(),
		[image]
	);

	if (!isSplashReady) {
		return (
			<AppLoading
				// Instruct SplashScreen not to hide yet, we want to do this manually
				autoHideSplash={false}
				startAsync={startAsync}
				onError={console.error}
				onFinish={onFinish}
			/>
		);
	}

	return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
	const animation = React.useMemo(() => new Animated.Value(1), []);
	const [isAppReady, setAppReady] = React.useState(false);
	const [isSplashAnimationComplete, setAnimationComplete] = React.useState(false);

	React.useEffect(() => {
		if (isAppReady) {
			Animated.timing(animation, {
				toValue: 0,
				duration: 1250,
				useNativeDriver: true,
			}).start(() => setAnimationComplete(true));
		}
	}, [isAppReady]);

	const onImageLoaded = React.useMemo(() => async () => {
		try {
			await SplashScreen.hideAsync();
		} catch (e) {
			console.error('Error hiding splash screen:', e);
		} finally {
			setAppReady(true);
		}
	});

	return (
		<View style={{ flex: 1 }}>
			{isAppReady && children}
			{!isSplashAnimationComplete && (
				<Animated.View
					pointerEvents='none'
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: Constants.manifest.splash.backgroundColor,
							opacity: animation,
						},
					]}
				>
					<Animated.Image
						style={{
							width: '100%',
							height: '100%',
							resizeMode: Constants.manifest.splash.resizeMode || 'contain',
							transform: [{
								scale: animation,
							}],
						}}
						source={image}
						// NOTE: onLoadEnd and onLoad are never called, but this one works ¯\_(ツ)_/¯
						onLoadStart={onImageLoaded}
						fadeDuration={0}
					/>
				</Animated.View>
			)}
		</View>
	);
}