import { app } from "..";

export default function App() {
    app.get("/app", (c) => c.text("hey"))
}