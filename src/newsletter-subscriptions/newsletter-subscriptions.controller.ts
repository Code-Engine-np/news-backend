import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NewsletterSubscriptionsService } from './newsletter-subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('newsletter-subscriptions')
@Controller('newsletter-subscriptions')
export class NewsletterSubscriptionsController {
  constructor(
    private readonly newsletterSubscriptionsService: NewsletterSubscriptionsService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all newsletter subscriptions' })
  @ApiOkResponse({ description: 'Returns all subscriptions.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  findAll() {
    return this.newsletterSubscriptionsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to the newsletter' })
  @ApiCreatedResponse({ description: 'Returns the subscription.' })
  create(@Body() dto: CreateSubscriptionDto) {
    return this.newsletterSubscriptionsService.create(dto);
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Unsubscribe from the newsletter' })
  @ApiOkResponse({ description: 'Unsubscribed successfully.' })
  unsubscribe(@Param('email') email: string) {
    return this.newsletterSubscriptionsService.unsubscribe(email);
  }
}
