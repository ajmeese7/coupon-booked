import {
	Dimensions,
	StyleSheet,
} from 'react-native';
import Constants from 'expo-constants';

const gray = '#707070';
const profilePicBorderRadius = Dimensions.get('window').width * 0.4 * 0.5;
const AuthStackStyles = StyleSheet.create({
	signInForm: {
		flex: 1,
		alignItems: 'center',
		width: '100%',
	},
	centeredLogo: {
		width: '40%',
		height: undefined,
		aspectRatio: 1,
		marginBottom: 35,
	},
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
	footer: {
		alignItems: 'center',
		width: '100%',
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
	profilePictureContainer: {
		width: '40%',
		height: undefined,
		aspectRatio: 1,
		marginVertical: 35,
	},
	profilePicture: {
		width: '100%',
		height: undefined,
		aspectRatio: 1,
	},
	profilePictureShadow: {
		// TODO: Test shadows on different screen sizes
		borderRadius: profilePicBorderRadius,
		shadowColor: '#000',
		shadowOffset: {
			width: 1,
			height: 6,
		},
		shadowOpacity: 0.35,
		shadowRadius: 2.5,
		elevation: 15,
	},
});

export default AuthStackStyles;