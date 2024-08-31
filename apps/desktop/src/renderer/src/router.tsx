import { Link, Route, Switch } from "wouter";
const InboxPage = () => (
    <div>
        hey
    </div>
)
export default function Router() {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType<any> }>;

    const routes = Object.keys(pages).map((path) => {
        const route = path
            .replace('./pages', '')  // Entfernt den Basisordner
            .replace(/\.tsx$/, '')   // Entfernt die Dateiendung
            .replace(/\/index$/, '/');  // Wandelt /index in /

        return { path: route, component: pages[path].default };
    });
    return (
        <>
            <Link href="/inbox">Profile</Link>

            <Route path="/about">About Us</Route>

            {/* 
              Routes below are matched exclusively -
              the first matched route gets rendered
            */}
            <Switch>
                {routes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} component={Component} />
                ))}

                {/* Default route in a switch */}
                <Route>404: No such page!</Route>
            </Switch>
        </>
    )
}