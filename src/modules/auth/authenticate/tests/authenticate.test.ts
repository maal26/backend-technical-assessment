import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "@/shared/main.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { db } from "@/shared/database/index.ts";
import { users } from "@/shared/database/schemas/users.ts";
import { eq } from "drizzle-orm";
import { sessions } from "@/shared/database/schemas/sessions.ts";
import bcrypt from "bcryptjs";
import { envs } from "@/shared/config/envs.ts";

describe("POST /register", () => {
    it("should be possible to register a new user", async () => {
        const payload = {
            name: "John Doe",
            email: "john+doe@mail.com",
            password: "password",
        };

        const response = await request(app).post("/auth/register").send(payload);

        assert.strictEqual(response.status, STATUS_CODES.CREATED);

        const [user] = await db.select().from(users).where(eq(users.email, payload.email));

        assert.strictEqual(payload.name, user.name);
        assert.strictEqual(payload.email, user.email);

        const [session] = await db.select().from(sessions).where(eq(sessions.userId, user.id));

        assert.strictEqual(user.id, session.userId);

        assert.deepStrictEqual(response.body, {
            email: user.email,
            name: user.name,
            token: session.token,
        });
    });

    it("should validate name as required", async () => {
        const response = await request(app).post("/auth/register").send({});

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.name.errors[0],
            "Invalid input: expected string, received undefined"
        );
    });

    it("should validate name as min:3", async () => {
        const response = await request(app).post("/auth/register").send({
            name: "jo",
        });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.name.errors[0],
            "Too small: expected string to have >=3 characters"
        );
    });

    it("should validate name as max:50", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "a".repeat(51),
            });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(response.body.properties.name.errors[0], "Too big: expected string to have <=50 characters");
    });

    it("should validate email a valid email", async () => {
        const response = await request(app).post("/auth/register").send({
            email: "wrong@.com",
        });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(response.body.properties.email.errors[0], "Invalid email address");
    });

    it("should validate email as max:255", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                email: `a`.repeat(255) + "@mail.com",
            });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.email.errors[0],
            "Too big: expected string to have <=255 characters"
        );
    });

    it("should validate password as min:8", async () => {
        const response = await request(app).post("/auth/register").send({
            password: "pass",
        });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.password.errors[0],
            "Too small: expected string to have >=8 characters"
        );
    });

    it("should validate password as max:60", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                password: `a`.repeat(61),
            });

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);

        assert.strictEqual(
            response.body.properties.password.errors[0],
            "Too big: expected string to have <=60 characters"
        );
    });
});

describe("POST /login", () => {
    it("should be possible to login", async () => {
        const payload = {
            name: "Joseph Mcfly",
            email: "joseph+mcfly@mail.com",
            password: "password",
        };

        await request(app).post("/auth/register").send(payload);

        const response = await request(app).post("/auth/login").send({
            email: payload.email,
            password: payload.password,
        });

        const [user] = await db.select().from(users).where(eq(users.email, payload.email));
        const [session] = await db.select().from(sessions).where(eq(sessions.userId, user.id));

        assert.strictEqual(response.status, STATUS_CODES.OK);

        assert.deepStrictEqual(response.body, {
            name: payload.name,
            email: payload.email,
            token: session.token,
        });
    });

    it("should requires email", async () => {
        const payload = {
            name: "Joseph Mcfly",
            email: "joseph+mcfly@mail.com",
            password: "password",
        };

        await request(app).post("/auth/register").send(payload);

        const response = await request(app).post("/auth/login").send({});

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(
            response.body.properties.email.errors[0],
            "Invalid input: expected string, received undefined"
        );
    });

    it("should requires password", async () => {
        const payload = {
            name: "Joseph Mcfly",
            email: "joseph+mcfly@mail.com",
            password: "password",
        };

        await request(app).post("/auth/register").send(payload);

        const response = await request(app).post("/auth/login").send({});

        assert.strictEqual(response.status, STATUS_CODES.UNPROCESSABLE_ENTITY);
        assert.strictEqual(
            response.body.properties.password.errors[0],
            "Invalid input: expected string, received undefined"
        );
    });

    it("should return HTTP 401 if auth fails", async () => {
        const payload = {
            name: "Joseph Mcfly",
            email: "joseph+mcfly@mail.com",
            password: "password",
        };

        await request(app).post("/auth/register").send(payload);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: payload.email,
                password: payload.password + "a",
            });

        assert.strictEqual(response.status, STATUS_CODES.UNAUTHORIZED);
        assert.deepStrictEqual(response.body, { message: "Invalid Credentials" });
    });
});
