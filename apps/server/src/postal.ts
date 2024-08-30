import Postal from "postal-js";

export const postal = new Postal({
    key: process.env.POSTAL_API_KEY || "",
    url: process.env.POSTAL_API_HOST || "",
})