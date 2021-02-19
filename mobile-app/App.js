import React, { useState, useEffect } from 'react';
import {
	Text,
	View,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

export default function App() {
	const [isUserLoggedIn, setUserLoggedIn] = useState('initializing');
	useEffect(() => {
		SplashScreen.hide();
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
	);
}

const Initializing = () =>
	<View>
		<Text>Does this even show?</Text>
	</View>

const AuthenticationNavigator = props => {
	return (
		<AuthenticationStack.Navigator headerMode='none'>
			<AuthenticationStack.Screen name='SignIn'>
				{screenProps => (
					<SignIn {...screenProps} updateAuthState={props.updateAuthState} />
				)}
			</AuthenticationStack.Screen>
			<AuthenticationStack.Screen
				name='ForgotPassword'
				component={ForgotPassword}
			/>
			<AuthenticationStack.Screen
				name='ForgotPasswordCode'
				component={ForgotPasswordCode}
			/>
			<AuthenticationStack.Screen
				name='SignUp'
				component={SignUp}
			/>
			<AuthenticationStack.Screen name='FinishSignUp'>
				{screenProps => (
					<FinishSignUp {...screenProps} updateAuthState={props.updateAuthState} />
				)}
			</AuthenticationStack.Screen>
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
