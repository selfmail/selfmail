import { Route, Switch } from "wouter";
import Home from "./routes/home";

export default function Routes() {
  return (
    <Switch>
      <Route component={Home} path="/" />
      <Route path="/inbox">
        <div>Inbox - Coming Soon</div>
      </Route>
      <Route>
        <div>404 - Page Not Found</div>
      </Route>
    </Switch>
  );
}
