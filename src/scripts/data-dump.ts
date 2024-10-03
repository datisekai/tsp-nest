import { createConnection } from 'typeorm';
import { join } from 'path';
import 'dotenv/config'; // Để sử dụng các biến môi trường trong file
import { User } from '../modules/user/user.entity';
import { Permission } from '..//modules/permission/permission.entity';
import { Role } from '..//modules/role/role.entity';
import { UserType } from '../modules/user/user.dto';

async function run() {
  try {
    // Create connection using environment variables like in your TypeOrmModule configuration
    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [join(__dirname, '../**/*.entity.{ts,js}')], // Adjust to match your project structure
      synchronize: true,
    });

    // Get repositories
    const userRepository = connection.getRepository(User);
    const roleRepository = connection.getRepository(Role);
    const permissionRepository = connection.getRepository(Permission);

    // Create some default permissions
    const permission1 = permissionRepository.create({
      action: 'view',
      resource: 'user',
    });

    const permission2 = permissionRepository.create({
      action: 'update',
      resource: 'user',
    });

    await permissionRepository.save([permission1, permission2]);

    // Create some default roles
    const roleAdmin = roleRepository.create({
      name: 'admin',
      permissions: [permission1, permission2],
    });

    const roleTeacher = roleRepository.create({
      name: 'teacher',
      permissions: [permission1],
    });

    await roleRepository.save([roleAdmin, roleTeacher]);

    // Create some default users
    const userAdmin = userRepository.create({
      code: 'admin001',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      type: UserType.TEACHER,
      role: roleAdmin,
    });

    const userTeacher = userRepository.create({
      code: 'teacher001',
      email: 'teacher@example.com',
      password: 'teacher123',
      name: 'Teacher User',
      type: UserType.TEACHER,
      role: roleTeacher,
    });

    await userRepository.save([userAdmin, userTeacher]);

    console.log('Data dumped successfully!');
    await connection.close();
  } catch (error) {
    console.error('Error dumping data:', error);
    process.exit(1);
  }
}

run();
