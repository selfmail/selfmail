import React from 'react';

const App: React.FC = () => {
    const sendPing = () => {
        window.electron.send('ping', 'Hello from renderer');
    };

    React.useEffect(() => {
        window.electron.receive('pong', (data: string) => {
            console.log(data);
        });
    }, []);

    return (
        <div>
            <h1>Vite + Electron + TypeScript</h1>
            <button onClick={sendPing}>Send Ping</button>
        </div>
    );
};

export default App;
