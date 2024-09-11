import { Injectable } from '@nestjs/common';
import { OauthProvider } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { OauthProvider as OAuthProviderEnum } from '../../authentication/dto/provider';

@Injectable()
export class OauthProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(provider: OAuthProviderEnum): Promise<OauthProvider | null> {
    return this.prisma.oauthProvider.findUnique({
      where: {
        name: provider,
      },
    });
  }

  async findAllAsMap(): Promise<Map<string, OauthProvider>> {
    const entities = await this.prisma.oauthProvider.findMany();

    const providersMap: Map<string, OauthProvider> = new Map();
    entities.forEach((entity) => {
      providersMap.set(entity.name, entity);
    });

    return providersMap;
  }
}
