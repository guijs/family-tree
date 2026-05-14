import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GenealogyService, CreateTreeDto, CreatePersonDto } from './genealogy.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators';

@ApiTags('genealogy')
@Controller('genealogy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenealogyController {
  constructor(private genealogyService: GenealogyService) {}

  // Tree endpoints
  @Post('trees')
  @ApiOperation({ summary: 'Create a new genealogy tree' })
  @ApiResponse({ status: 201, description: 'Tree created successfully' })
  async createTree(@Request() req: any, @Body() dto: CreateTreeDto) {
    return this.genealogyService.createTree(req.user.sub, dto);
  }

  @Get('trees')
  @ApiOperation({ summary: 'Get all trees for current user' })
  @ApiResponse({ status: 200, description: 'List of trees' })
  async findTrees(@Request() req: any) {
    return this.genealogyService.findTrees(req.user.sub);
  }

  @Get('trees/:id')
  @ApiOperation({ summary: 'Get tree by ID' })
  @ApiResponse({ status: 200, description: 'Tree details' })
  async findTreeById(@Param('id') id: string, @Request() req: any) {
    return this.genealogyService.findTreeById(id, req.user.sub);
  }

  // Person endpoints
  @Post('persons')
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created successfully' })
  async createPerson(@Body() dto: CreatePersonDto) {
    return this.genealogyService.createPerson(dto);
  }

  @Get('persons/:id/ancestors')
  @ApiOperation({ summary: 'Get ancestors of a person' })
  @ApiQuery({ name: 'treeId', required: true })
  @ApiQuery({ name: 'maxDepth', required: false, type: Number, default: 5 })
  @ApiResponse({ status: 200, description: 'List of ancestors' })
  async getAncestors(
    @Param('id') id: string,
    @Query('treeId') treeId: string,
    @Query('maxDepth', () => Number) maxDepth: number = 5,
  ) {
    return this.genealogyService.getAncestors(id, treeId, maxDepth);
  }

  @Get('persons/:id/descendants')
  @ApiOperation({ summary: 'Get descendants of a person' })
  @ApiQuery({ name: 'treeId', required: true })
  @ApiQuery({ name: 'maxDepth', required: false, type: Number, default: 5 })
  @ApiResponse({ status: 200, description: 'List of descendants' })
  async getDescendants(
    @Param('id') id: string,
    @Query('treeId') treeId: string,
    @Query('maxDepth', () => Number) maxDepth: number = 5,
  ) {
    return this.genealogyService.getDescendants(id, treeId, maxDepth);
  }

  @Get('trees/:id/family-tree')
  @ApiOperation({ summary: 'Get full family tree structure' })
  @ApiQuery({ name: 'rootPersonId', required: false })
  @ApiQuery({ name: 'maxDepth', required: false, type: Number, default: 3 })
  @ApiResponse({ status: 200, description: 'Family tree structure' })
  async getFamilyTree(
    @Param('id') treeId: string,
    @Query('rootPersonId') rootPersonId?: string,
    @Query('maxDepth', () => Number) maxDepth: number = 3,
  ) {
    return this.genealogyService.getFamilyTree(treeId, rootPersonId, maxDepth);
  }

  @Put('persons/:id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiResponse({ status: 200, description: 'Person updated successfully' })
  async updatePerson(@Param('id') id: string, @Body() data: any) {
    const { version, ...updateData } = data;
    return this.genealogyService.updatePerson(id, updateData, version);
  }

  @Delete('persons/:id')
  @ApiOperation({ summary: 'Delete a person (soft delete)' })
  @ApiResponse({ status: 200, description: 'Person deleted successfully' })
  async deletePerson(@Param('id') id: string) {
    return this.genealogyService.deletePerson(id);
  }
}
