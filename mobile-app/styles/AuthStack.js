import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const gray = '#707070';
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
	forgotPasswordButtonText: {
		color: gray,
		letterSpacing: 1.25,
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
});

export default AuthStackStyles;