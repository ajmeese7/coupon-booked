// Packages
import React, { useState } from 'react';
import {
	Dimensions,
	Image,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import CheckBox from '@react-native-community/checkbox';

// Components
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AuthStackWrapper from '../components/AuthStackWrapper';

// Styles
import AuthStackStyles from '../styles/AuthStack';
const profilePicBorderRadius = Dimensions.get('window').width * 0.4 * 0.5;

export default function SignUp({ navigation }) {
	const [picture, setPicture] = useState();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [number, setNumber] = useState('');
	const [toggleCheckBox, setToggleCheckBox] = useState(false);

	const pickImage = async () => {
		// TODO: Resize locally as well
		let result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.cancelled) {
			// TODO: Upload then use S3 image link
			setPicture(result.uri);
		}
	};

	function nextSignUpPage() {
		// TODO: Alert the user here!
		if (!toggleCheckBox || !picture) return console.log("Can't go to next page yet!");

		navigation.navigate('FinishSignUp', {
			picture: picture,
		});
	}

	// TODO: Come back and implement after moving away from expo;
	// https://medium.com/abn-amro-developer/a-guide-to-implement-push-notifications-with-react-native-expo-and-aws-amplify-5b0b62456f39
	
	function socialAuth(provider) {
		console.log("Social auth provider:", provider);
		Auth.federatedSignIn({provider: provider});
	}

	return (
		<AuthStackWrapper>
			<View style={AuthStackStyles.mainContent}>
				<TouchableOpacity onPress={() => pickImage()}>
					<View style={[
						AuthStackStyles.profilePictureContainer,
						picture ? AuthStackStyles.profilePictureShadow : null
					]}>
						<Image
							source={picture ? { uri: picture, } : require('../images/SelectProfilePicture.png')}
							style={[AuthStackStyles.profilePicture, picture ? { borderRadius: profilePicBorderRadius } : null]}
						/>
					</View>
				</TouchableOpacity>

				<AppTextInput
					value={name}
					onChangeText={text => setName(text)}
					placeholder='name'
					autoCapitalize='none'
					keyboardType='default'
					textContentType='name'
				/>
				<AppTextInput
					value={email}
					onChangeText={text => setEmail(text)}
					placeholder='email address'
					autoCapitalize='none'
					keyboardType='email-address'
					textContentType='emailAddress'
				/>
				<AppTextInput
					value={number}
					onChangeText={text => setNumber(text)}
					placeholder='mobile number'
					autoCapitalize='none'
					keyboardType='phone-pad'
					textContentType='telephoneNumber'
				/>

				<View style={styles.row}>
					<CheckBox
						disabled={false}
						value={toggleCheckBox}
						// TODO: Fix this; might need to switch to another lib like
						// https://github.com/crazycodeboy/react-native-check-box#readme
						tintColor={'#ffffff'}
						onFillColor={Constants.manifest.extra.blue}
						lineWidth={1}
						boxType={'square'}
						onValueChange={(newValue) => setToggleCheckBox(newValue)}
					/>
					<Text style={styles.termsText}>
						I accept all{' '}
						<Text style={styles.link}>terms and conditions</Text>
					</Text>
				</View>

				<AppButton title='Next' onPress={nextSignUpPage} />
			</View>

			<View style={AuthStackStyles.footer}>
				<Text style={styles.socialText}>sign up with social</Text>
				<View style={styles.row}>
					{Platform.OS === 'ios' && <AppleIcon socialAuth={socialAuth} />}
					<FacebookIcon socialAuth={socialAuth} />
					<GoogleIcon socialAuth={socialAuth} />
				</View>
			</View>
		</AuthStackWrapper>
	);
}

// Social icon components
const AppleIcon = ({ socialAuth }) =>
	// NOTE: Skipping implementation until I have an Apple Developer account
	<TouchableOpacity
		style={styles.socialButton}
		onPress={() => socialAuth('Apple')}
	>
		<Image
			style={styles.socialIcon}
			// TODO: Get a better image
			source={require('../images/AppleLogo.png')}
		/>
	</TouchableOpacity>;
const FacebookIcon = ({ socialAuth }) =>
	<TouchableOpacity
		style={styles.socialButton}
		onPress={() => socialAuth('Facebook')}
	>
		<Image
			style={styles.socialIcon}
			source={require('../images/FacebookLogo.png')}
		/>
	</TouchableOpacity>;
const GoogleIcon = ({ socialAuth }) =>
	<TouchableOpacity
		style={styles.socialButton}
		onPress={() => socialAuth('Google')}
	>
		<Image
			style={styles.socialIcon}
			// TODO: Get a better image
			source={require('../images/GoogleLogo.png')}
		/>
	</TouchableOpacity>;

// Styles for the SignUp page
const styles = StyleSheet.create({
	row: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 20,
	},
	termsText: {
		color: '#707070',
		textAlignVertical: 'center',
		letterSpacing: 0.4,
	},
	link: {
		color: Constants.manifest.extra.blue,
		textDecorationLine: 'underline',
		textDecorationColor: Constants.manifest.extra.blue,
	},
	socialText: {
		color: '#707070',
		fontSize: 18,
		letterSpacing: 0.8,
	},
	socialButton: {
		width: '15%',
		minWidth: 40,
		paddingHorizontal: 5,
	},
	socialIcon: {
		width: '100%',
		height: undefined,
		aspectRatio: 1,
	}
});