declare module "react-oauth/google" {
  export const GoogleOAuthProvider: React.FC<{ clientId: string }>
  export const GoogleLogin: React.FC<{ onSuccess: (response: any) => void; onError: () => void }>
}
