import { config as dotenv } from "dotenv";
// run the config() function from dotenv
dotenv();

/**
 * This is the config for the selfmail backend.
 * Please read the introductions above the keys.
 */
export const config: {
  RESEND: string;
  SUPPORT_MAIL: `${string}@${string}.${string}`;
  LOG_ERRORS_INTO_DB: boolean;
  LOG_ERRORS_INTO_CONSOLE: boolean;
  HUGGING_FACE_API_KEY: string | undefined;
  MAX_USER_SPACE: number | undefined;
} = {
  /**
   * You resend api key. You need a custom domain with permissions for this,
   * then you can go to https://resend.com and get your api key.
   *
   * Required!
   */
  RESEND: process.env.RESEND || "",
  /**
   * The support email address, which the user can contact, if the recipient was not found, or something unexpected happened.
   * This mail must be defined.
   *
   * You can use the same email address, which you defined in the .env file,
   * or you can use a different one.
   *
   * Example Adresse: support@yourwebsite.com
   *
   * You are not allowed to use this email adresse in your database, for an user. The request will automatic be blocked, when
   * someone trys to register this email address.
   *
   * As an admin, you can also send custom emails from this email.
   *
   * Required!
   *
   * TODO: add docs information for the support mail
   * @see
   */
  //                                                                               ↓ you can insert here your key, when you don't want to use env variables
  SUPPORT_MAIL:
    (process.env.SUPPORT_MAIL as `${string}@${string}.${string}` | undefined) || (" " as `${string}@${string}.${string}`),
  /**
   * If you want to log the errors into the db, set this to true.
   * You can later access the logs in your dashboard as the admin.
   */
  LOG_ERRORS_INTO_DB: false,
  /**
   * If you want to log the errors into the console of your server, set this to true.
   * You need access to the logs of your server.
   */
  LOG_ERRORS_INTO_CONSOLE: true,
  /**
   * If you want to use ai to process emails faster, mark spam and more, you can set here your hugging face api key.
   * This means, we cannot control what happens with your data. If you have any questions about how hugging face is
   * processing your data, please contact them. You can also set this field to `undefined`, if you don't want to use ai.
   *
   * TODO: add web documentation
   * @see
   */
  HUGGING_FACE_API_KEY: undefined,
  /**
   * You can have multiple users in your dashboard.
   * You can give them access for more features and so on.
   * And the normal user becomes the role "User", this means he has no special rights.
   * You can define now, how much space they can use. If you don't want to set a limit, you can set
   * this field to undefined.
   */
  MAX_USER_SPACE: (process.env.MAX_USER_SPACE as number | undefined) || undefined,
};
