import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Constants from "../constants";

export default function AppButton({ title, onPress }) {
	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		marginVertical: 10,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 12,
		width: '50%',
		maxWidth: 250,
		backgroundColor: Constants.colors.blue,
	},
	buttonText: {
		color: 'white',
		letterSpacing: 2.5,
		fontSize: 18,
		fontWeight: '600',
		textTransform: 'uppercase',
	}
});