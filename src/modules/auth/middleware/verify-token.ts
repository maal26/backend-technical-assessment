import type { Request, Response, NextFunction } from "express";

import { STATUS_CODES } from "@/shared/infra/http/status-code.ts";
import { sessionRepository } from "@/shared/database/repository/sessions.ts";

export async function verifyToken(request: Request, response: Response, next: NextFunction) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return response.status(STATUS_CODES.UNAUTHORIZED).json({
                error: "Token not provided.",
            });
        }

        const { isValidToken } = sessionRepository();

        const token = authHeader.startsWith("Bearer") ? (authHeader.split(" ")[1] ?? "") : authHeader;

        const session = await isValidToken(token);

        if (!session) {
            return response.status(STATUS_CODES.UNAUTHORIZED).json({
                error: "Invalid token",
            });
        }

        request.sessionToken = session.token;
        request.userId = session.user_id;

        next();
    } catch (error) {
        response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error.",
        });
    }
}
