import 'dotenv/config'; // Để sử dụng các biến môi trường trong file
import { join } from 'path';
import { createConnection } from 'typeorm';
import { Permission } from '../modules/permission/permission.entity';
import { AppPermission } from '../app.role';
import { Role } from '../modules/role/role.entity';

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
    const permissionRepository = connection.getRepository(Permission);
    const roleRepository = connection.getRepository(Role);
    const permissions = [];
    for (const per of Object.values(AppPermission)) {
      const action = per.split(':')[1];
      const resource = per.split(':')[0];
      permissions.push(permissionRepository.create({ action, resource }));
    }

    await permissionRepository.save(permissions);

    await connection.close();
  } catch (error) {
    console.error('Error dumping data:', error);
    process.exit(1);
  }
}

run();
