import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Auth } from 'aws-amplify';
import NavBar from '../components/NavBar';

export default function Home({ updateAuthState }) {
	async function signOut() {
		try {
			await Auth.signOut();
			updateAuthState('loggedOut');
		} catch (error) {
			console.log('Error signing out:', error);
		}
	}
	
	return (
		<View style={styles.container}>
			<NavBar />

			<Text style={{ marginVertical: 10, }}>Welcome to my app!</Text>
			<Button title='Sign Out' color='tomato' onPress={signOut} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center'
	},
});
