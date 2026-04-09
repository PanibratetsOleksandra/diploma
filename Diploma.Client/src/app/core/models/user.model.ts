export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  roles: string[]; // Це поле ми додамо пізніше, поки воно може бути порожнім
}