import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import { AttendanceMessage, AttendanceRoom } from './attendance.dto';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: true })
export class AttendanceGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private rooms: { [key: string]: AttendanceRoom } = {};

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }
  @SubscribeMessage(AttendanceMessage.CREATE_ROOM)
  public handleCreateRoom(
    client: any,
    { classId, ownerId }: { classId: number; ownerId: number },
  ) {
    if (!this.rooms[classId]) {
      this.rooms[classId] = {
        classId,
        ownerId,
        qrCode: '',
        expirationTime: 3000, // 3 giây
        lastGeneratedTime: 0,
        attendees: [],
        isOpen: false,
      };
      this.generateQRCode(this.rooms[classId]); // Tạo QR cho phòng mới
      client.emit('roomCreated', classId);
    } else {
      client.emit('roomExists', classId);
    }
  }

  @SubscribeMessage(AttendanceMessage.UPDATE_STATUS_ROOM)
  public handleUpdateStatusRoom(
    client: any,
    { isOpen, classId }: { classId: string; isOpen: boolean },
  ) {
    if (this.rooms[classId]) {
      this.rooms[classId].isOpen = !isOpen;
      this.server.emit(AttendanceMessage.ROOM_STATUS_UPDATED, {
        classId,
        isOpen,
      });
    }
  }
  private async generateQRCode(room: AttendanceRoom) {
    // Tạo payload với classId và thời gian hiện tại
    const payload = {
      classId: room.classId,
      createdAt: Date.now(),
    };

    // Tạo JWT với thời gian hết hạn (ví dụ: 3 giây)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: `${room.expirationTime / 1000}s`,
    });

    // Tạo mã QR từ token
    room.qrCode = await QRCode.toDataURL(token);
    room.lastGeneratedTime = Date.now();

    this.server.to(room.classId.toString()).emit('newQRCode', room.qrCode);

    // Tạo mã QR mới sau mỗi 3 giây
    setTimeout(() => this.generateQRCode(room), room.expirationTime);
  }

  @SubscribeMessage(AttendanceMessage.CHECK_QRCODE)
  public handleCheckQRCode(
    client: any,
    { id, classId, qrCode }: { id: string; classId: string; qrCode: string },
  ) {
    const room = this.rooms[classId]; // Truy xuất phòng bằng classId

    if (room) {
      try {
        // Giải mã mã QR
        const decoded = jwt.verify(qrCode, process.env.JWT_SECRET) as {
          classId: string;
          createdAt: number;
        };

        // Kiểm tra mã QR có khớp với classId hay không
        if (decoded.classId !== classId) {
          return {
            success: false,
            message: 'Mã QR không hợp lệ cho phòng này.',
          };
        }

        const currentTime = Date.now();
        // Kiểm tra thời gian hết hạn của mã QR
        if (currentTime - decoded.createdAt < room.expirationTime) {
          console.log(
            `Sinh viên với mã ID: ${id} đã điểm danh thành công trong phòng ${classId}`,
          );

          // Nếu sinh viên chưa được điểm danh, thêm họ vào danh sách attendees
          if (!room.attendees.includes(id)) {
            room.attendees.push(id);

            // Thêm client vào room
            client.join(classId);
            console.log(`Sinh viên ${id} đã được thêm vào room ${classId}`);

            // Phát sự kiện cập nhật danh sách sinh viên đã điểm danh tới tất cả sinh viên trong phòng
            this.server.to(classId).emit('updateAttendees', room.attendees);
          }

          return { success: true, message: 'Điểm danh thành công!' };
        } else {
          return { success: false, message: 'Mã QR đã hết hạn.' };
        }
      } catch (err) {
        return { success: false, message: 'Mã QR không hợp lệ.' };
      }
    } else {
      return { success: false, message: 'Phòng không tồn tại.' };
    }
  }

  @SubscribeMessage(AttendanceMessage.DELETE_ROOM)
  public handleDeleteRoom(client: any, classId: string) {
    if (this.rooms[classId]) {
      delete this.rooms[classId];
      this.server.emit('roomDeleted', classId);
    } else {
      client.emit('roomNotFound', classId);
    }
  }
}
