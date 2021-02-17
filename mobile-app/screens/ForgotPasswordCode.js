// Packages
import React, { useState } from 'react';
import {
	Image,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Auth } from 'aws-amplify';

// Components
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AuthStackWrapper from '../components/AuthStackWrapper';

// Styles
import AuthStackStyles from '../styles/AuthStack';

export default function ForgotPasswordCode({ navigation, route }) {
	const [code, setCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const username = route.params.username;

	async function resetPassword() {
		Auth.forgotPasswordSubmit(username, code, newPassword)
			.then(data => {
				console.log("Reset password data:", data);
				navigation.navigate('SignIn');
			})
			.catch(err => console.log(err));
	}

	return (
		<AuthStackWrapper>
			<View style={AuthStackStyles.mainContent}>
				<Image
					source={require('../images/logo_small.png')}
					style={AuthStackStyles.centeredLogo}
				/>

				<Text style={styles.confirmationText}>
					Your email confirmation is on the way!
				</Text>

				<AppTextInput
					value={code}
					onChangeText={text => setCode(text)}
					placeholder='code'
					autoCapitalize='none'
					keyboardType='numeric'
					textContentType='oneTimeCode'
				/>
				<AppTextInput
					value={newPassword}
					onChangeText={text => setNewPassword(text)}
					placeholder='password'
					autoCapitalize='none'
					autoCorrect={false}
					secureTextEntry
					textContentType='password'
				/>

				<AppButton title='Submit' onPress={resetPassword} />
			</View>
		</AuthStackWrapper>
	);
}

const styles = StyleSheet.create({
	confirmationText: {
		color: 'white',
		textAlign: 'center',
		fontSize: 24,
		letterSpacing: 1.4,
		width: '90%',
		maxWidth: 350,
		marginBottom: 30,
	},
});