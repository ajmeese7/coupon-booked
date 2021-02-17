// Packages
import React, { useState } from 'react';
import {
	Dimensions,
	Image,
	View,
} from 'react-native';
import { Auth } from 'aws-amplify';

// Components
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AuthStackWrapper from '../components/AuthStackWrapper';

// Styles
import AuthStackStyles from '../styles/AuthStack';
const profilePicBorderRadius = Dimensions.get('window').width * 0.4 * 0.5;

export default function FinishSignUp({ navigation, route, updateAuthState }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const picture = route.params.picture;
	
	async function signUp() {
		// TODO: Display alert to user
		if (!username || !password) return console.log("Not ready to auth yet!");

		try {
			await Auth.signUp({ username, password, attributes: { email } });
			console.log('✅ Sign-up Confirmed');
			await Auth.signIn(username, password);
			updateAuthState('loggedIn');
			navigation.navigate('Home');

			// IDEA: Welcome page/tour here?
			//navigation.navigate('ConfirmSignUp');
		} catch (error) {
			console.log('❌ Error signing up...', error);
		}
	}

	return (
		<AuthStackWrapper>
			<View style={AuthStackStyles.mainContent}>
				<View style={[
					AuthStackStyles.profilePictureContainer,
					AuthStackStyles.profilePictureShadow
				]}>
					<Image
						source={{ uri: picture, }}
						style={[AuthStackStyles.profilePicture, { borderRadius: profilePicBorderRadius }]}
					/>
				</View>

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

				<AppButton title='Sign Up' onPress={signUp} />
			</View>
		</AuthStackWrapper>
	);
}