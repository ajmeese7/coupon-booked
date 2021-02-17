// Packages
import React, { useState } from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';
import Hr from 'react-native-hr-plus';

// Components
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AuthStackWrapper from '../components/AuthStackWrapper';

// Styles
const gray = '#707070';
import AuthStackStyles from '../styles/AuthStack';

export default function SignIn({ navigation, updateAuthState }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	async function signIn() {
		// TODO: Display alert to user
		if (!username || !password) return console.log("Not ready to auth yet!");

		try {
			await Auth.signIn(username, password);
			console.log('Success');
			updateAuthState('loggedIn');
		} catch (error) {
			console.log('Error signing in:', error);
		}
	}

	return (
		<AuthStackWrapper>
			<View style={AuthStackStyles.mainContent}>
				<Image
					source={require('../images/logo_small.png')}
					style={AuthStackStyles.centeredLogo}
				/>

				<AppTextInput
					value={username}
					onChangeText={text => setUsername(text)}
					placeholder='username'
					autoCapitalize='none'
					keyboardType='default'
					textContentType='username'
				/>
				<AppTextInput
					value={password}
					onChangeText={text => setPassword(text)}
					placeholder='password'
					autoCapitalize='none'
					autoCorrect={false}
					secureTextEntry
					textContentType='password'
				/>

				<AppButton title='Sign In' onPress={signIn} />
				<TouchableOpacity
					style={styles.forgotPasswordButton}
					onPress={() => navigation.navigate('ForgotPassword')}
				>
					<Text style={styles.smallGrayText}>
						forgot password?
					</Text>
				</TouchableOpacity>
			</View>

			<View style={AuthStackStyles.footer}>
				<Hr color={gray} width={1}>
					<Text style={styles.textWithDivider}>or</Text>
				</Hr>

				<TouchableOpacity
					style={styles.createAccountButton}
					onPress={() => navigation.navigate('SignUp')}
				>
					<Text style={styles.createAccountText}>
						create new account
					</Text>
				</TouchableOpacity>
			</View>
		</AuthStackWrapper>
	);
}

const styles = StyleSheet.create({
	forgotPasswordButton: {
		marginVertical: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	smallGrayText: {
		color: gray,
		letterSpacing: 1.2,
		fontSize: 18,
		fontWeight: '600',
	},
	textWithDivider: {
		color: gray,
		fontSize: 16,
		paddingHorizontal: '12.5%',
	},
	createAccountButton: {
		marginTop: 25,
		marginBottom: 30,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 12,
		backgroundColor: '#AEDDF4',
		width: '80%',
		maxWidth: 350,
	},
	createAccountText: {
		color: Constants.manifest.extra.blue,
		letterSpacing: 1.25,
		fontSize: 16,
	},
});