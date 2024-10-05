import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface UserInfo {
  code: string;
  name: string;
  password: string;
}

@Injectable()
export class InitService {
  async getStudentInfo(
    username: string,
    password: string,
  ): Promise<UserInfo | null> {
    const URL = 'https://ctsv.sgu.edu.vn/sinhvien/index.php';
    try {
      const response = await axios.post(
        URL,
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const $ = cheerio.load(response.data);
      const html = $('.knx > .vb16xanh').html()?.toString();
      if (!html) return null;
      const code = html.match(/Mã sinh viên: (\d+)(?=<br>)/)[1];
      const name = html.match(/Họ và tên: (.+?)(?=<br>)/)[1];

      const studentInfo: UserInfo = {
        code,
        name,
        password,
      };

      return studentInfo;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTeacherInfo(
    username: string,
    password: string,
  ): Promise<UserInfo | null> {
    const URL = 'https://nhapdiem.sgu.edu.vn/public/Apihelper.php';
    try {
      const payload = `username=${username}&password=${password}`;
      const response = await axios.post(URL, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const success = !!response.data;
      if (success) {
        const userInfo: UserInfo = {
          code: username,
          name: `Giảng viên ${username}`,
          password,
        };
        return userInfo;
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
