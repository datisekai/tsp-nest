import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AttendanceMessage, AttendanceRoom } from './attendance.dto';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { AttendanceService } from './attendance.service';
import { User } from '../user/user.entity';
import { Attendee } from './attendance.dto';
import { haversine } from 'src/common/helpers';

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
  @SubscribeMessage(AttendanceMessage.JOIN_OR_CREATE)
  public handleJoinOrCreate(
    client: any,
    data: {
      classId: number;
      secretKey: string;
      id: number;
      attendees?: Attendee[];
      expirationTime?: number;
      location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
      };
    },
  ) {
    const {
      classId,
      id,
      secretKey,
      attendees = [],
      expirationTime = 3000,
      location,
    } = data;
    const room = this.rooms[id];
    if (!room) {
      this.rooms[id] = {
        id,
        classId,
        secretKey,
        qrCode: '',
        expirationTime: expirationTime, // 3 giây
        lastGeneratedTime: 0,
        attendees,
        isOpen: false,
        location,
      };
      client.join(id.toString());
      setTimeout(() => {
        this.autoCloseRoom(id.toString());
      }, 3600000);

      return this.generateSuccessResponse(
        'Tạo phòng thành công',
        this.rooms[id],
      );
    }

    this.rooms[id] = {
      id,
      classId,
      secretKey,
      qrCode: '',
      expirationTime: expirationTime, // 3 giây
      lastGeneratedTime: 0,
      attendees,
      isOpen: false,
      location,
    };
    client.join(id.toString());

    return this.generateSuccessResponse('Tham gia phòng thành công', room);
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
    room.isOpen = isOpen;
    this.server
      .to(room.id.toString())
      .emit(AttendanceMessage.ROOM_STATUS_UPDATED, room);
    this.attendanceService.update(room.id, { isOpen });

    if (isOpen) {
      this.generateQRCode(id); // Tạo QR cho phòng mới
    }

    return this.generateSuccessResponse('Cập nhật thành công', { isOpen });
  }

  private autoCloseRoom(id: string) {
    const room = this.rooms[id];
    if (!room || !room?.isOpen) {
      return;
    }

    this.rooms[id] = null;
  }
  private async generateQRCode(id: string) {
    const room = this.rooms[id];
    if (!room || !room?.isOpen) {
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
    room.qrCode = token;
    room.lastGeneratedTime = Date.now();

    this.server.to(room.id.toString()).emit('newQRCode', room);

    // Tạo mã QR mới sau mỗi 3 giây
    setTimeout(() => this.generateQRCode(id), room.expirationTime);
  }

  @SubscribeMessage(AttendanceMessage.CHECK_QRCODE)
  public async handleCheckQRCode(
    client: any,
    {
      code,
      qrCode,
      location,
    }: {
      code: string;
      qrCode: string;
      location: { latitude: number; longitude: number };
    },
  ) {
    if (!code || !qrCode || !location) {
      return this.generateErrorResponse('Vui lòng truyền đầy đủ thông tin.');
    }
    console.log('handleCheckQRCode', location);

    if (location && (!location.latitude || !location.longitude)) {
      return this.generateErrorResponse(
        'Sinh viên không nằm trong phạm vi điểm danh.',
      );
    }
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

      console.log(
        'location',
        +location.latitude,
        +location.longitude,
        +room.location.latitude,
        +room.location.longitude,
      );

      //Kiểm tra vị trí
      const distance = haversine(
        +location.latitude,
        +location.longitude,
        +room.location.latitude,
        +room.location.longitude,
      );

      console.log('distance', distance);
      if (distance >= +room.location.accuracy) {
        return this.generateErrorResponse(
          'Sinh viên không nằm trong phạm vi điểm danh',
        );
      }

      // Thêm sinh viên vào danh sách attendees
      this.addStudentToRoom(room, student, client, true);

      // Phát sự kiện cập nhật danh sách sinh viên đã điểm danh tới tất cả
      this.server
        .to(room.id.toString())
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
    room.attendees.unshift({
      code: user.code,
      name: user.name,
      time: Date.now(),
    });

    // client.join(room.id.toString());
    console.log(`Sinh viên ${user.code} đã được thêm vào room ${room.id}`);
  }

  private generateErrorResponse(message: string, data?: any) {
    console.log('generateErrorResponse', message, data);
    return { success: false, message, data };
  }

  private generateSuccessResponse(message: string, data?: any) {
    console.log('generateErrorResponse', message, data);
    return { success: true, message, data };
  }

  @SubscribeMessage(AttendanceMessage.DELETE_ROOM)
  public handleDeleteRoom(client: any, id: string) {
    if (this.rooms[id]) {
      delete this.rooms[id];

      this.server.emit(AttendanceMessage.ROOM_DELETED, id);

      return this.generateSuccessResponse('Phòng đã được xoá', { id });
    } else {
      return this.generateErrorResponse('Phòng không tồn tại', { id });
    }
  }
}
