import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TiktokUpload { // TODO: rename it to different name, TiktokUploader, etc
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: string;

  @Column()
  language: string;

  @Column({type: 'datetime', nullable: true})
  lastUploadDate: Date;
}