export abstract class Notify {
    static async notifyUser({
        title,
        description,
        type,
        ...userOrMember
    }: {
        title: string,
        description?: string,
        type: "info" | "warning" | "error"
    } & (
            | { userId: string; memberId?: never }
            | { memberId: string; userId?: never }
        )) {

    }
}