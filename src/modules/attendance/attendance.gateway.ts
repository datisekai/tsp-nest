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
import { UserService } from '../user/user.service';

@WebSocketGateway({ cors: true })
export class AttendanceGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private rooms: { [key: string]: AttendanceRoom } = {};

  constructor(
    private readonly userService: UserService, // Inject AttendanceService
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }
  @SubscribeMessage(AttendanceMessage.CREATE_ROOM)
  public handleCreateRoom(
    client: any,
    { classId, secretKey }: { classId: number; secretKey: string },
  ) {
    const room = this.rooms[classId];
    if (room) {
      this.rooms[classId] = {
        classId,
        secretKey,
        qrCode: '',
        expirationTime: 3000, // 3 giây
        lastGeneratedTime: 0,
        attendees: [],
        isOpen: false,
      };
      return this.generateSuccessResponse(
        'Tạo phòng thành công',
        this.rooms[classId],
      );
    }
    return this.generateErrorResponse('Phòng đã tồn tại');
  }

  @SubscribeMessage(AttendanceMessage.UPDATE_STATUS_ROOM)
  public handleUpdateStatusRoom(
    client: any,
    {
      isOpen,
      classId,
      secretKey,
    }: { classId: string; isOpen: boolean; secretKey: string },
  ) {
    const room = this.rooms[classId];
    if (!room || (room && room.secretKey !== secretKey)) {
      return this.generateErrorResponse('Phòng không tồn tại');
    }
    room.isOpen = !isOpen;
    this.server
      .to(room.classId.toString())
      .emit(AttendanceMessage.ROOM_STATUS_UPDATED, { isOpen, classId });

    if (isOpen) {
      this.generateQRCode(classId); // Tạo QR cho phòng mới
    }

    return this.generateSuccessResponse('Cập nhật thành công', { isOpen });
  }
  private async generateQRCode(classId: string) {
    const room = this.rooms[classId];
    if (!room.isOpen) {
      return;
    }
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
    setTimeout(() => this.generateQRCode(classId), room.expirationTime);
  }

  @SubscribeMessage(AttendanceMessage.CHECK_QRCODE)
  public async handleCheckQRCode(
    client: any,
    {
      code,
      classId,
      qrCode,
    }: { code: string; classId: string; qrCode: string },
  ) {
    const room = this.rooms[classId];

    if (!room) {
      return this.generateErrorResponse('Phòng không tồn tại.');
    }

    const decoded: any = this.verifyQRCode(qrCode, classId);
    if (!decoded.success) {
      return decoded;
    }

    const isQRValid = this.isQRCodeValid(
      decoded.createdAt,
      room.expirationTime,
    );
    if (!isQRValid) {
      return this.generateErrorResponse('Mã QR đã hết hạn.');
    }

    const hasCheckedIn = this.hasStudentCheckedIn(room, code);
    if (!hasCheckedIn) {
      const student = await this.userService.findByCodeAndCheckClass(
        code,
        +classId,
      );
      if (!student) {
        return this.generateErrorResponse('Sinh viên không thuộc lớp này.');
      }

      this.addStudentToRoom(room, student, client, classId);

      this.server
        .to(classId)
        .emit(AttendanceMessage.UPDATE_ATTENDEES, room.attendees);
    }

    return this.generateSuccessResponse('Điểm danh thành công!');
  }

  private verifyQRCode(qrCode: string, classId: string) {
    try {
      const decoded = jwt.verify(qrCode, process.env.JWT_SECRET) as {
        classId: string;
        createdAt: number;
      };

      if (decoded.classId !== classId) {
        return this.generateErrorResponse('Mã QR không hợp lệ cho phòng này.');
      }

      return { success: true, ...decoded };
    } catch (err) {
      return this.generateErrorResponse('Mã QR không hợp lệ.');
    }
  }

  private isQRCodeValid(createdAt: number, expirationTime: number) {
    const currentTime = Date.now();
    return currentTime - createdAt < expirationTime;
  }

  private hasStudentCheckedIn(room: any, code: string) {
    return room.attendees.some((item: any) => item.code === code);
  }

  private addStudentToRoom(
    room: any,
    student: any,
    client: any,
    classId: string,
  ) {
    room.attendees.push({
      code: student.code,
      name: student.name,
      time: Date.now(),
    });

    client.join(classId);
    console.log(`Sinh viên ${student.code} đã được thêm vào room ${classId}`);
  }

  private generateErrorResponse(message: string, data?: any) {
    return { success: false, message, data };
  }

  private generateSuccessResponse(message: string, data?: any) {
    return { success: true, message, data };
  }

  @SubscribeMessage(AttendanceMessage.DELETE_ROOM)
  public handleDeleteRoom(client: any, classId: string) {
    if (this.rooms[classId]) {
      delete this.rooms[classId];

      this.server.emit(AttendanceMessage.ROOM_DELETED, classId);

      return this.generateSuccessResponse('Phòng đã được xoá', { classId });
    } else {
      return this.generateErrorResponse('Phòng không tồn tại', { classId });
    }
  }
}
