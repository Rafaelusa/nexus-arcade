import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly romsDir = path.join(process.cwd(), 'storage/roms');
  private readonly coversDir = path.join(process.cwd(), 'storage/covers');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    if (!fs.existsSync(this.romsDir)) {
      fs.mkdirSync(this.romsDir, { recursive: true });
    }
    if (!fs.existsSync(this.coversDir)) {
      fs.mkdirSync(this.coversDir, { recursive: true });
    }
  }

  calculateSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async saveRom(file: Express.Multer.File): Promise<{
    storageKey: string;
    fileSizeBytes: number;
    sha256Hash: string;
  }> {
    try {
      const extension = path.extname(file.originalname);
      const uniqueName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${extension}`;
      const filePath = path.join(this.romsDir, uniqueName);

      await fs.promises.writeFile(filePath, file.buffer);

      const sha256Hash = this.calculateSha256(file.buffer);

      return {
        storageKey: uniqueName,
        fileSizeBytes: file.size,
        sha256Hash,
      };
    } catch (error) {
      console.error('[StorageService] Erro ao salvar arquivo de ROM:', error);
      throw new InternalServerErrorException('Falha ao armazenar arquivo binário da ROM.');
    }
  }

  async saveCover(file: Express.Multer.File): Promise<{ storageKey: string; relativeUrl: string }> {
    try {
      const extension = path.extname(file.originalname);
      const uniqueName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${extension}`;
      const filePath = path.join(this.coversDir, uniqueName);

      await fs.promises.writeFile(filePath, file.buffer);

      return {
        storageKey: uniqueName,
        relativeUrl: `/storage/covers/${uniqueName}`,
      };
    } catch (error) {
      console.error('[StorageService] Erro ao salvar imagem de capa:', error);
      throw new InternalServerErrorException('Falha ao armazenar imagem de capa.');
    }
  }

  getRomPath(storageKey: string): string {
    const filePath = path.join(this.romsDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Arquivo de ROM "${storageKey}" não foi encontrado no servidor.`);
    }
    return filePath;
  }

  getCoverPath(storageKey: string): string {
    const filePath = path.join(this.coversDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Imagem de capa "${storageKey}" não foi encontrada no servidor.`);
    }
    return filePath;
  }

  async deleteRom(storageKey: string): Promise<void> {
    try {
      const filePath = path.join(this.romsDir, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`[StorageService] Erro ao excluir arquivo de ROM (${storageKey}):`, error);
    }
  }

  async deleteCover(storageKey: string): Promise<void> {
    try {
      const filePath = path.join(this.coversDir, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`[StorageService] Erro ao excluir imagem de capa (${storageKey}):`, error);
    }
  }
}
