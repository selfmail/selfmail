import EmailTable from "@/components/email-table";
import { fetchData } from "./action";

export default function TeamInbox() {
    return (
        <div>
            <EmailTable fetchData={fetchData} />
        </div>
    )
}