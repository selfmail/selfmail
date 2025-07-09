import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { address } from "./addresses";
import { users } from "./user";

export const member = pgTable("member", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: text("name").notNull(),
	role: text("role").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),

	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
});

export const workspace = pgTable("workspace", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),

	ownerIds: uuid("owner_ids").array().notNull(),
});

export const memberAddresses = pgTable("member_addresses", {
	addressId: uuid("address_id")
		.notNull()
		.references(() => address.id, { onDelete: "cascade" }),
	memberId: uuid("member_id")
		.notNull()
		.references(() => member.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const domain = pgTable("domain", {
	id: uuid("id").primaryKey().defaultRandom(),
	domain: text("domain").notNull().unique(),
	verified: boolean("verified").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	verificationTokenId: uuid("verification_token_id").notNull(),
});

export const smtpCrendetials = pgTable("smtp_credentials", {
	id: uuid("id").primaryKey().defaultRandom(),
	user: text("user").notNull(),
	password: text("password").notNull(),

	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),

	addressId: uuid("address_id")
		.notNull()
		.references(() => address.id, { onDelete: "cascade" }),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations

export const smtpCrendetialsRelations = relations(
	smtpCrendetials,
	({ one }) => ({
		workspace: one(workspace, {
			fields: [smtpCrendetials.workspaceId],
			references: [workspace.id],
		}),
		address: one(address, {
			fields: [smtpCrendetials.addressId],
			references: [address.id],
		}),
	}),
);

export const workspaceRelations = relations(workspace, ({ many }) => ({
	members: many(member),
	domains: many(domain),
}));

export const memberRelations = relations(member, ({ one, many }) => ({
	user: one(users, {
		fields: [member.userId],
		references: [users.id],
	}),
	workspace: one(workspace, {
		fields: [member.workspaceId],
		references: [workspace.id],
	}),
	addresses: many(memberAddresses),
}));

export const memberAddressesRelations = relations(
	memberAddresses,
	({ one }) => ({
		member: one(member, {
			fields: [memberAddresses.memberId],
			references: [member.id],
		}),
		address: one(address, {
			fields: [memberAddresses.addressId],
			references: [address.id],
		}),
	}),
);

export const domainRelations = relations(domain, ({ one }) => ({
	workspace: one(workspace, {
		fields: [domain.workspaceId],
		references: [workspace.id],
	}),
}));
