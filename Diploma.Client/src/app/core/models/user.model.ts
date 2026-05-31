export interface User {
  id: string;
  userName: string;
  email: string;
  fullName?: string; 
  roles: string[];
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nickname?: string;
  phoneNumber?: string;
  birthDate?: string | Date;
  gender?: string;
  avatarUrl?: string;
}