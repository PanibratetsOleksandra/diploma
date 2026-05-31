export interface DecodedToken {
  nameid: string;
  email: string;
  fullName: string;
  role: string | string[];
  exp: number;
}
