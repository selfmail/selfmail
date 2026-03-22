import { createServerFn } from "@tanstack/react-start";

export const handleCheckOtpForm = createServerFn({
  method: "POST",
})
  .inputValidator((data: { email: string }) => {
    if (!data.email) {
      throw new Error("Email is required");
    }
    return data;
  })
  .handler((ctx) => {
    console.log("Handling check OTP form with data:", ctx.data);

    console.log("Check OTP successful, redirecting...");

    return "Form submitted successfully";
  });
