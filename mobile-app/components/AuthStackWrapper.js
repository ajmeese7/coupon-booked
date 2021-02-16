import React from 'react';
import {
	Dimensions,
	ScrollView,
	StyleSheet,
} from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopPadding from '../components/TopPadding';

// https://stackoverflow.com/a/31564812/6456163
export default function AuthStackWrapper({ children }) {
	const insets = useSafeAreaInsets();

	// TODO: Test on smaller screens
	return (
		<>
			<TopPadding />
			<ScrollView
				contentContainerStyle={{
					minHeight: Dimensions.get('window').height - insets.top,
					flex: 1,
					flexGrow: 1,
				}}
			>
				<LinearGradient
					colors={[Constants.manifest.extra.blue, '#ffffff']}
					locations={[0, 0.80]}
					style={styles.pageBody}
				>
					{children}
				</LinearGradient>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	pageBody: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
});