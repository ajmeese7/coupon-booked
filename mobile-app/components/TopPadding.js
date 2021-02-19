import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from "../constants";

export default function TopPadding({ color }) {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				height: insets.top,
				width: '100%',
				backgroundColor: color || Constants.colors.blue,
			}}
		></View>
	);
}