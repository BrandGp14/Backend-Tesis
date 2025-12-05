import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtWsAuthGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('🔑 Autenticando con socket.io...');
        return true
    }
}