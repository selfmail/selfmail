import { app } from "@/index";

export default async function GetMutlipleMails() {
	app.get("/v1/multiple-mails/:addressId/:from/:to", async (c) => {
		return c.text("hey");
	});
}
