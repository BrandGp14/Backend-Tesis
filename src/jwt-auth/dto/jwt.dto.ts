export class JwtDto {
    sub: string;
    email: string;
    role: string;
    role_id: string;

    constructor(sub: string, email: string, role: string, role_id: string) {
        this.sub = sub;
        this.email = email;
        this.role = role;
        this.role_id = role_id;
    }
}
