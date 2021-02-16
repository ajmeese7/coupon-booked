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

// Components
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AuthStackWrapper from '../components/AuthStackWrapper';

// Styles
import AuthStackStyles from '../styles/AuthStack';

export default function ForgotPassword({ navigation }) {
	const [username, setUsername] = useState('');

	async function forgotPassword() {
		navigation.navigate('ForgotPasswordCode', {
			username: username,
		});
		
		/*if (!username) return;
		Auth.forgotPassword(username)
			.then(data => {
				console.log("Forgot password data:", data);
				navigation.navigate('ForgotPasswordCode', {
					username: username,
				});
			})
			.catch(err => console.log(err));*/
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
					keyboardType='default'
					textContentType='username'
				/>

				<AppButton title='Get Code' onPress={forgotPassword} />
			</View>
		</AuthStackWrapper>
	);
}