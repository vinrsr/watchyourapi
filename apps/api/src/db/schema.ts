import { relations } from 'drizzle-orm'
import { pgTable, uuid, text, integer, timestamp, pgEnum, jsonb, unique } from 'drizzle-orm/pg-core'

export const monitorStatusEnum = pgEnum('monitor_status', ['active', 'paused', 'down'])
export const monitorMethodEnum = pgEnum('monitor_method', ['GET', 'POST', 'HEAD'])
export const checkResultEnum = pgEnum('check_result', ['success', 'timeout', 'error'])
export const alertChannelTypeEnum = pgEnum('alert_channel_type', ['email', 'slack'])

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const monitors = pgTable('monitors', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    method: monitorMethodEnum('method').notNull().default('GET'),
    intervalSeconds: integer('interval_seconds').notNull().default(60),
    timeoutSeconds: integer('timeout_seconds').notNull().default(30),
    status: monitorStatusEnum('status').notNull().default('active'),
    lastCheckedAt: timestamp('last_checked_at'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const checks = pgTable('checks', {
    id: uuid('id').primaryKey().defaultRandom(),
    monitorId: uuid('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    statusCode: integer('status_code'),
    responseTimeMs: integer('response_time_ms'),
    result: checkResultEnum('result').notNull(),
    errorMessage: text('error_message'),
    checkedAt: timestamp('checked_at').defaultNow(),
})

export const incidents = pgTable('incidents', {
    id: uuid('id').primaryKey().defaultRandom(),
    monitorId: uuid('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at').defaultNow(),
    resolvedAt: timestamp('resolved_at'),
    durationSeconds: integer('duration_seconds'),
    cause: text('cause'),
})

export const alertChannels = pgTable('alert_channels', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: alertChannelTypeEnum('type').notNull(),
    name: text('name').notNull(),
    config: jsonb('config').notNull().default({}),
    createdAt: timestamp('created_at').defaultNow(),
})

export const monitorAlertChannels = pgTable('monitor_alert_channels', {
    id: uuid('id').primaryKey().defaultRandom(),
    monitorId: uuid('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    alertChannelId: uuid('alert_channel_id').notNull().references(() => alertChannels.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.monitorId, t.alertChannelId)
}))

export const passwordResets = pgTable('password_resets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
    monitors: many(monitors),
    alertChannels: many(alertChannels),
    refreshTokens: many(refreshTokens),
}))

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
    user: one(users, {
        fields: [monitors.userId],
        references: [users.id],
    }),
    checks: many(checks),
    incidents: many(incidents),
    monitorAlertChannels: many(monitorAlertChannels),
}))

export const checksRelations = relations(checks, ({ one }) => ({
    monitor: one(monitors, {
        fields: [checks.monitorId],
        references: [monitors.id],
    }),
}))

export const incidentsRelations = relations(incidents, ({ one }) => ({
    monitor: one(monitors, {
        fields: [incidents.monitorId],
        references: [monitors.id],
    }),
}))

export const alertChannelsRelations = relations(alertChannels, ({ one, many }) => ({
    user: one(users, {
        fields: [alertChannels.userId],
        references: [users.id],
    }),
    monitorAlertChannels: many(monitorAlertChannels),
}))

export const monitorAlertChannelsRelations = relations(monitorAlertChannels, ({ one }) => ({
    monitor: one(monitors, {
        fields: [monitorAlertChannels.monitorId],
        references: [monitors.id],
    }),
    alertChannel: one(alertChannels, {
        fields: [monitorAlertChannels.alertChannelId],
        references: [alertChannels.id],
    }),
}))

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}))