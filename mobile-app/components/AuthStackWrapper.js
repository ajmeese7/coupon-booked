import React from 'react';
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import TopPadding from '../components/TopPadding';

// https://stackoverflow.com/a/31564812/6456163
export default function AuthStackWrapper({ children }) {
	return (
		<>
			<TopPadding />
			<LinearGradient
				colors={[Constants.manifest.extra.blue, '#ffffff']}
				locations={[0, 0.80]}
				style={styles.pageBody}
			>
				{children}
			</LinearGradient>
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