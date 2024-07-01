export const config: {
    RESEND: string,
    SUPPORT_MAIL: `${string}@${string}.${string}`,
    LOG_ERRORS_INTO_DB: boolean,
    LOG_ERRORS_INTO_CONSOLE: boolean

} = {
    /**
     * You resend api key. You need a custom domain with permissions for this,
     * then you can go to https://resend.com and get your api key.
     */
    RESEND: "re_RVrHmFQn_9yYcL6dvnjxLCH5HRU8PHxqJ",
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
     * TODO: add docs information for the support mail
     * @see
     */
    SUPPORT_MAIL: "support@example.com",
    /**
     * If you want to log the errors into the db, set this to true.
     */
    LOG_ERRORS_INTO_DB: false,
    /**
     * If you want to log the errors into the console of your server, set this to true.
     */
    LOG_ERRORS_INTO_CONSOLE: false,
    /**
     * If you want to use ai to process emails faster, mark spam and more, you can set here your openai api key.
     * This means, we cannot control what happens with your data. If you have any questions about how openai is
     * processing your data, please contact them.
     */
}