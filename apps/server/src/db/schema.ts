import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Authentication
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	passwordHash: text("password_hash").notNull(),
	emailVerified: boolean("email_verified").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workspaces
export const workspace = pgTable("workspace", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	description: text("description").notNull(),
	ownerIds: uuid("owner_ids").array().notNull(),
});

export const members = pgTable("members", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	name: text("name").notNull(),
	role: text("role").notNull(),
	description: text("description"),
});

// Addresses & Emails

export const address = pgTable("address", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const domain = pgTable("domain", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	domain: text("domain").notNull(),
	verfied: boolean("verified").default(false),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	verificationKey: text("verification_key").notNull(),
});

export const mail = pgTable("mail", {
	id: uuid("id").primaryKey().defaultRandom(),
	from: text("from").notNull(),
	to: text("to").notNull(),
	subject: text("subject").notNull(),
	body: text("body").notNull(),
	preview: text("preview"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	attachements: text("attachements").array().default([]),

	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
});

export const outgoingMail = pgTable("outgoing_mail", {
	id: uuid("id").primaryKey().defaultRandom(),
	mailId: uuid("mail_id")
		.notNull()
		.references(() => mail.id, { onDelete: "cascade" }),
	domainId: uuid("domain_id")
		.notNull()
		.references(() => domain.id, { onDelete: "cascade" }),
	sendedAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	workspace: many(workspace),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const membersRelations = relations(members, ({ one }) => ({
	user: one(users, {
		fields: [members.userId],
		references: [users.id],
	}),
	workspace: one(workspace, {
		fields: [members.workspaceId],
		references: [workspace.id],
	}),
}));

export const workspaceRelations = relations(workspace, ({ many }) => ({
	members: many(members),
	domains: many(domain),
}));

export const addressRelations = relations(address, ({ many }) => ({
	users: many(users),
	workspace: many(workspace),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// User without sensitive data
export type PublicUser = Omit<User, "passwordHash">;
