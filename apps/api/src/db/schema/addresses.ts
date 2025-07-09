import { relations } from "drizzle-orm";
import {
	boolean,
	json,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const mail = pgTable("mail", {
	id: uuid("id").primaryKey().defaultRandom(),

	subject: text("subject").notNull(),
	body: text("body").notNull(),
	html: text("html").notNull(),
	attachments: json("attachments").$type<Record<string, string>>().notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	// Remove the tags array reference - we'll use a junction table instead
	contactId: uuid("contact_id")
		.notNull()
		.references(() => contacts.id, { onDelete: "cascade" }),
});

// Add a junction table for the many-to-many relationship between mail and tags
export const mailToTags = pgTable("mail_to_tags", {
	mailId: uuid("mail_id")
		.notNull()
		.references(() => mail.id, { onDelete: "cascade" }),
	tagId: uuid("tag_id")
		.notNull()
		.references(() => tags.id, { onDelete: "cascade" }),
});

export const contacts = pgTable("contacts", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull(),
	name: text("name"),
	description: text("description"),
	informations: json("informations")
		.$type<Record<string, string | number | boolean>>()
		.notNull(),
	image: text("image"),
	blocked: boolean("blocked").default(false),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),

	addressId: uuid("address_id")
		.notNull()
		.references(() => address.id, { onDelete: "cascade" }),
});

export const tags = pgTable("tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	color: text("color").notNull(),
});

export const outgoingMail = pgTable("outgoing_mail", {
	id: uuid("id").primaryKey().defaultRandom(),

	subject: text("subject").notNull(),
	body: text("body").notNull(),
	html: text("html").notNull(),
	attachments: json("attachments").$type<Record<string, string>>(),

	sendedAt: timestamp("sended_at").defaultNow().notNull(),

	contactId: uuid("contact_id")
		.notNull()
		.references(() => contacts.id, { onDelete: "cascade" }),
});

export const address = pgTable("address", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull(),
	name: text("name"),
	description: text("description"),
});

// relations

export const mailRelations = relations(mail, ({ one, many }) => ({
	contact: one(contacts, {
		fields: [mail.contactId],
		references: [contacts.id],
	}),
	tags: many(mailToTags),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
	address: one(address, {
		fields: [contacts.addressId],
		references: [address.id],
	}),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	mails: many(mailToTags),
}));

export const mailToTagsRelations = relations(mailToTags, ({ one }) => ({
	mail: one(mail, {
		fields: [mailToTags.mailId],
		references: [mail.id],
	}),
	tag: one(tags, {
		fields: [mailToTags.tagId],
		references: [tags.id],
	}),
}));

export const outgoingMailRelations = relations(outgoingMail, ({ one }) => ({
	contact: one(contacts, {
		fields: [outgoingMail.contactId],
		references: [contacts.id],
	}),
}));

export const addressRelations = relations(address, ({ many }) => ({
	contacts: many(contacts),
}));
