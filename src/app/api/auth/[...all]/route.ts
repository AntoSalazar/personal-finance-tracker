import { auth } from "@/lib/infrastructure/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (BetterAuth)
 *
 * /api/auth/sign-in/email:
 *   post:
 *     summary: Sign in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful sign in
 *       400:
 *         description: Invalid credentials
 *
 * /api/auth/sign-up/email:
 *   post:
 *     summary: Sign up with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful sign up
 *       400:
 *         description: Validation error
 *
 * /api/auth/sign-out:
 *   post:
 *     summary: Sign out
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully signed out
 *
 * /api/auth/session:
 *   get:
 *     summary: Get current session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current session data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 */
export const { GET, POST } = toNextJsHandler(auth);
