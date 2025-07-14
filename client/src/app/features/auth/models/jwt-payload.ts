export interface JwtPayload {
    sub: string;           // User ID
    email?: string;        // User email
    username?: string;     // Username
    role?: string | string[]; // User role(s)
    roles?: string[];      // Alternative roles format
    exp: number;           // Expiration timestamp
    iat: number;           // Issued at timestamp
    iss?: string;          // Issuer
    aud?: string;          // Audience
}
