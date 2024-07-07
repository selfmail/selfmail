import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContent } from "~/components/ScreenContent";

export default function Home() {
	return (
		<>
			<Stack.Screen options={{ title: "Your Inbox" }} />
			<View style={styles.container}>
				<Link href={{ pathname: "/modal", params: { id: "skjffkj" } }}>
					<Text>hey</Text>
				</Link>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
});
