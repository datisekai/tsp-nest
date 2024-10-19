import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { META_KEY, UpdateMetaDto } from './meta.dto';
import { ApiTags } from '@nestjs/swagger';
import { AppPermission, AppResource } from 'src/app.role';
import { JwtAuthGuard } from '../auth/guards';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from 'src/common/decorators';
import { ApiPermissions } from 'src/common/decorators/api.decorator';

@ApiTags(AppResource.META)
@Controller('api.meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  // Cập nhật hoặc tạo mới meta setting
  @Patch(META_KEY.SETTING)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.META_UPDATE)
  @ApiPermissions(AppPermission.META_UPDATE)
  async updateSetting(@Body() updateMetaDto: UpdateMetaDto) {
    return this.metaService.updateMeta(META_KEY.SETTING, updateMetaDto);
  }

  @Patch(META_KEY.PROMPT)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(AppPermission.META_UPDATE)
  @ApiPermissions(AppPermission.META_UPDATE)
  async updatePrompt(@Body() updateMetaDto: UpdateMetaDto) {
    return this.metaService.updateMeta(META_KEY.PROMPT, updateMetaDto);
  }

  // Lấy meta theo key
  @Get(META_KEY.SETTING)
  async getMeta() {
    return this.metaService.getMetaByKey(META_KEY.SETTING);
  }

  @Get(META_KEY.PROMPT)
  async getPrompt() {
    return this.metaService.getMetaByKey(META_KEY.PROMPT);
  }
}
