import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WorkflowGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('workflow:subscribe')
  handleSubscribe(
    @MessageBody() data: { chantierId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.chantierId) {
      client.join(`chantier_${data.chantierId}`);
    }
  }

  @SubscribeMessage('workflow:unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { chantierId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.chantierId) {
      client.leave(`chantier_${data.chantierId}`);
    }
  }

  broadcastPhaseChange(chantierId: string, newPhase: number) {
    this.server.to(`chantier_${chantierId}`).emit('phase:changed', {
      chantierId,
      newPhase,
      timestamp: Date.now(),
    });
  }
}
