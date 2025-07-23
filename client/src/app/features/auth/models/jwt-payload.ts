export interface JwtPayload {
    sub: string;           // User ID
    email: string;        // User email
    unique_name: string;     // Username
    fullName: string;      // FullName
    profilePictureUrl: string // User's profile pisture Url
    roles: string[];      // Alternative roles format
    exp: number;           // Expiration timestamp
    iat: number;           // Issued at timestamp
    iss: string;          // Issuer
    aud: string;          // Audience
}
