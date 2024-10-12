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
import { AttendanceService } from './attendance.service';
import { User } from '../user/user.entity';

@WebSocketGateway({ cors: true })
export class AttendanceGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private rooms: { [key: string]: AttendanceRoom } = {};

  constructor(
    private readonly userService: UserService,
    private readonly attendanceService: AttendanceService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }
  @SubscribeMessage(AttendanceMessage.CREATE_ROOM)
  public handleCreateRoom(
    client: any,
    {
      classId,
      secretKey,
      id,
    }: { classId: number; secretKey: string; id: number },
  ) {
    const room = this.rooms[id];
    if (room) {
      this.rooms[id] = {
        id,
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
        this.rooms[id],
      );
    }
    return this.generateErrorResponse('Phòng đã tồn tại');
  }

  @SubscribeMessage(AttendanceMessage.UPDATE_STATUS_ROOM)
  public handleUpdateStatusRoom(
    client: any,
    {
      isOpen,
      id,
      secretKey,
    }: { id: string; isOpen: boolean; secretKey: string },
  ) {
    const room = this.rooms[id];
    if (!room || (room && room.secretKey !== secretKey)) {
      return this.generateErrorResponse('Phòng không tồn tại');
    }
    room.isOpen = !isOpen;
    this.server
      .to(room.id.toString())
      .emit(AttendanceMessage.ROOM_STATUS_UPDATED, { isOpen, id });

    if (isOpen) {
      this.generateQRCode(id); // Tạo QR cho phòng mới
    }

    return this.generateSuccessResponse('Cập nhật thành công', { isOpen });
  }
  private async generateQRCode(id: string) {
    const room = this.rooms[id];
    if (!room.isOpen) {
      return;
    }
    // Tạo payload với id và thời gian hiện tại
    const payload = {
      id: room.id,
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

    this.server.to(room.id.toString()).emit('newQRCode', room.qrCode);

    // Tạo mã QR mới sau mỗi 3 giây
    setTimeout(() => this.generateQRCode(id), room.expirationTime);
  }

  @SubscribeMessage(AttendanceMessage.CHECK_QRCODE)
  public async handleCheckQRCode(
    client: any,
    { code, qrCode }: { code: string; qrCode: string },
  ) {
    // Giải mã mã QR để lấy classId
    const decoded: any = this.verifyQRCode(qrCode);
    if (!decoded.success) {
      return decoded;
    }

    const { classId, createdAt, id } = decoded;

    const room = this.rooms[id];
    if (!room) {
      return this.generateErrorResponse('Phòng không tồn tại.');
    }

    // Kiểm tra thời gian hết hạn của mã QR
    const isQRValid = this.isQRCodeValid(createdAt, room.expirationTime);
    if (!isQRValid) {
      return this.generateErrorResponse('Mã QR đã hết hạn.');
    }

    // Kiểm tra sinh viên đã điểm danh chưa
    const hasCheckedIn = this.hasStudentCheckedIn(room, code);
    if (!hasCheckedIn) {
      const student = await this.userService.findByCodeAndCheckClass(
        code,
        +classId,
      );
      if (!student) {
        return this.generateErrorResponse('Sinh viên không thuộc lớp này.');
      }

      // Thêm sinh viên vào danh sách attendees
      this.addStudentToRoom(room, student, client, classId);

      // Phát sự kiện cập nhật danh sách sinh viên đã điểm danh tới tất cả
      this.server
        .to(classId)
        .emit(AttendanceMessage.UPDATE_ATTENDEES, room.attendees);
    }

    return this.generateSuccessResponse('Điểm danh thành công!');
  }

  private verifyQRCode(qrCode: string) {
    try {
      const decoded = jwt.verify(qrCode, process.env.JWT_SECRET) as {
        id: number;
        classId: string;
        createdAt: number;
      };

      return {
        success: true,
        id: decoded.id,
        classId: decoded.classId,
        createdAt: decoded.createdAt,
      };
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
    room: AttendanceRoom,
    user: User,
    client: any,
    isSuccess: boolean,
  ) {
    this.attendanceService.addAttendee({
      attendanceId: room.id,
      isSuccess,
      userId: user.id,
    });
    room.attendees.push({
      code: user.code,
      name: user.name,
      time: Date.now(),
    });

    client.join(room.id.toString());
    console.log(`Sinh viên ${user.code} đã được thêm vào room ${user.id}`);
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
