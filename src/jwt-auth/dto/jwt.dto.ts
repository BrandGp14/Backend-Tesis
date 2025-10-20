export class JwtDto {
    sub: string;
    email: string;
    role: string;
    role_id: string;
    institution: string;

    constructor(sub: string, email: string, role: string, role_id: string, institution: string) {
        this.sub = sub;
        this.email = email;
        this.role = role;
        this.role_id = role_id;
        this.institution = institution;
    }
}
