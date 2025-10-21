**Elysia API**

This app contains the public api for selfmail, as well as the billing api for [polar](https://polar.sh). You can find the different routes in the `/src` folder. [Elysia](https://elysiajs.com) has a very good typesafe plugin system, which we utalize to split our api into different parts. The billing routes are avaiable at `/src/billing`.

Files:

`index.ts`: Creating the elysia routes, exporting the elysia plugin and managing our services class with the module namespaces.
`module.ts`: A namespace for the current api part, which contains the typebox schema for elysia and types.
`service.ts`: An abstract class which contains the actual logic of the route.