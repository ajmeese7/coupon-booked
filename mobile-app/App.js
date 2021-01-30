import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import {
	BackButton,
	Link,
	NativeRouter,
	Route,
	Switch,
} from 'react-router-native';

// TODO: Eventually come back and use the book turning GIF
import { Animated, StyleSheet, Text, View } from 'react-native';

// Instruct SplashScreen not to hide yet
SplashScreen.preventAutoHideAsync().catch(() => {});

// Screens
import Home from './screens/Home';
const About = () => <Text>About</Text>;

/*
<Button
title="Send me to PrivateMessageScreen!"
onPress={() => history.push("/privatemessages")}
/>
*/

export default function App() {
	return (
		<AnimatedAppLoader image={{ uri: Constants.manifest.splash.image }}>
			<NativeRouter>
				<View style={styles.container}>
					<Navigation />
					
					<Switch>
						<Route exact path="/" component={Home} />
						<Route path="/about" component={About} />
					</Switch>
				</View>
			</NativeRouter>
		</AnimatedAppLoader>
	);
}

const Navigation = () =>
	<View style={styles.nav}>
		<BackButton/>
		<Link to="/">
			<Text>Home</Text>
		</Link>
		<Link to="/about">
			<Text>About</Text>
		</Link>
	</View>

const styles = StyleSheet.create({
	container: {
		marginTop: 75,
		padding: 10
	},
	nav: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
});

function AnimatedAppLoader({ children, image }) {
	const [isSplashReady, setSplashReady] = React.useState(false);

	// TODO: See if I can replace this
	const startAsync = React.useMemo(
		() => () => Asset.fromModule(image).downloadAsync(),
		[image]
	);

	const onFinish = React.useMemo(() => setSplashReady(true), []);

	if (!isSplashReady) {
		return (
			<AppLoading
				// Instruct SplashScreen not to hide yet, we want to do this manually
				autoHideSplash={false}
				startAsync={startAsync}
				onError={console.error}
				onFinish={onFinish}
			/>
		);
	}

	return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
	const animation = React.useMemo(() => new Animated.Value(1), []);
	const [isAppReady, setAppReady] = React.useState(false);
	const [isSplashAnimationComplete, setAnimationComplete] = React.useState(
		false
	);

	React.useEffect(() => {
		if (isAppReady) {
			Animated.timing(animation, {
				toValue: 0,
				duration: 1250,
				useNativeDriver: true,
			}).start(() => setAnimationComplete(true));
		}
	}, [isAppReady]);

	const onImageLoaded = React.useMemo(() => async () => {
		try {
			await SplashScreen.hideAsync();
		} catch (e) {
			console.error("Error hiding splash screen:", e);
		} finally {
			setAppReady(true);
		}
	});

	return (
		<View style={{ flex: 1 }}>
			{isAppReady && children}
			{!isSplashAnimationComplete && (
				<Animated.View
					pointerEvents="none"
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: Constants.manifest.splash.backgroundColor,
							opacity: animation,
						},
					]}
				>
					<Animated.Image
						style={{
							width: "100%",
							height: "100%",
							resizeMode: Constants.manifest.splash.resizeMode || "contain",
							transform: [{
								scale: animation,
							}],
						}}
						source={image}
						// NOTE: onLoadEnd and onLoad are never called, but this one works ¯\_(ツ)_/¯
						onLoadStart={onImageLoaded}
						fadeDuration={0}
					/>
				</Animated.View>
			)}
		</View>
	);
}