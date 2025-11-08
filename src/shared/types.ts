import "express";

declare module "express" {
    export interface Request {
        sessionToken?: string;
        userId?: number;
    }
}
