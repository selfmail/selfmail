import EmailCards from "@/components/cards";
import { fetchData } from "./action";

export default function TeamInbox() {
    return (
        <div>
            <EmailCards fetchEmails={fetchData} />
        </div>
    )
}