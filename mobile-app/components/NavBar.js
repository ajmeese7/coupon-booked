import React from 'react';
import {
	Image,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function NavBar() {
	const insets = useSafeAreaInsets();

	// TODO: See how the insets.top method works on iOS, compared to
	// the older <SafeAreaView> method
	return (
		<>
			<View
				style={{
					height: insets.top,
					width: '100%',
					backgroundColor: Constants.manifest.extra.blue,
				}}
			></View>
			<View style={styles.container}>
				<Image
					style={styles.logo}
					source={ require('../images/logo_small.png') }
				/>
				<Text style={styles.name}>Coupon Booked</Text>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 60,
		width: '100%',
		backgroundColor: Constants.manifest.extra.blue,
		flexDirection: 'row',
		alignItems: 'center',
	},
	logo: {
		aspectRatio: 1,
		height: '95%',
		width: undefined,
		marginRight: 10,
		marginLeft: 10,
	},
	name: {
		fontSize: 26,
		color: 'white',
	}
});
