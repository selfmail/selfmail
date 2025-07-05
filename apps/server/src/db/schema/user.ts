import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	password: text("password").notNull(),
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

export const verificationToken = pgTable("verification_token", {
	id: uuid("id").primaryKey().defaultRandom(),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	verificationTokens: many(verificationToken),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const verificationTokenRelations = relations(
	verificationToken,
	({ one }) => ({
		user: one(users, {
			fields: [verificationToken.userId],
			references: [users.id],
		}),
	}),
);
