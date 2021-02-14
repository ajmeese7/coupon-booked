import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

export default function AppTextInput({ ...props }) {
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholderTextColor='#6e6869'
				{...props}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#f9f9f9',
		borderRadius: 14,
		flexDirection: 'row',
		paddingHorizontal: 15,
		paddingVertical: 10,
		marginVertical: 10,
		// https://ethercreative.github.io/react-native-shadow-generator/
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.22,
		shadowRadius: 2.22,
		elevation: 3,
	},
	input: {
		width: '80%',
		maxWidth: 350,
		fontSize: 18,
		color: '#101010',
	}
});