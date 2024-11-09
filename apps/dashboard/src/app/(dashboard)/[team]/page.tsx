import ActiveEmailView from "@/components/active-email";
import EmailCards from "@/components/cards";
import { fetchEmails, fetchSingleEmail } from "./action";

export default function TeamInbox() {
    return (
        <div className="flex min-h-screen">
            <EmailCards fetchEmails={fetchEmails} />
            <ActiveEmailView fetchSingleEmail={fetchSingleEmail} />
        </div>
    )
}