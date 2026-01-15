import { pretty, render, toPlainText } from "@react-email/render";
import VerifyEmailTemplate from "./emails/verify-email";

export async function generateVerifyEmailTemplate({
  name,
  token,
}: {
  name: string;
  token: number;
}) {
  const html = await pretty(
    await render(<VerifyEmailTemplate name={name} token={token} />)
  );
  return {
    html,
    text: toPlainText(html),
  };
}
