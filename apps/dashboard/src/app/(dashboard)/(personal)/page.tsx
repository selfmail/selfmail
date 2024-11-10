import ActiveEmailView from "@/components/active-email";
import EmailCards from "@/components/cards";
import { fetchEmails, fetchSingleEmail } from "./action";

// Reports, Actions, etc. for the user
export default function UserPage() {
  return (
    <div className="min-h-screen flex">
      <EmailCards fetchEmails={fetchEmails} />
      <ActiveEmailView fetchSingleEmail={fetchSingleEmail} />
    </div>
  )
}