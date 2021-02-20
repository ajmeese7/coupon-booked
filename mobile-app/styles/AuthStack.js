import {
	Dimensions,
	StyleSheet,
} from 'react-native';

const profilePicBorderRadius = Dimensions.get('window').width * 0.4 * 0.5;
const AuthStackStyles = StyleSheet.create({
	mainContent: {
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
	footer: {
		alignItems: 'center',
		width: '100%',
		marginTop: 15,
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