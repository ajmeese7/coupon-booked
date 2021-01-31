### IDEAS
- Implement [Formik example](https://github.com/expo/examples/tree/master/with-formik)
- Include [AWS Storage](https://github.com/expo/examples/tree/master/with-aws-storage-upload)
- [Swipe navigation](https://stackoverflow.com/questions/48719848/react-native-navigation-swipe-to-next-screen)
	- Can potentially do animations and such w/o a library, like detailed [here](https://reactrouter.com/native/guides/animation)
- Use the book turning GIF, rather than the static splash screen

### Plan
I'm going to attempt to write a mobile-only app first, then if I like how it
turns out I'll worry about adding a web side of things. In the meantime, I'll
just make a decent static site that links to the apps.

### Notes
- REST API endpoint: https://9uxs1q2p91.execute-api.us-east-2.amazonaws.com/dev
- If AWS auth ever stops working, try the fix [here](https://github.com/aws-amplify/amplify-js/issues/4315#issuecomment-629736223).
- For auth references, look [here](https://medium.com/javascript-in-plain-english/the-ultimate-guide-for-integrate-aws-amplify-authentication-for-react-native-15a8eec10890)