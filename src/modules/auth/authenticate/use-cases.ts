import bcrypt from "bcryptjs";

import type { AuthenticateUserInput, RegisterUserInput } from "./schemas.ts";

import { userRepository } from "@/shared/database/repository/users.ts";
import { sessionRepository } from "@/shared/database/repository/sessions.ts";

import { errorResponse, successResponse } from "@/shared/infra/http/api-response.ts";
import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";

export async function authenticate({ email, password }: AuthenticateUserInput) {
    const { getUserByEmail } = userRepository();
    const { createSession, removeAllUserSessions } = sessionRepository();

    const user = await getUserByEmail(email);

    if (!user) {
        return errorResponse("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return errorResponse("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
    }

    await removeAllUserSessions(user.id);
    const token = await createSession(user.id);

    return successResponse({ ...user, id: undefined, password: undefined, token }, STATUS_CODES.OK);
}

export async function register({ name, email, password }: RegisterUserInput) {
    const { existsUserWithEmail, createUser } = userRepository();
    const { createSession } = sessionRepository();

    const exists = await existsUserWithEmail(email);

    if (exists) {
        return errorResponse("email is already being used", STATUS_CODES.UNPROCESSABLE_ENTITY);
    }

    const user = await createUser({ name, email, password });

    const token = await createSession(user.id);

    return successResponse({ ...user, id: undefined, token }, STATUS_CODES.CREATED);
}
