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
		// TODO: Validate input details before submitting to auth

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
			<View style={AuthStackStyles.signInForm}>
				<Image
					source={require('../images/logo_small.png')}
					style={AuthStackStyles.centeredLogo}
				/>

				<AppTextInput
					value={username}
					onChangeText={text => setUsername(text)}
					placeholder='username'
					autoCapitalize='none'
					keyboardType='email-address'
					textContentType='emailAddress'
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
					style={AuthStackStyles.forgotPasswordButton}
					onPress={() => navigation.navigate('ForgotPassword')}
				>
					<Text style={AuthStackStyles.forgotPasswordButtonText}>
						forgot password?
					</Text>
				</TouchableOpacity>
			</View>

			<View style={AuthStackStyles.footer}>
				<Hr color={gray} width={1}>
					<Text style={AuthStackStyles.textWithDivider}>or</Text>
				</Hr>

				<TouchableOpacity
					style={AuthStackStyles.createAccountButton}
					onPress={() => navigation.navigate('SignUp')}
				>
					<Text style={AuthStackStyles.createAccountText}>
						create new account
					</Text>
				</TouchableOpacity>
			</View>
		</AuthStackWrapper>
	);
}

const styles = StyleSheet.create({
	
});