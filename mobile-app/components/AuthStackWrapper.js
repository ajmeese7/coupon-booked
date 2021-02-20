import React from 'react';
import {
	Dimensions,
	ScrollView,
	StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from "../constants";
import TopPadding from "../components/TopPadding";

// https://stackoverflow.com/a/31564812/6456163
export default function AuthStackWrapper({ children }) {
	const insets = useSafeAreaInsets();

	return (
		<>
			<TopPadding />
			<ScrollView
				contentContainerStyle={{
					minHeight: Dimensions.get('window').height - insets.top,
					flexGrow: 1,
				}}
			>
				<LinearGradient
					colors={[Constants.colors.blue, '#ffffff']}
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