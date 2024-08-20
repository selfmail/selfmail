<p align="center">
    <h2 align="center">👨‍💻 Selfhost</h2>
    <p align="center">
        <a href="https://github.com/selfmail/selfmail/">
            <b>🏡 Home</b> 
        </a>
        <a href="https://github.com/selfmail/selfmail/blob/main/LICENSE">
            <b>👨‍⚖️ License</b> 
        </a> 
        <a href="./">
            <b>📄 Guides</b> 
        </a>
        <a href="https://github.com/selfmail/selfmail/">
            <b>🙋 FAQ & Support & Feedback</b>
        </a>
    </p>
</p>

```
🛑 For every command, you need to have git installed.
```

## Init selfmail

We make it easy to run our platform on other servers. To start, install nodejs:

```bash

```

The next step is to install pnpm globally:

```bash
npm install -g pnpm
```

The required installations are now done. This means, we can start with the cli.

Run this command in your shell:

```bash
npx selfmail --init
```

This will pull the repository and install the required dependencies. The last step is to fill in our .env variables. Here is the list with the .env variables:

- app > dashboard > .env
- app > server > .env
- app > web > .env
- packages > database > .env

<sub>(These are the folders with the .env variables.)</sub>

## Update selfmail

Our cli makes it easy to update the project. This command will copy your .env variables into a seperate file, remove the folder and paste your .env variables back into the right files. You only have to run this command:

```bash
npx selfmail --update
```

## Remove selfmail

To remove selfmail from your server, simply type the following command:

```bash
npx selfmail --remove
```

This command will ask you, what you have want to delete (e.g. also the .env files...), and if your sure.

To remove pnpm type this command:

```bash
npm remove pnpm
```
