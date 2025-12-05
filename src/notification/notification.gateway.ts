import { Logger, UseGuards } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { JwtWsAuthGuard } from "src/jwt-auth/jwt-ws-auth.guard";
import { Server, Socket } from "socket.io";


@WebSocketGateway(3001, { cors: { origin: "*" }, namespace: 'notifications' })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server

    private logger = new Logger(NotificationGateway.name);

    @UseGuards(JwtWsAuthGuard)
    handleConnection(client: Socket) {
        this.logger.log(`Cliente ${client.id} conectado`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Cliente ${client.id} desconectado`);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: any) {
        console.log(data);
    }
}