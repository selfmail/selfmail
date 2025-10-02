import { db } from "database";

export const middlewareAuthentication = async (
	sessionToken: string | undefined,
) => {
	try {
        if (!sessionToken) {
	    	return {
                authenticated: false
            }
	    }

	    const session = await db.session.findFirst({
	    	where: {
	    		token: sessionToken,
	    	},
	    	include: {
	    		user: {
	    			include: {
	    				member: {
	    					include: {
	    						workspace: true,
	    					},
	    					take: 1,
	    				},
	    			},
	    		},
	    	},
	    });

	    if (!session || !session.user) {
	    	return {
                authenticated: false
            }
	    }

	    return {
            authenticated: true,
            user: session.user,
        }
    } catch (_) {
        return {
            authenticated: false
        }
    }
};

export const verifyWorkspaceMembership = async (
    userId: string,
    workspaceSlug: string
) => {
    const member = await db.member.findFirst({
        where: {
            userId,
            workspace: {
                slug: workspaceSlug
            }
        },
        include: {
            workspace: true
        }
    });

    if (!member) {
        return {
            isMember: false
        }
    }

    return {
        isMember: true,
        member,
        workspace: member.workspace
    }
}