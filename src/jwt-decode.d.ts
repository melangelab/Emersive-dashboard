// src/@types/jwt-decode.d.ts
declare module "jwt-decode" {
  /**
   * Interface for JWT decode options
   */
  export interface JwtDecodeOptions {
    header?: boolean
  }

  /**
   * Main decode function
   */
  export function jwtDecode<T = any>(token: string, options?: JwtDecodeOptions): T

  /**
   * Error class for invalid tokens
   */
  export class InvalidTokenError extends Error {
    constructor(message: string)
  }
}
